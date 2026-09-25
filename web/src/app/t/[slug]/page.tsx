import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { requestEditAccess, subscribe, unsubscribe } from "@/app/actions/timelines";
import { EntryCard } from "@/components/EntryCard";
import { FilterPanel } from "@/components/FilterPanel";
import { SubmitButton } from "@/components/SubmitButton";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { describeFilter, filterToQuery, parseFilter } from "@/lib/filters";
import { formatDay, formatDayShort } from "@/lib/format";
import { canEdit } from "@/lib/permissions";
import { groupByDay, queryEntries } from "@/lib/timeline-query";
import { getMembership, getTimelineBySlug } from "@/lib/timelines";

export async function generateMetadata({ params }: PageProps<"/t/[slug]">): Promise<Metadata> {
  const t = await getTimelineBySlug((await params).slug);
  return t ? { title: t.title, description: t.description || undefined } : {};
}

export default async function TimelinePage({ params, searchParams }: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  const timeline = await getTimelineBySlug(slug);
  if (!timeline) notFound();

  const sp = await searchParams;
  const filter = parseFilter(sp);
  // The filter form submits every field; redirect to the minimal canonical URL.
  const canonical = filterToQuery(filter);
  const current = new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) => (Array.isArray(v) ? v : v === undefined ? [] : [v]).map((x) => [k, x])),
  ).toString();
  if (current !== canonical.slice(1)) redirect(`/t/${slug}${canonical}`);
  const user = await getCurrentUser();
  const [membership, rows, tagRows] = await Promise.all([
    getMembership(timeline.id, user?.id),
    queryEntries(timeline.id, filter),
    db.select({ name: tags.name }).from(tags).where(eq(tags.timelineId, timeline.id)).orderBy(asc(tags.name)),
  ]);
  const role = membership?.role ?? null;
  const editable = canEdit(role);
  const days = groupByDay(rows);

  return (
    <>
      <header className="timeline-header">
        <h1>{timeline.title}</h1>
        {timeline.description && <p className="muted">{timeline.description}</p>}
        <div className="row">
          {editable && (
            <Link href={`/t/${slug}/add`} className="btn">
              Add a source
            </Link>
          )}
          {role === "owner" && (
            <Link href={`/t/${slug}/manage`} className="btn secondary">
              Manage
            </Link>
          )}
          {!user && (
            <Link href={`/login?next=/t/${slug}`} className="btn secondary">
              Log in to subscribe
            </Link>
          )}
          {user && !role && (
            <form action={subscribe.bind(null, timeline.id)}>
              <SubmitButton className="secondary">Subscribe</SubmitButton>
            </form>
          )}
          {role === "subscriber" && (
            <>
              {membership?.editRequestedAt ? (
                <span className="badge">Edit access requested</span>
              ) : (
                <form action={requestEditAccess.bind(null, timeline.id)}>
                  <SubmitButton className="secondary">Request edit access</SubmitButton>
                </form>
              )}
              <form action={unsubscribe.bind(null, timeline.id)}>
                <SubmitButton className="link">Unsubscribe</SubmitButton>
              </form>
            </>
          )}
          {role === "editor" && <span className="badge">You&apos;re an editor</span>}
        </div>
      </header>

      <div className="timeline-layout">
        <aside className="sidebar" aria-label="Filters">
          <FilterPanel slug={slug} filter={filter} tags={tagRows.map((t) => t.name)} />
        </aside>

        <section aria-label="Timeline">
          <p className="muted small">
            Showing {describeFilter(filter).toLowerCase()} · {rows.length} {rows.length === 1 ? "source" : "sources"}
          </p>
          {days.length > 1 && (
            <nav className="jump" aria-label="Jump to date">
              {days.map((d) => (
                <a key={d.date} href={`#d-${d.date}`}>
                  {formatDayShort(d.date)}
                </a>
              ))}
            </nav>
          )}
          {days.length === 0 ? (
            <div className="card empty">
              {rows.length === 0 && filter.tags.length === 0 && filter.range === "all" && !filter.from && !filter.to
                ? editable
                  ? "Nothing here yet. Add the first source."
                  : "Nothing here yet."
                : "No sources match these filters."}
            </div>
          ) : (
            <ol className="days">
              {days.map((d) => (
                <li key={d.date} id={`d-${d.date}`} className="day">
                  <h2>
                    <time dateTime={d.date}>{formatDay(d.date)}</time>
                  </h2>
                  <div className="day-entries">
                    {d.entries.map((e) => (
                      <EntryCard key={e.id} entry={e} slug={slug} editable={editable} />
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
