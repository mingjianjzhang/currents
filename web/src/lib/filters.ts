// Parses timeline view filters from the URL. Kept free of database imports so it
// can be unit tested and shared with client components.

export const RANGES = {
  all: "From the start",
  month: "This month",
  "6m": "Last six months",
  "2y": "Last two years",
  latest: "Latest five",
} as const;

export type Range = keyof typeof RANGES;
export type TagMatch = "all" | "any";

export interface TimelineFilter {
  range: Range;
  from?: string;
  to?: string;
  tags: string[];
  match: TagMatch;
}

type SearchParams = Record<string, string | string[] | undefined>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const all = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function parseFilter(sp: SearchParams): TimelineFilter {
  const rawRange = first(sp.range);
  const range: Range = rawRange && rawRange in RANGES ? (rawRange as Range) : "all";
  const from = first(sp.from);
  const to = first(sp.to);
  const tags = [...new Set(all(sp.tag).map((t) => t.trim()).filter(Boolean))];
  return {
    range,
    from: from && isIsoDate(from) ? from : undefined,
    to: to && isIsoDate(to) ? to : undefined,
    tags,
    match: first(sp.match) === "any" ? "any" : "all",
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Inclusive date bounds for a filter. Explicit from/to override the preset range. */
export function dateBounds(filter: TimelineFilter, today = new Date()): { from?: string; to?: string } {
  if (filter.from || filter.to) return { from: filter.from, to: filter.to };
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const d = today.getUTCDate();
  switch (filter.range) {
    case "month":
      return { from: iso(new Date(Date.UTC(y, m, 1))) };
    case "6m":
      return { from: iso(new Date(Date.UTC(y, m - 6, d))) };
    case "2y":
      return { from: iso(new Date(Date.UTC(y - 2, m, d))) };
    default:
      return {};
  }
}

export function describeFilter(filter: TimelineFilter): string {
  const parts: string[] = [];
  if (filter.from || filter.to) {
    parts.push(`${filter.from ?? "the start"} to ${filter.to ?? "today"}`);
  } else {
    parts.push(RANGES[filter.range]);
  }
  if (filter.tags.length) {
    parts.push(`tagged ${filter.tags.join(filter.match === "any" ? " or " : " and ")}`);
  }
  return parts.join(", ");
}

export function filterToQuery(filter: Partial<TimelineFilter>): string {
  const q = new URLSearchParams();
  if (filter.range && filter.range !== "all") q.set("range", filter.range);
  if (filter.from) q.set("from", filter.from);
  if (filter.to) q.set("to", filter.to);
  for (const t of filter.tags ?? []) q.append("tag", t);
  if (filter.tags?.length && filter.match === "any") q.set("match", "any");
  const s = q.toString();
  return s ? `?${s}` : "";
}
