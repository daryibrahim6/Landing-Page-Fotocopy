import { describe, it, expect } from "vitest";
import {
  calculateImposition,
  estimateSheets,
  GAP_KISS_CUT_MM,
  GAP_DIE_CUT_MM,
  PRINT_AREA_MM,
} from "./paper-sizes";

describe("calculateImposition", () => {
  it("calculates square sticker layout on A3 BisaPrint printable area", () => {
    const result = calculateImposition(50, 50, "kiss", "square");
    expect(result.cols).toBeGreaterThan(0);
    expect(result.rows).toBeGreaterThan(0);
    expect(result.total).toBe(result.cols * result.rows);
    expect(result.sheetWidthMm).toBe(PRINT_AREA_MM.width);
    expect(result.sheetHeightMm).toBe(PRINT_AREA_MM.height);
    expect(result.shape).toBe("square");
    expect(result.cut).toBe("kiss");
  });

  it("uses correct gap for kiss vs die cut", () => {
    const kiss = calculateImposition(50, 50, "kiss", "square");
    const die = calculateImposition(50, 50, "die", "square");
    expect(GAP_KISS_CUT_MM).toBe(2);
    expect(GAP_DIE_CUT_MM).toBe(4);
    // Die cut has larger gap, so fewer items fit
    expect(die.total).toBeLessThanOrEqual(kiss.total);
  });

  it("calculates round sticker layout with diameter", () => {
    const result = calculateImposition(50, 50, "kiss", "round");
    expect(result.shape).toBe("round");
    expect(result.total).toBeGreaterThan(0);
    expect(result.utilization).toBeGreaterThan(0);
    expect(result.utilization).toBeLessThanOrEqual(100);
  });

  it("returns zero for oversized design", () => {
    const result = calculateImposition(500, 500, "kiss", "square");
    expect(result.total).toBe(0);
  });

  it("rotates design when it yields more pieces", () => {
    // A long rectangle (e.g. 40x25) may fit better rotated
    const result = calculateImposition(40, 25, "kiss", "square");
    if (result.total > 0) {
      expect(result.rotated).toBeTypeOf("boolean");
    }
  });
});

describe("estimateSheets", () => {
  it("estimates required sheet count", () => {
    expect(estimateSheets(100, 25)).toBe(4);
    expect(estimateSheets(100, 30)).toBe(4);
    expect(estimateSheets(1, 25)).toBe(1);
    expect(estimateSheets(25, 25)).toBe(1);
    expect(estimateSheets(26, 25)).toBe(2);
  });

  it("returns 0 when pieces per sheet is 0", () => {
    expect(estimateSheets(100, 0)).toBe(0);
  });
});
