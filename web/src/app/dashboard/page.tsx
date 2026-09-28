import type { Metadata } from "next";
import Link from "next/link";
import { TimelineCard } from "@/components/TimelineCard";
import { requireUser } from "@/lib/auth";
import { listTimelinesForUser } from "@/lib/timelines";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const mine = await listTimelinesForUser(user.id);
  const curating = mine.filter((t) => t.role !== "subscriber");
  const following = mine.filter((t) => t.role === "subscriber");

  return (
    <>
      <h1>Hi, {user.name.split(" ")[0]}</h1>
      <section className="section">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h2 style={{ margin: 0 }}>Timelines you curate</h2>
          <Link href="/timelines/new" className="btn secondary">
            New timeline
          </Link>
        </div>
        {curating.length === 0 ? (
          <p className="muted">You aren&apos;t curating any timelines yet.</p>
        ) : (
          <div className="timeline-grid">
            {curating.map((t) => (
              <TimelineCard key={t.id} timeline={t} badge={t.role} />
            ))}
          </div>
        )}
      </section>
      <section className="section">
        <h2>Following</h2>
        {following.length === 0 ? (
          <p className="muted">
            Subscribe to a timeline from the <Link href="/">browse page</Link> to keep up with it here.
          </p>
        ) : (
          <div className="timeline-grid">
            {following.map((t) => (
              <TimelineCard key={t.id} timeline={t} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
