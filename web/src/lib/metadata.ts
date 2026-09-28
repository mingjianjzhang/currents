import dns from "node:dns";
import net from "node:net";
import { Agent, fetch } from "undici";

// Fetches a user-supplied URL to prefill an entry's title, description and image.
// Replaces the Rails Crawler, which passed input straight to Kernel#open.
// Only public http(s) addresses are reachable: IP literals are checked up
// front, and hostnames are checked at connect time (so DNS rebinding can't
// swap in a private address after validation). Redirects are followed by hand
// so every hop is checked.

export interface PageMetadata {
  title: string;
  description: string;
  imageUrl: string | null;
  source: string;
}

const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 4;
const TIMEOUT_MS = 6_000;

const blocked = new net.BlockList();
for (const [addr, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(addr, prefix, "ipv4");
}
for (const [addr, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96], // NAT64
  ["100::", 64],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  blocked.addSubnet(addr, prefix, "ipv6");
}

export function isPublicAddress(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 0) return false;
  // IPv4-mapped IPv6 (::ffff:a.b.c.d or ::ffff:7f00:1): judge the embedded IPv4.
  // (A ::ffff:0:0/96 rule can't be used: BlockList matches it against every IPv4 address.)
  const mapped = family === 6 ? ip.toLowerCase().match(/^(?:0*:)*:?ffff:(.+)$/)?.[1] : undefined;
  if (mapped) {
    if (net.isIPv4(mapped)) return isPublicAddress(mapped);
    const [hi, lo] = mapped.split(":").map((h) => parseInt(h, 16));
    if (Number.isFinite(hi) && Number.isFinite(lo)) {
      return isPublicAddress([hi >> 8, hi & 255, lo >> 8, lo & 255].join("."));
    }
    return false;
  }
  return !blocked.check(ip, family === 4 ? "ipv4" : "ipv6");
}

/** Errors whose message is safe to show the user. */
export class MetadataError extends Error {}
export class UnsafeUrlError extends MetadataError {}

export function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("That doesn't look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https links are supported.");
  }
  if (url.username || url.password) throw new UnsafeUrlError("Links with credentials aren't supported.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host) && !isPublicAddress(host)) throw new UnsafeUrlError("That address isn't reachable.");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw new UnsafeUrlError("That address isn't reachable.");
  }
  return url;
}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | dns.LookupAddress[],
  family?: number,
) => void;

export function guardedLookup(hostname: string, options: dns.LookupOptions, callback: LookupCallback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, []);
    const list = addresses as dns.LookupAddress[];
    if (list.length === 0 || list.some((a) => !isPublicAddress(a.address))) {
      return callback(Object.assign(new Error(`Refusing to connect to ${hostname}`), { code: "EBLOCKED" }), []);
    }
    if (options.all) callback(null, list);
    else callback(null, list[0].address, list[0].family);
  });
}

const agent = new Agent({ connect: { lookup: guardedLookup as never, timeout: TIMEOUT_MS } });

async function readLimited(body: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!body) return "";
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, MAX_BYTES));
}

export async function fetchPageMetadata(raw: string): Promise<PageMetadata> {
  let url = assertSafeUrl(raw);
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  for (let hop = 0; ; hop++) {
    const res = await fetch(url, {
      dispatcher: agent,
      redirect: "manual",
      signal,
      headers: { "user-agent": "CurrentsBot/1.0 (+metadata preview)", accept: "text/html" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      await res.body?.cancel();
      if (hop >= MAX_REDIRECTS) throw new UnsafeUrlError("Too many redirects.");
      url = assertSafeUrl(new URL(res.headers.get("location")!, url).toString());
      continue;
    }
    if (!res.ok) throw new MetadataError(`The page responded with ${res.status}.`);
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html")) {
      await res.body?.cancel();
      throw new MetadataError("That link isn't a web page.");
    }
    const html = await readLimited(res.body as ReadableStream<Uint8Array> | null);
    return parseMetadata(html, url);
  }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

export function parseMetadata(html: string, pageUrl: URL): PageMetadata {
  const meta = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([a-zA-Z_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
      attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
    }
    const key = (attrs.property ?? attrs.name)?.toLowerCase();
    if (key && attrs.content !== undefined && !meta.has(key)) meta.set(key, decodeEntities(attrs.content).trim());
  }
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

  let imageUrl: string | null = null;
  const rawImage = meta.get("og:image") ?? meta.get("twitter:image");
  if (rawImage) {
    try {
      const img = new URL(rawImage, pageUrl);
      if (img.protocol === "https:" || img.protocol === "http:") imageUrl = img.toString();
    } catch {
      // ignore unparseable image URLs
    }
  }

  return {
    title: meta.get("og:title") ?? (titleTag ? decodeEntities(titleTag).trim() : ""),
    description: meta.get("og:description") ?? meta.get("description") ?? "",
    imageUrl,
    source: meta.get("og:site_name") ?? pageUrl.hostname.replace(/^www\./, ""),
  };
}

export function normalizeIsbn(raw: string): string | null {
  const isbn = raw.replace(/[\s-]/g, "").toUpperCase();
  return /^(\d{9}[\dX]|\d{13})$/.test(isbn) ? isbn : null;
}

export async function fetchBookMetadata(isbn: string): Promise<PageMetadata | null> {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: {
      volumeInfo?: {
        title?: string;
        subtitle?: string;
        authors?: string[];
        description?: string;
        imageLinks?: { thumbnail?: string };
      };
    }[];
  };
  const info = data.items?.[0]?.volumeInfo;
  if (!info) return null;
  return {
    title: [info.title, info.subtitle].filter(Boolean).join(": "),
    description: info.description ?? "",
    imageUrl: info.imageLinks?.thumbnail?.replace(/^http:/, "https:") ?? null,
    source: info.authors?.join(", ") ?? "",
  };
}

export function youtubeId(raw: string | null): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null;
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}
