"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, like } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { timelineMembers, timelines } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formObject, fromZodError, slugify, type FormState } from "@/lib/forms";
import { canManage, ForbiddenError, getRole } from "@/lib/permissions";

const timelineSchema = z.object({
  title: z.string().trim().min(2, "At least 2 characters").max(120),
  description: z.string().trim().max(1000).default(""),
});

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  const existing = new Set(
    (await db.select({ slug: timelines.slug }).from(timelines).where(like(timelines.slug, `${base}%`))).map(
      (r) => r.slug,
    ),
  );
  if (!existing.has(base)) return base;
  for (let i = 2; ; i++) if (!existing.has(`${base}-${i}`)) return `${base}-${i}`;
}

export async function createTimeline(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/timelines/new");
  const raw = formObject(formData);
  const parsed = timelineSchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error, raw);

  const slug = await uniqueSlug(parsed.data.title);
  await db.transaction(async (tx) => {
    const [t] = await tx
      .insert(timelines)
      .values({ ...parsed.data, slug })
      .returning({ id: timelines.id });
    await tx.insert(timelineMembers).values({ timelineId: t.id, userId: user.id, role: "owner" });
  });
  redirect(`/t/${slug}`);
}

async function loadTimeline(timelineId: number) {
  const [t] = await db.select().from(timelines).where(eq(timelines.id, timelineId)).limit(1);
  if (!t) throw new Error("Timeline not found");
  return t;
}

const memberKey = (timelineId: number, userId: number) =>
  and(eq(timelineMembers.timelineId, timelineId), eq(timelineMembers.userId, userId));

export async function subscribe(timelineId: number) {
  const t = await loadTimeline(timelineId);
  const user = await requireUser(`/t/${t.slug}`);
  await db.insert(timelineMembers).values({ timelineId, userId: user.id, role: "subscriber" }).onConflictDoNothing();
  revalidatePath(`/t/${t.slug}`);
}

export async function unsubscribe(timelineId: number) {
  const t = await loadTimeline(timelineId);
  const user = await requireUser(`/t/${t.slug}`);
  await db.delete(timelineMembers).where(and(memberKey(timelineId, user.id), eq(timelineMembers.role, "subscriber")));
  revalidatePath(`/t/${t.slug}`);
}

export async function requestEditAccess(timelineId: number) {
  const t = await loadTimeline(timelineId);
  const user = await requireUser(`/t/${t.slug}`);
  await db
    .update(timelineMembers)
    .set({ editRequestedAt: new Date() })
    .where(and(memberKey(timelineId, user.id), eq(timelineMembers.role, "subscriber")));
  revalidatePath(`/t/${t.slug}`);
}

export async function respondToRequest(timelineId: number, userId: number, approve: boolean) {
  const t = await loadTimeline(timelineId);
  const user = await requireUser(`/t/${t.slug}/manage`);
  if (!canManage(await getRole(timelineId, user.id))) throw new ForbiddenError();
  await db
    .update(timelineMembers)
    .set(approve ? { role: "editor", editRequestedAt: null } : { editRequestedAt: null })
    .where(and(memberKey(timelineId, userId), eq(timelineMembers.role, "subscriber")));
  revalidatePath(`/t/${t.slug}/manage`);
}

export async function removeEditor(timelineId: number, userId: number) {
  const t = await loadTimeline(timelineId);
  const user = await requireUser(`/t/${t.slug}/manage`);
  if (!canManage(await getRole(timelineId, user.id))) throw new ForbiddenError();
  await db
    .update(timelineMembers)
    .set({ role: "subscriber" })
    .where(and(memberKey(timelineId, userId), eq(timelineMembers.role, "editor")));
  revalidatePath(`/t/${t.slug}/manage`);
}

export async function deleteTimeline(timelineId: number) {
  const t = await loadTimeline(timelineId);
  const user = await requireUser(`/t/${t.slug}/manage`);
  if (!canManage(await getRole(timelineId, user.id))) throw new ForbiddenError();
  // Entries, tags and memberships cascade.
  await db.delete(timelines).where(eq(timelines.id, timelineId));
  redirect("/dashboard");
}
