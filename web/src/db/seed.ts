// Seeds a demo user and a sample timeline. Safe to re-run: it skips if the demo user exists.
import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashPassword } from "../lib/password";
import * as schema from "./schema";

const { users, timelines, timelineMembers, entries, tags, entryTags } = schema;
const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema, casing: "snake_case" });

const [existing] = await db.select().from(users).where(eq(users.username, "demo"));
if (existing) {
  console.log("Seed data already present (user: demo / password: currents-demo)");
  await client.end();
  process.exit(0);
}

await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ username: "demo", email: "demo@example.com", name: "Demo Curator", passwordHash: await hashPassword("currents-demo") })
    .returning();
  const [timeline] = await tx
    .insert(timelines)
    .values({
      slug: "arab-spring",
      title: "The Arab Spring",
      description: "How protests that began in Tunisia in December 2010 spread across the region.",
    })
    .returning();
  await tx.insert(timelineMembers).values({ timelineId: timeline.id, userId: user.id, role: "owner" });

  const tagNames = ["tunisia", "egypt", "libya", "syria", "protests", "analysis"];
  const tagRows = await tx
    .insert(tags)
    .values(tagNames.map((name) => ({ timelineId: timeline.id, name })))
    .returning();
  const tagId = (n: string) => tagRows.find((t) => t.name === n)!.id;

  const sample: (typeof entries.$inferInsert & { tagList: string[] })[] = [
    {
      timelineId: timeline.id,
      kind: "article",
      title: "Tunisia: Self-immolation in Sidi Bouzid",
      url: "https://en.wikipedia.org/wiki/Mohamed_Bouazizi",
      source: "Wikipedia",
      description: "A street vendor's protest in a provincial town becomes the spark for nationwide demonstrations.",
      occurredOn: "2010-12-17",
      tagList: ["tunisia", "protests"],
    },
    {
      timelineId: timeline.id,
      kind: "article",
      title: "Ben Ali flees Tunisia",
      url: "https://en.wikipedia.org/wiki/Tunisian_revolution",
      source: "Wikipedia",
      description: "After four weeks of protests, President Zine El Abidine Ben Ali leaves the country.",
      occurredOn: "2011-01-14",
      tagList: ["tunisia"],
    },
    {
      timelineId: timeline.id,
      kind: "article",
      title: "Protesters fill Tahrir Square",
      url: "https://en.wikipedia.org/wiki/Egyptian_revolution_of_2011",
      source: "Wikipedia",
      description: "The 'Day of Revolt' brings tens of thousands to central Cairo.",
      occurredOn: "2011-01-25",
      tagList: ["egypt", "protests"],
    },
    {
      timelineId: timeline.id,
      kind: "article",
      title: "Mubarak resigns",
      url: "https://en.wikipedia.org/wiki/Hosni_Mubarak",
      source: "Wikipedia",
      description: "After 18 days of protest, Hosni Mubarak hands power to the military.",
      occurredOn: "2011-02-11",
      tagList: ["egypt"],
    },
    {
      timelineId: timeline.id,
      kind: "article",
      title: "Uprising begins in Benghazi",
      url: "https://en.wikipedia.org/wiki/Libyan_civil_war_(2011)",
      source: "Wikipedia",
      description: "Protests in eastern Libya escalate into armed conflict.",
      occurredOn: "2011-02-15",
      tagList: ["libya", "protests"],
    },
    {
      timelineId: timeline.id,
      kind: "article",
      title: "Protests in Daraa",
      url: "https://en.wikipedia.org/wiki/Daraa_protests",
      source: "Wikipedia",
      description: "Arrests of teenagers over anti-government graffiti trigger demonstrations in southern Syria.",
      occurredOn: "2011-03-18",
      tagList: ["syria", "protests"],
    },
    {
      timelineId: timeline.id,
      kind: "book",
      title: "The Arab Uprising: The Unfinished Revolutions of the New Middle East",
      isbn: "9781610390842",
      source: "Marc Lynch",
      description: "An early scholarly account of the uprisings and their regional consequences.",
      occurredOn: "2012-03-27",
      tagList: ["analysis"],
    },
  ];

  for (const { tagList, ...values } of sample) {
    const [entry] = await tx.insert(entries).values({ ...values, createdBy: user.id }).returning();
    await tx.insert(entryTags).values(tagList.map((t) => ({ entryId: entry.id, tagId: tagId(t) })));
  }
});

console.log("Seeded. Log in as demo / currents-demo");
await client.end();
