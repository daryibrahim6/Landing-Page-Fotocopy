import { describe, it, expect } from "vitest";
import { buildWAUrl, buildWAFormUrl, buildAdminWAUrl, waCustomUrl, isConsultationFormComplete, templates, ADMIN_WA_NUMBER } from "./wa";
import { WA_NUMBER } from "@/lib/constants";

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

  it("falls back to general template for unknown template key", () => {
    // @ts-expect-error — deliberately pass an invalid key
    const url = buildWAUrl("bogusTemplate");
    expect(url).not.toContain("undefined");
    expect(url).toContain(encodeURIComponent(templates.general as string));
  });

  it("uses the same WA_NUMBER as constants (single source of truth)", () => {
    // WA-A-03 regression guard: every builder must target constants.WA_NUMBER.
    for (const url of [
      buildWAUrl("general"),
      buildWAFormUrl({ nama: "a", produk: "b", jumlah: "1", ukuran: "", bahan: "", catatan: "" }),
      waCustomUrl("x"),
    ]) {
      expect(url).toContain(`wa.me/${WA_NUMBER}`);
    }
  });
});

describe("buildAdminWAUrl", () => {
  it("builds adminNewOrder URL targeting the resolved admin number", () => {
    const url = buildAdminWAUrl("adminNewOrder", "BSP-1", "Stiker", "Budi", "628111", "Rp10.000", "-", "-");
    expect(url).toContain(`wa.me/${ADMIN_WA_NUMBER}`);
    expect(url).toContain(encodeURIComponent("BSP-1"));
    expect(url).toContain(encodeURIComponent("Budi"));
  });

  it("builds adminPaidOrder URL", () => {
    const url = buildAdminWAUrl("adminPaidOrder", "BSP-2", "Banner", "Sari", "628222", "Rp50.000");
    expect(url).toContain(`wa.me/${ADMIN_WA_NUMBER}`);
    expect(url).toContain(encodeURIComponent("BSP-2"));
  });

  it("admin number falls back to WA_NUMBER when env unset", () => {
    // Test env has no ADMIN_WHATSAPP_NUMBER → resolved fallback
    expect(ADMIN_WA_NUMBER).toBe(process.env.ADMIN_WHATSAPP_NUMBER || WA_NUMBER);
  });
});

describe("waCustomUrl", () => {
  it("encodes a custom message", () => {
    const url = waCustomUrl("Halo, order saya: BSP-9");
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(url).toContain(encodeURIComponent("Halo, order saya: BSP-9"));
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

describe("isConsultationFormComplete", () => {
  const base = { nama: "Budi", produk: "Stiker", jumlah: "10" };

  it("accepts a complete form", () => {
    expect(isConsultationFormComplete(base)).toBe(true);
  });

  it("rejects empty/whitespace nama", () => {
    expect(isConsultationFormComplete({ ...base, nama: "" })).toBe(false);
    expect(isConsultationFormComplete({ ...base, nama: "   " })).toBe(false);
  });

  it("rejects missing produk", () => {
    expect(isConsultationFormComplete({ ...base, produk: "" })).toBe(false);
  });

  it("rejects jumlah zero, negative, and non-numeric", () => {
    for (const jumlah of ["0", "-5", "abc", "", "  "]) {
      expect(isConsultationFormComplete({ ...base, jumlah })).toBe(false);
    }
  });

  it("accepts positive numeric jumlah including decimals/exponents", () => {
    expect(isConsultationFormComplete({ ...base, jumlah: "1" })).toBe(true);
    expect(isConsultationFormComplete({ ...base, jumlah: "2.5" })).toBe(true);
  });
});
