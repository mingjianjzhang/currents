"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { entries, entryKind, timelines } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { isIsoDate } from "@/lib/filters";
import { formObject, fromZodError, parseTagList, type FormState } from "@/lib/forms";
import {
  fetchBookMetadata,
  fetchPageMetadata,
  normalizeIsbn,
  MetadataError,
  type PageMetadata,
} from "@/lib/metadata";
import { canEdit, ForbiddenError, getRole } from "@/lib/permissions";
import { setEntryTags } from "@/lib/timeline-query";

const httpUrl = z
  .url({ protocol: /^https?$/, message: "Enter a full http(s) link" })
  .max(2000);

const entrySchema = z
  .object({
    kind: z.enum(entryKind.enumValues),
    title: z.string().trim().min(1, "Required").max(300),
    url: z.union([z.literal(""), httpUrl]),
    isbn: z.string().trim().default(""),
    description: z.string().trim().max(5000).default(""),
    source: z.string().trim().max(200).default(""),
    imageUrl: z.union([z.literal(""), httpUrl]).default(""),
    occurredOn: z.string().refine(isIsoDate, "Pick a date"),
    tags: z.string().default(""),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "book") {
      if (!normalizeIsbn(v.isbn)) ctx.addIssue({ code: "custom", path: ["isbn"], message: "Enter a 10 or 13 digit ISBN" });
    } else if (!v.url) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Required" });
    }
  });

async function requireEditor(timelineId: number) {
  const [t] = await db.select().from(timelines).where(eq(timelines.id, timelineId)).limit(1);
  if (!t) throw new Error("Timeline not found");
  const user = await requireUser(`/t/${t.slug}`);
  if (!canEdit(await getRole(t.id, user.id))) throw new ForbiddenError();
  return { timeline: t, user };
}

export async function createEntry(timelineId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const { timeline, user } = await requireEditor(timelineId);
  const parsed = entrySchema.safeParse(formObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);
  const v = parsed.data;

  await db.transaction(async (tx) => {
    const [entry] = await tx
      .insert(entries)
      .values({
        timelineId,
        kind: v.kind,
        title: v.title,
        url: v.url || null,
        isbn: v.kind === "book" ? normalizeIsbn(v.isbn) : null,
        description: v.description,
        source: v.source,
        imageUrl: v.imageUrl || null,
        occurredOn: v.occurredOn,
        createdBy: user.id,
      })
      .returning({ id: entries.id });
    await setEntryTags(tx, timelineId, entry.id, parseTagList(v.tags));
  });

  revalidatePath(`/t/${timeline.slug}`);
  return { message: `Added “${v.title}”.` };
}

export async function deleteEntry(timelineId: number, entryId: number) {
  const { timeline } = await requireEditor(timelineId);
  await db.delete(entries).where(and(eq(entries.id, entryId), eq(entries.timelineId, timelineId)));
  revalidatePath(`/t/${timeline.slug}`);
}

export type LookupResult = { ok: true; data: PageMetadata } | { ok: false; error: string };

export async function lookupMetadata(kind: string, value: string): Promise<LookupResult> {
  // Signed-in users only, so this can't be used as an anonymous open proxy.
  if (!(await getCurrentUser())) return { ok: false, error: "Sign in first." };
  try {
    if (kind === "book") {
      const isbn = normalizeIsbn(value);
      if (!isbn) return { ok: false, error: "Enter a 10 or 13 digit ISBN." };
      const data = await fetchBookMetadata(isbn);
      return data ? { ok: true, data } : { ok: false, error: "No book found for that ISBN." };
    }
    return { ok: true, data: await fetchPageMetadata(value.trim()) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof MetadataError ? err.message : "Couldn't read that page. You can fill in the details by hand.",
    };
  }
}
