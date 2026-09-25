import { describe, expect, it } from "vitest";
import { dateBounds, describeFilter, filterToQuery, isIsoDate, parseFilter } from "@/lib/filters";

describe("parseFilter", () => {
  it("defaults to everything", () => {
    expect(parseFilter({})).toEqual({ range: "all", from: undefined, to: undefined, tags: [], match: "all" });
  });

  it("reads range, dates, tags and match", () => {
    expect(
      parseFilter({ range: "6m", from: "2011-01-01", to: "2011-12-31", tag: ["egypt", " syria ", "egypt"], match: "any" }),
    ).toEqual({ range: "6m", from: "2011-01-01", to: "2011-12-31", tags: ["egypt", "syria"], match: "any" });
  });

  it("drops invalid input", () => {
    const f = parseFilter({ range: "forever", from: "2011-02-30", to: "yesterday", match: "some" });
    expect(f).toMatchObject({ range: "all", from: undefined, to: undefined, match: "all" });
  });
});

describe("isIsoDate", () => {
  it("accepts real dates only", () => {
    expect(isIsoDate("2024-02-29")).toBe(true);
    expect(isIsoDate("2023-02-29")).toBe(false);
    expect(isIsoDate("2023-1-01")).toBe(false);
  });
});

describe("dateBounds", () => {
  const today = new Date("2026-09-25T12:00:00Z");
  it("computes preset ranges", () => {
    expect(dateBounds(parseFilter({ range: "month" }), today)).toEqual({ from: "2026-09-01" });
    expect(dateBounds(parseFilter({ range: "6m" }), today)).toEqual({ from: "2026-03-25" });
    expect(dateBounds(parseFilter({ range: "2y" }), today)).toEqual({ from: "2024-09-25" });
    expect(dateBounds(parseFilter({ range: "latest" }), today)).toEqual({});
  });
  it("lets explicit dates win over the preset", () => {
    expect(dateBounds(parseFilter({ range: "month", from: "2011-01-01" }), today)).toEqual({
      from: "2011-01-01",
      to: undefined,
    });
  });
  it("crosses year boundaries", () => {
    expect(dateBounds(parseFilter({ range: "6m" }), new Date("2026-02-10T00:00:00Z"))).toEqual({ from: "2025-08-10" });
  });
});

describe("describeFilter / filterToQuery", () => {
  it("round-trips through the URL", () => {
    const f = parseFilter({ range: "2y", tag: ["a", "b"], match: "any" });
    expect(describeFilter(f)).toBe("Last two years, tagged a or b");
    expect(filterToQuery(f)).toBe("?range=2y&tag=a&tag=b&match=any");
    expect(parseFilter(Object.fromEntries(new URLSearchParams("range=2y&match=any")))).toMatchObject({ range: "2y" });
    expect(filterToQuery(parseFilter({}))).toBe("");
  });
});
