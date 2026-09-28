import { describe, expect, it } from "vitest";
import { parseTagList, safeNext, slugify } from "@/lib/forms";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("forms", () => {
  it("slugifies titles", () => {
    expect(slugify("The Arab Spring: 2010–2012!")).toBe("the-arab-spring-2010-2012");
    expect(slugify("Café Société")).toBe("cafe-societe");
    expect(slugify("!!!")).toBe("timeline");
  });

  it("parses tag lists", () => {
    expect(parseTagList(" Egypt, syria,,egypt , ")).toEqual(["egypt", "syria"]);
  });

  it("only allows local redirects", () => {
    expect(safeNext("/t/arab-spring")).toBe("/t/arab-spring");
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext(null)).toBe("/dashboard");
  });
});

describe("password", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("correct horse");
    expect(hash).toMatch(/^scrypt\$/);
    expect(await verifyPassword("correct horse", hash)).toBe(true);
    expect(await verifyPassword("wrong horse", hash)).toBe(false);
    expect(await verifyPassword("x", "garbage")).toBe(false);
  });
});
