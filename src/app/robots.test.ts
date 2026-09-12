import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows crawling public pages", () => {
    const rules = robots().rules;
    expect(rules && !Array.isArray(rules) ? rules.allow : undefined).toBe("/");
  });

  it("disallows transactional/internal routes", () => {
    const rules = robots().rules;
    const disallow = rules && !Array.isArray(rules) ? rules.disallow : [];
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/checkout");
  });

  it("points crawlers at the generated sitemap", () => {
    expect(robots().sitemap).toBe("https://bisaprint.com/sitemap.xml");
  });
});
