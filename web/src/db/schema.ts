import {
  pgTable,
  pgEnum,
  integer,
  text,
  timestamp,
  date,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// The Rails app had separate `admins`, `timeline_admins` and `timeline_users`
// tables with magic integer status columns. One membership row with a role
// covers the same ground.
export const memberRole = pgEnum("member_role", ["owner", "editor", "subscriber"]);

// Replaces the `categories` table, whose rows were referenced by hardcoded id
// (1 = article, 2 = video, 4 = book) throughout the views.
export const entryKind = pgEnum("entry_kind", ["article", "video", "book"]);

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  name: text().notNull(),
  passwordHash: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    // sha256 of the cookie token, so a database leak doesn't leak live sessions.
    id: text().primaryKey(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [index().on(t.userId)],
);

export const timelines = pgTable("timelines", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: text().notNull().unique(),
  title: text().notNull(),
  description: text().notNull().default(""),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const timelineMembers = pgTable(
  "timeline_members",
  {
    timelineId: integer()
      .notNull()
      .references(() => timelines.id, { onDelete: "cascade" }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRole().notNull(),
    // Set when a subscriber asks to become an editor; cleared on approve/decline.
    editRequestedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.timelineId, t.userId] }), index().on(t.userId)],
);

// Was `content_nodes`. The old many-to-many to timelines was only ever used
// one-to-one, and `sources`/`images` were lookup tables for single strings.
export const entries = pgTable(
  "entries",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    timelineId: integer()
      .notNull()
      .references(() => timelines.id, { onDelete: "cascade" }),
    kind: entryKind().notNull(),
    title: text().notNull(),
    // Articles and videos have a URL; books have an ISBN (URL optional).
    url: text(),
    isbn: text(),
    description: text().notNull().default(""),
    source: text().notNull().default(""),
    imageUrl: text(),
    occurredOn: date({ mode: "string" }).notNull(),
    createdBy: integer().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.timelineId, t.occurredOn)],
);

export const tags = pgTable(
  "tags",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    timelineId: integer()
      .notNull()
      .references(() => timelines.id, { onDelete: "cascade" }),
    name: text().notNull(),
  },
  (t) => [uniqueIndex().on(t.timelineId, t.name)],
);

export const entryTags = pgTable(
  "entry_tags",
  {
    entryId: integer()
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    tagId: integer()
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.tagId] }), index().on(t.tagId)],
);

export type User = typeof users.$inferSelect;
export type Timeline = typeof timelines.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type MemberRole = (typeof memberRole.enumValues)[number];
export type EntryKind = (typeof entryKind.enumValues)[number];
