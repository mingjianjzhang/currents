import Link from "next/link";
import { formatDayShort } from "@/lib/format";

export function TimelineCard({
  timeline,
  badge,
}: {
  timeline: { slug: string; title: string; description: string; entryCount: number; latest: string | null };
  badge?: string;
}) {
  return (
    <Link href={`/t/${timeline.slug}`} className="card timeline-card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3>{timeline.title}</h3>
        {badge && <span className="badge">{badge}</span>}
      </div>
      {timeline.description && <p className="muted small">{timeline.description}</p>}
      <span className="small muted">
        {timeline.entryCount} {timeline.entryCount === 1 ? "source" : "sources"}
        {timeline.latest && ` · through ${formatDayShort(timeline.latest)}`}
      </span>
    </Link>
  );
}
