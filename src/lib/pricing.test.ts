import { describe, it, expect } from "vitest";
import { calculatePrice, sheetUnitPrice, sheetTotalPrice, STICKER_SHEET_TIERS } from "./pricing";

describe("calculatePrice", () => {
  it("returns zero for unknown product", () => {
    const result = calculatePrice("unknown", "A4", "HVS 80gsm", "Tanpa finishing", 10);
    expect(result).toEqual({ subtotal: 0, total: 0, breakdown: "" });
  });

  it("calculates print dokumen base price", () => {
    const result = calculatePrice("print-dokumen", "A4", "HVS 80gsm", "Tanpa finishing", 1);
    // base 500, all multipliers 1, rounded to 100 => 500
    expect(result.total).toBe(500);
    expect(result.breakdown.replace(/\s/g, " ")).toBe("Rp 500 x 1 per lembar");
  });

  it("applies size, material, finishing multipliers", () => {
    const result = calculatePrice("print-dokumen", "A3", "Art Paper 150gsm", "Jilid spiral", 2);
    // base 500 * A3(1.8) * material(1.5) * finishing(1.15) = 1552.5 -> ceil/100 * 100 = 1600
    // unit 1600, total 3200
    expect(result.total).toBe(3200);
    expect(result.breakdown.replace(/\s/g, " ")).toBe("Rp 1.600 x 2 per lembar");
  });

  it("returns integer total", () => {
    const result = calculatePrice("stiker-chromo", "A4", "Stiker Chromo", "Glossy", 3);
    expect(Number.isInteger(result.total)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });
});

describe("sticker sheet tier pricing", () => {
  it("uses the highest tier the sheet count qualifies for", () => {
    expect(sheetUnitPrice(1)).toBe(STICKER_SHEET_TIERS[0].pricePerSheet);
    expect(sheetUnitPrice(10)).toBe(STICKER_SHEET_TIERS[0].pricePerSheet);
    expect(sheetUnitPrice(11)).toBe(STICKER_SHEET_TIERS[1].pricePerSheet);
    expect(sheetUnitPrice(50)).toBe(STICKER_SHEET_TIERS[1].pricePerSheet);
    expect(sheetUnitPrice(51)).toBe(STICKER_SHEET_TIERS[2].pricePerSheet);
    expect(sheetUnitPrice(500)).toBe(STICKER_SHEET_TIERS[3].pricePerSheet);
    expect(sheetUnitPrice(501)).toBe(STICKER_SHEET_TIERS[4].pricePerSheet);
    expect(sheetUnitPrice(10000)).toBe(STICKER_SHEET_TIERS[4].pricePerSheet);
  });

  it("returns 0 for zero or negative sheet counts", () => {
    expect(sheetUnitPrice(0)).toBe(0);
    expect(sheetUnitPrice(-5)).toBe(0);
    expect(sheetTotalPrice(0)).toBe(0);
  });

  it("unit price never increases as quantity grows", () => {
    for (let s = 1; s < 600; s++) {
      expect(sheetUnitPrice(s + 1)).toBeLessThanOrEqual(sheetUnitPrice(s));
    }
  });

  it("total = sheets x unit price", () => {
    expect(sheetTotalPrice(11)).toBe(11 * sheetUnitPrice(11));
  });
});
