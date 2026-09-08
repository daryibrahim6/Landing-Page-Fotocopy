import { describe, it, expect } from "vitest";
import { calculatePrice } from "./pricing";

describe("calculatePrice", () => {
  it("returns zero for unknown product", () => {
    const result = calculatePrice("unknown", "A4", "HVS 80gsm", "Tanpa finishing", 10);
    expect(result).toEqual({ subtotal: 0, total: 0, breakdown: "" });
  });

  it("calculates print document bw with multipliers", () => {
    const result = calculatePrice("print-dokumen-bw", "A4", "HVS 80gsm", "Tanpa finishing", 1);
    // base 500, all multipliers 1, rounded to 100 => 500
    expect(result.total).toBe(500);
    expect(result.breakdown.replace(/\s/g, " ")).toBe("Rp 500 x 1 per lembar");
  });

  it("applies size, material, finishing multipliers", () => {
    const result = calculatePrice("print-dokumen-warna", "A3", "Art Paper 150gsm", "Laminasi", 2);
    // base 2500 * A3(1.8) * material(1.5) * finishing(1.25) = 8437.5 -> ceil/100 * 100 = 8500
    // unit 8500, total 17000
    expect(result.total).toBe(17000);
    expect(result.breakdown.replace(/\s/g, " ")).toBe("Rp 8.500 x 2 per lembar");
  });

  it("returns integer total", () => {
    const result = calculatePrice("stiker-chromo", "A4", "Stiker Chromo", "Glossy", 3);
    expect(Number.isInteger(result.total)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });
});
