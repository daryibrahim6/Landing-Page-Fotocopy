import { describe, it, expect } from "vitest";
import { buildWAUrl, buildWAFormUrl, templates } from "./wa";

describe("buildWAUrl", () => {
  it("builds general template URL", () => {
    const url = buildWAUrl("general");
    expect(url).toMatch(/^https:\/\/wa\.me\/6281299435019/);
    expect(url).toContain(encodeURIComponent(templates.general as string));
  });

  it("builds fromProduct URL with product name", () => {
    const url = buildWAUrl("fromProduct", "Stiker Chromo");
    expect(url).toContain("Stiker%20Chromo");
  });

  it("builds postCheckout URL with order id", () => {
    const url = buildWAUrl("postCheckout", "BSP-123");
    expect(url).toContain("BSP-123");
  });
});

describe("buildWAFormUrl", () => {
  it("builds URL from form fields", () => {
    const url = buildWAFormUrl({
      nama: "Budi",
      produk: "Stiker",
      jumlah: "100",
      ukuran: "5x5 cm",
      bahan: "Chromo",
      catatan: "Rumah",
    });
    expect(url).toMatch(/^https:\/\/wa\.me\/6281299435019/);
    expect(url).toContain("Budi");
    expect(url).toContain("100");
  });
});
