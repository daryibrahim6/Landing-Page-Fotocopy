import { describe, it, expect } from "vitest";
import { waUrl, WA_NUMBER, WA_DEFAULT_MSG } from "./constants";

describe("waUrl", () => {
  it("builds wa.me URL with the business number", () => {
    expect(waUrl("halo")).toBe(`https://wa.me/${WA_NUMBER}?text=halo`);
  });

  it("falls back to default consult message when no message given", () => {
    expect(waUrl()).toBe(`https://wa.me/${WA_NUMBER}?text=${WA_DEFAULT_MSG}`);
  });

  it("encodes special characters in the message", () => {
    const url = waUrl("Produk: stiker & banner 50%");
    expect(url).toContain(encodeURIComponent("Produk: stiker & banner 50%"));
    expect(url).not.toContain("banner 50%");
  });

  it("WA_NUMBER is digits-only international format (62…)", () => {
    expect(WA_NUMBER).toMatch(/^62\d+$/);
  });
});
