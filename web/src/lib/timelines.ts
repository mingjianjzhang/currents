import "server-only";
import { and, count, desc, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { entries, timelineMembers, timelines } from "@/db/schema";

const summaryFields = {
  id: timelines.id,
  slug: timelines.slug,
  title: timelines.title,
  description: timelines.description,
  entryCount: count(entries.id),
  latest: max(entries.occurredOn),
};

export type TimelineSummary = Awaited<ReturnType<typeof listTimelines>>[number];

export function listTimelines() {
  return db
    .select(summaryFields)
    .from(timelines)
    .leftJoin(entries, eq(entries.timelineId, timelines.id))
    .groupBy(timelines.id)
    .orderBy(sql`max(${entries.occurredOn}) desc nulls last`, desc(timelines.createdAt));
}

export function listTimelinesForUser(userId: number) {
  return db
    .select({ ...summaryFields, role: timelineMembers.role })
    .from(timelineMembers)
    .innerJoin(timelines, eq(timelines.id, timelineMembers.timelineId))
    .leftJoin(entries, eq(entries.timelineId, timelines.id))
    .where(eq(timelineMembers.userId, userId))
    .groupBy(timelines.id, timelineMembers.role)
    .orderBy(timelines.title);
}

export async function getTimelineBySlug(slug: string) {
  const [t] = await db.select().from(timelines).where(eq(timelines.slug, slug)).limit(1);
  return t ?? null;
}

export async function getMembership(timelineId: number, userId: number | undefined) {
  if (!userId) return null;
  const [m] = await db
    .select({ role: timelineMembers.role, editRequestedAt: timelineMembers.editRequestedAt })
    .from(timelineMembers)
    .where(and(eq(timelineMembers.timelineId, timelineId), eq(timelineMembers.userId, userId)))
    .limit(1);
  return m ?? null;
}
