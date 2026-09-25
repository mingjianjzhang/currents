# Currents

Curated timelines of primary sources (articles, videos and books) that explain the history behind current events.

This is a Next.js + TypeScript rewrite of the original 2016 Rails prototype (still in the repo root for reference).

## Stack

- **Next.js 16** (App Router, React Server Components, Server Actions)
- **Postgres** via **Drizzle ORM** (`postgres` driver); migrations are committed in `drizzle/`
- **zod** for input validation, **Vitest** for tests
- No auth vendor: passwords are hashed with scrypt (`node:crypto`) and sessions live in a `sessions` table behind an httpOnly cookie

## Getting started

```bash
cp .env.example .env        # point DATABASE_URL at any Postgres 14+
npm install
npm run db:migrate
npm run db:seed             # optional: demo timeline, log in as demo / currents-demo
npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests. Set `TEST_DATABASE_URL` to also run the Postgres query tests (that database is wiped). |
| `npm run db:generate` | Generate a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |

## Data model

```
users ─┬─< sessions
       └─< timeline_members >── timelines ─┬─< entries >─< entry_tags >─┐
            (role: owner | editor |        └─< tags ───────────────────┘
             subscriber, edit_requested_at)
```

Compared with the Rails schema:

- `admins`, `timeline_admins` and `timeline_users` became one `timeline_members` table with a `role` enum.
  An edit request is a timestamp on a subscriber's row.
- `content_nodes` became `entries`, owned directly by one timeline (the old many-to-many was only ever used one-to-one).
- `categories` (referenced by hardcoded id in views) became the `entry_kind` enum: `article | video | book`.
- `sources` and `images` lookup tables became plain `source` / `image_url` columns.
- `snapshots` were half-built and are gone. So is the hardcoded D3 force graph demo.

## Layout

```
src/
  app/                 routes: / (browse), /t/[slug], /t/[slug]/add, /t/[slug]/manage,
                       /dashboard, /timelines/new, /login, /signup
  app/actions/         server actions (auth, timelines, entries); every mutation checks role
  components/          UI
  db/                  schema, client, migrate + seed scripts
  lib/
    filters.ts         URL <-> filter parsing (range presets, date range, tags with AND/OR)
    timeline-query.ts  filtered entry query + tag handling
    metadata.ts        link preview fetcher with SSRF protection; Google Books lookup by ISBN
    auth.ts, password.ts, permissions.ts
test/                  vitest
```

## Security notes

Issues from the old app and how they're handled here:

- **Link previews** (`lib/metadata.ts`): the old crawler passed user input to Ruby's `Kernel#open`, which allowed
  command execution and requests to internal hosts. Now only public `http(s)` hosts are fetched. IP literals are
  checked up front, resolved addresses are checked at connect time (so DNS rebinding can't point it at a private
  address), redirects are re-validated on every hop, and there's a timeout and a 1 MB size cap. Signed-in users only.
- **SQL**: all queries go through Drizzle with bound parameters. No string interpolation.
- **Authorization**: only owners and editors can add or remove entries. Only owners can approve editors or delete
  a timeline. This is enforced in the server actions, not just hidden in the UI.
- **Secrets**: the WorldCat API keys that were committed in the Rails app are gone. Books link to WorldCat search
  instead, so no key is needed. **Those old keys are still in git history and should be revoked.**
- CSRF: Server Actions check the request `Origin`. Session cookies are `httpOnly`, `SameSite=Lax`, and `Secure` in production.
