import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { entries, entryTags, tags, type Entry } from "@/db/schema";
import { dateBounds, type TimelineFilter } from "./filters";

export type EntryWithTags = Entry & { tags: string[] };
export interface DayGroup {
  date: string;
  entries: EntryWithTags[];
}

const LATEST_COUNT = 5;

export async function queryEntries(timelineId: number, filter: TimelineFilter): Promise<EntryWithTags[]> {
  const conditions: SQL[] = [eq(entries.timelineId, timelineId)];

  const { from, to } = dateBounds(filter);
  if (from) conditions.push(gte(entries.occurredOn, from));
  if (to) conditions.push(lte(entries.occurredOn, to));

  if (filter.tags.length) {
    const found = await db
      .select({ id: tags.id })
      .from(tags)
      .where(and(eq(tags.timelineId, timelineId), inArray(tags.name, filter.tags)));
    const tagIds = found.map((t) => t.id);
    // "all" can't match if any requested tag doesn't exist; "any" needs at least one.
    if (tagIds.length === 0 || (filter.match === "all" && tagIds.length < filter.tags.length)) return [];

    const matching =
      filter.match === "any"
        ? db.select({ id: entryTags.entryId }).from(entryTags).where(inArray(entryTags.tagId, tagIds))
        : db
            .select({ id: entryTags.entryId })
            .from(entryTags)
            .where(inArray(entryTags.tagId, tagIds))
            .groupBy(entryTags.entryId)
            .having(sql`count(*) = ${tagIds.length}`);
    conditions.push(inArray(entries.id, matching));
  }

  const latest = filter.range === "latest" && !from && !to;
  const rows = await db
    .select()
    .from(entries)
    .where(and(...conditions))
    .orderBy(
      latest ? desc(entries.occurredOn) : asc(entries.occurredOn),
      latest ? desc(entries.id) : asc(entries.id),
    )
    .limit(latest ? LATEST_COUNT : 1000);
  if (latest) rows.reverse();

  return attachTags(rows);
}

async function attachTags(rows: Entry[]): Promise<EntryWithTags[]> {
  if (rows.length === 0) return [];
  const links = await db
    .select({ entryId: entryTags.entryId, name: tags.name })
    .from(entryTags)
    .innerJoin(tags, eq(tags.id, entryTags.tagId))
    .where(
      inArray(
        entryTags.entryId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(tags.name));
  const byEntry = new Map<number, string[]>();
  for (const l of links) byEntry.set(l.entryId, [...(byEntry.get(l.entryId) ?? []), l.name]);
  return rows.map((r) => ({ ...r, tags: byEntry.get(r.id) ?? [] }));
}

export function groupByDay(rows: EntryWithTags[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const row of rows) {
    const last = groups.at(-1);
    if (last?.date === row.occurredOn) last.entries.push(row);
    else groups.push({ date: row.occurredOn, entries: [row] });
  }
  return groups;
}

/** Find or create tags by name for a timeline and link them to an entry. */
export async function setEntryTags(
  tx: Pick<typeof db, "insert" | "select">,
  timelineId: number,
  entryId: number,
  names: string[],
) {
  if (names.length === 0) return;
  await tx
    .insert(tags)
    .values(names.map((name) => ({ timelineId, name })))
    .onConflictDoNothing();
  const rows = await tx
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.timelineId, timelineId), inArray(tags.name, names)));
  await tx
    .insert(entryTags)
    .values(rows.map((t) => ({ entryId, tagId: t.id })))
    .onConflictDoNothing();
}
