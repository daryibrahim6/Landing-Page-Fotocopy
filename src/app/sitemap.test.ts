import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("includes the homepage with top priority", () => {
    const entries = sitemap();
    const home = entries.find((e) => e.url === "https://bisaprint.com");
    expect(home).toBeDefined();
    expect(home?.priority).toBe(1);
  });

  it("includes public pages only — no checkout/api/internal routes", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/simulator"))).toBe(true);
    for (const u of urls) {
      expect(u).not.toContain("/checkout");
      expect(u).not.toContain("/api");
    }
  });

  it("never emits relative URLs", () => {
    for (const e of sitemap()) {
      expect(e.url).toMatch(/^https:\/\//);
    }
  });
});
