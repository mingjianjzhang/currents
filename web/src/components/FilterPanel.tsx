import Link from "next/link";
import { RANGES, type Range, type TimelineFilter } from "@/lib/filters";

// A plain GET form: filters live in the URL, so views are shareable and work without JS.
export function FilterPanel({ slug, filter, tags }: { slug: string; filter: TimelineFilter; tags: string[] }) {
  const active = filter.range !== "all" || !!filter.from || !!filter.to || filter.tags.length > 0;
  // Collapsible on small screens; CSS keeps it always open on desktop.
  return (
    <details className="card filters" open={active}>
      <summary>Filter this timeline{active && " (active)"}</summary>
      <form method="get" action={`/t/${slug}`}>
        <fieldset>
          <legend>Time span</legend>
          <select name="range" defaultValue={filter.range} aria-label="Time span">
            {(Object.keys(RANGES) as Range[]).map((r) => (
              <option key={r} value={r}>
                {RANGES[r]}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset>
          <legend>Or a date range</legend>
          <div className="field">
            <label htmlFor="from" className="small">
              From
            </label>
            <input id="from" name="from" type="date" defaultValue={filter.from} />
          </div>
          <div className="field">
            <label htmlFor="to" className="small">
              To
            </label>
            <input id="to" name="to" type="date" defaultValue={filter.to} />
          </div>
        </fieldset>
        {tags.length > 0 && (
          <fieldset>
            <legend>Tags</legend>
            <div className="row small" style={{ marginBottom: "0.5rem" }}>
              <label className="check">
                <input type="radio" name="match" value="all" defaultChecked={filter.match === "all"} /> Match all
              </label>
              <label className="check">
                <input type="radio" name="match" value="any" defaultChecked={filter.match === "any"} /> Match any
              </label>
            </div>
            <div className="tag-list">
              {tags.map((t) => (
                <label key={t} className="check">
                  <input type="checkbox" name="tag" value={t} defaultChecked={filter.tags.includes(t)} /> {t}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="row">
          <button type="submit">Apply</button>
          <Link href={`/t/${slug}`} className="small">
            Reset
          </Link>
        </div>
      </form>
    </details>
  );
}
