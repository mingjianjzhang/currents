import Link from "next/link";
import { TimelineCard } from "@/components/TimelineCard";
import { getCurrentUser } from "@/lib/auth";
import { listTimelines } from "@/lib/timelines";

export default async function HomePage() {
  const [timelines, user] = await Promise.all([listTimelines(), getCurrentUser()]);
  return (
    <>
      <section className="hero">
        <h1>The history behind the headlines.</h1>
        <p>
          Currents collects primary sources (articles, videos and books) into timelines, so you can trace how a
          story got to where it is today.
        </p>
        <Link href={user ? "/timelines/new" : "/signup?next=/timelines/new"} className="btn">
          Start a timeline
        </Link>
      </section>

      <h2>Timelines</h2>
      {timelines.length === 0 ? (
        <div className="card empty">No timelines yet. Be the first to start one.</div>
      ) : (
        <div className="timeline-grid">
          {timelines.map((t) => (
            <TimelineCard key={t.id} timeline={t} />
          ))}
        </div>
      )}
    </>
  );
}
