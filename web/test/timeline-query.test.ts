// Runs against a real Postgres. Set TEST_DATABASE_URL to enable; the database is wiped.
import { beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("queryEntries (postgres)", async () => {
  process.env.DATABASE_URL = url;
  const { sql } = await import("drizzle-orm");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const { db } = await import("@/db");
  const { entries, timelines } = await import("@/db/schema");
  const { parseFilter } = await import("@/lib/filters");
  const { queryEntries, groupByDay, setEntryTags } = await import("@/lib/timeline-query");

  let timelineId = 0;
  const q = async (sp: Record<string, string | string[]>) =>
    (await queryEntries(timelineId, parseFilter(sp))).map((e) => e.title);

  beforeAll(async () => {
    await db.execute(sql`drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;`);
    await migrate(db, { migrationsFolder: "./drizzle" });
    const [t] = await db.insert(timelines).values({ slug: "t", title: "T" }).returning();
    timelineId = t.id;
    const add = async (title: string, occurredOn: string, tags: string[]) => {
      const [e] = await db
        .insert(entries)
        .values({ timelineId, kind: "article", title, url: "https://example.com", occurredOn })
        .returning();
      await setEntryTags(db, timelineId, e.id, tags);
    };
    await add("a", "2011-01-14", ["tunisia"]);
    await add("b", "2011-01-25", ["egypt", "protests"]);
    await add("c", "2011-01-25", ["egypt"]);
    await add("d", "2011-03-18", ["syria", "protests"]);
    await add("e", "2012-06-01", []);
    await add("f", "2013-01-01", []);
  });

  it("returns everything in date order with tags", async () => {
    const rows = await queryEntries(timelineId, parseFilter({}));
    expect(rows.map((r) => r.title)).toEqual(["a", "b", "c", "d", "e", "f"]);
    expect(rows[1].tags).toEqual(["egypt", "protests"]);
    expect(groupByDay(rows).map((g) => [g.date, g.entries.length])).toEqual([
      ["2011-01-14", 1],
      ["2011-01-25", 2],
      ["2011-03-18", 1],
      ["2012-06-01", 1],
      ["2013-01-01", 1],
    ]);
  });

  it("filters by date range", async () => {
    expect(await q({ from: "2011-01-25", to: "2011-03-18" })).toEqual(["b", "c", "d"]);
  });

  it("matches all tags", async () => {
    expect(await q({ tag: ["egypt", "protests"] })).toEqual(["b"]);
    expect(await q({ tag: ["egypt", "nope"] })).toEqual([]);
  });

  it("matches any tag", async () => {
    expect(await q({ tag: ["tunisia", "syria"], match: "any" })).toEqual(["a", "d"]);
    expect(await q({ tag: ["tunisia", "nope"], match: "any" })).toEqual(["a"]);
  });

  it("returns the latest five in chronological order", async () => {
    expect(await q({ range: "latest" })).toEqual(["b", "c", "d", "e", "f"]);
  });

  it("combines tags and dates", async () => {
    expect(await q({ tag: "protests", from: "2011-02-01" })).toEqual(["d"]);
  });

  it("does not create duplicate tags", async () => {
    const [e] = await db
      .insert(entries)
      .values({ timelineId, kind: "article", title: "g", url: "https://example.com", occurredOn: "2014-01-01" })
      .returning();
    await setEntryTags(db, timelineId, e.id, ["egypt", "new"]);
    const tags = await db.execute(sql`select name from tags where timeline_id = ${timelineId} order by name`);
    expect(tags.map((r) => r.name)).toEqual(["egypt", "new", "protests", "syria", "tunisia"]);
  });
});
