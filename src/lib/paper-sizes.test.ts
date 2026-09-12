import { describe, it, expect } from "vitest";
import {
  calculateImposition,
  estimateSheets,
  mmToPx,
  pxToMm,
  GAP_KISS_CUT_MM,
  GAP_DIE_CUT_MM,
  PRINT_AREA_MM,
  MM_TO_PX,
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
    // 200×20 on 305×460 (kiss gap 2): normal = 1×20 = 20, rotated = 13×2 = 26
    const result = calculateImposition(200, 20, "kiss", "square");
    expect(result.rotated).toBe(true);
    expect(result.total).toBe(26);
    expect(result.cols).toBe(13);
    expect(result.rows).toBe(2);
  });

  it("does not rotate when rotation yields fewer pieces", () => {
    const result = calculateImposition(50, 50, "kiss", "square");
    expect(result.rotated).toBe(false);
  });

  it("returns zero layout for non-positive dimensions", () => {
    for (const [w, h] of [[0, 50], [50, 0], [0, 0], [-10, 50]]) {
      const result = calculateImposition(w, h, "kiss", "square");
      expect(result.total).toBe(0);
      expect(result.cols).toBe(0);
      expect(result.rows).toBe(0);
      expect(result.utilization).toBe(0);
    }
  });

  it("fits exactly one piece at the printable boundary", () => {
    // 303×458 + 2mm kiss gap = exactly 305×460 → 1 piece
    const result = calculateImposition(303, 458, "kiss", "square");
    expect(result.total).toBe(1);
  });

  it("returns zero when design exceeds printable area", () => {
    // 306×461 design > 305×460 printable → 0
    const result = calculateImposition(306, 461, "kiss", "square");
    expect(result.total).toBe(0);
  });

  it("a design exactly equal to the printable area fits once (no trailing gap)", () => {
    // 305×460 design on 305×460 area → 1 copy; gaps only exist BETWEEN cells
    const result = calculateImposition(305, 460, "kiss", "square");
    expect(result.total).toBe(1);
  });
});

describe("mmToPx / pxToMm", () => {
  it("converts mm to px at 96 DPI", () => {
    expect(mmToPx(25.4)).toBeCloseTo(96);
    expect(mmToPx(0)).toBe(0);
  });

  it("round-trips mm → px → mm", () => {
    for (const mm of [10, 50, 305, 460]) {
      expect(pxToMm(mmToPx(mm))).toBeCloseTo(mm);
    }
  });

  it("respects scale factor", () => {
    expect(mmToPx(10, 2)).toBeCloseTo(10 * MM_TO_PX * 2);
    expect(pxToMm(mmToPx(10, 2), 2)).toBeCloseTo(10);
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
