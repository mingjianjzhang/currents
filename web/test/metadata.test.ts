import { describe, expect, it } from "vitest";
import {
  assertSafeUrl,
  decodeEntities,
  guardedLookup,
  isPublicAddress,
  normalizeIsbn,
  parseMetadata,
  UnsafeUrlError,
  youtubeId,
} from "@/lib/metadata";

describe("isPublicAddress", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "0:0:0:0:0:ffff:10.0.0.1", "100.64.0.1"])(
    "blocks %s",
    (ip) => expect(isPublicAddress(ip)).toBe(false),
  );
  it.each(["8.8.8.8", "93.184.216.34", "2606:4700:4700::1111", "::ffff:8.8.8.8"])("allows %s", (ip) =>
    expect(isPublicAddress(ip)).toBe(true),
  );
  it("rejects non-IPs", () => expect(isPublicAddress("example.com")).toBe(false));
});

describe("assertSafeUrl", () => {
  it.each([
    "file:///etc/passwd",
    "ftp://example.com",
    "http://127.0.0.1:5432",
    "http://[::1]/",
    "http://169.254.169.254/latest/meta-data",
    "http://localhost:3000",
    "http://user:pw@example.com",
    "| ls http://example.com", // the old Kernel#open injection shape
    "not a url",
  ])("rejects %s", (url) => expect(() => assertSafeUrl(url)).toThrow(UnsafeUrlError));

  it("accepts public http(s) URLs", () => {
    expect(assertSafeUrl("https://www.bbc.co.uk/news").hostname).toBe("www.bbc.co.uk");
  });
});

describe("guardedLookup", () => {
  it("refuses hostnames that resolve to private addresses", async () => {
    const err = await new Promise<NodeJS.ErrnoException | null>((resolve) =>
      guardedLookup("localhost", {}, (e) => resolve(e)),
    );
    expect(err?.code).toBe("EBLOCKED");
  });
});

describe("parseMetadata", () => {
  const page = new URL("https://news.example.com/2011/story");
  it("prefers Open Graph tags and resolves relative images", () => {
    const html = `<html><head><title>Fallback</title>
      <meta property="og:title" content="Mubarak &amp; the Army">
      <meta content='A &quot;turning&quot; point' property='og:description' />
      <meta property="og:image" content="/img/lead.jpg">
      <meta property="og:site_name" content="Example News"></head></html>`;
    expect(parseMetadata(html, page)).toEqual({
      title: "Mubarak & the Army",
      description: 'A "turning" point',
      imageUrl: "https://news.example.com/img/lead.jpg",
      source: "Example News",
    });
  });

  it("falls back to <title>, meta description and hostname", () => {
    const html = `<title>Plain &#8211; Page</title><meta name="description" content="desc">`;
    expect(parseMetadata(html, page)).toEqual({
      title: "Plain – Page",
      description: "desc",
      imageUrl: null,
      source: "news.example.com",
    });
  });

  it("ignores non-http image URLs", () => {
    expect(parseMetadata(`<meta property="og:image" content="javascript:alert(1)">`, page).imageUrl).toBeNull();
  });
});

describe("helpers", () => {
  it("decodes entities", () => expect(decodeEntities("&lt;b&gt; &#x27;x&#39; &bogus;")).toBe("<b> 'x' &bogus;"));

  it("normalizes ISBNs", () => {
    expect(normalizeIsbn("978-1-61039-084-2")).toBe("9781610390842");
    expect(normalizeIsbn("0-306-40615-x")).toBe("030640615X");
    expect(normalizeIsbn("12345")).toBeNull();
  });

  it("extracts YouTube ids", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://vimeo.com/123")).toBeNull();
    expect(youtubeId("https://youtube.com/watch?v=bad")).toBeNull();
  });
});
