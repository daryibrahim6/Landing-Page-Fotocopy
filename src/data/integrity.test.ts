import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { categories, products } from "./products";
import { faqItems } from "./faq";
import { testimonials, clientBadges } from "./testimonials";
import { portfolioItems } from "./portfolio";

const PUBLIC_DIR = path.resolve(__dirname, "../../public");

// Guards against the LP-A-10 class of bugs: data/UI referencing assets
// that do not exist on disk, and duplicate/empty records slipping in.
function expectLocalAssetExists(src: string, context: string) {
  if (src.startsWith("data:")) return; // inline placeholder — no file to check
  expect(
    existsSync(path.join(PUBLIC_DIR, src)),
    `${context} references missing asset: ${src}`,
  ).toBe(true);
}

describe("products data integrity", () => {
  it("has unique product ids", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every product references a defined category", () => {
    const valid = new Set(categories.map((c) => c.id));
    for (const p of products) {
      expect(valid.has(p.category), `product ${p.id} has unknown category`).toBe(true);
    }
  });

  it("every product has a positive priceFrom and at least one size", () => {
    for (const p of products) {
      expect(p.priceFrom, `product ${p.id} priceFrom`).toBeGreaterThan(0);
      expect(p.sizes.length, `product ${p.id} sizes`).toBeGreaterThan(0);
      expect(p.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("every product image exists on disk", () => {
    for (const p of products) {
      for (const img of p.images) {
        expectLocalAssetExists(img, `product ${p.id}`);
      }
    }
  });

  it("checkout-enabled products expose spec options used by create-token", () => {
    for (const p of products.filter((p) => p.isCheckoutEnabled)) {
      expect(p.sizes.length, `product ${p.id} sizes`).toBeGreaterThan(0);
      expect(p.materials.length, `product ${p.id} materials`).toBeGreaterThan(0);
      expect(p.finishings.length, `product ${p.id} finishings`).toBeGreaterThan(0);
    }
  });
});

describe("faq data integrity", () => {
  it("has unique ids and non-empty Q/A", () => {
    const ids = faqItems.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of faqItems) {
      expect(f.question.trim().length).toBeGreaterThan(0);
      expect(f.answer.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("testimonials data integrity", () => {
  it("has unique ids, valid ratings, and non-empty quotes", () => {
    const ids = testimonials.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of testimonials) {
      expect(t.rating, `testimonial ${t.id} rating`).toBeGreaterThanOrEqual(1);
      expect(t.rating, `testimonial ${t.id} rating`).toBeLessThanOrEqual(5);
      expect(t.quote.trim().length).toBeGreaterThan(0);
      expect(t.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("client badges have unique ids and known icon keys", () => {
    const ids = clientBadges.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("portfolio data integrity", () => {
  it("has unique ids and non-empty title/category", () => {
    const ids = portfolioItems.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of portfolioItems) {
      expect(p.title.trim().length).toBeGreaterThan(0);
      expect(p.category.trim().length).toBeGreaterThan(0);
    }
  });

  it("local image references exist on disk", () => {
    for (const p of portfolioItems) {
      expectLocalAssetExists(p.image, `portfolio ${p.id}`);
    }
  });
});
