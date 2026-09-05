export interface PaperSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
}

/**
 * BisaPrint A3 sheet specification (from production team):
 * - Paper outer size: 325 × 485 mm
 * - Size with corner register marks (siku): 310 × 470 mm
 * - Printable area: 305 × 460 mm
 */
export const BISA_PRINT_A3: PaperSize = {
  id: "a3-bisaprint",
  name: "A3 BisaPrint (325 × 485 mm)",
  widthMm: 325,
  heightMm: 485,
};

export const PRINT_AREA_MM = {
  width: 305,
  height: 460,
};

export const GAP_KISS_CUT_MM = 2;
export const GAP_DIE_CUT_MM = 4;

export const MM_TO_PX = 96 / 25.4; // 96 DPI standard

export function mmToPx(mm: number, scale: number = 1): number {
  return mm * MM_TO_PX * scale;
}

export function pxToMm(px: number, scale: number = 1): number {
  return px / MM_TO_PX / scale;
}

export type StickerShape = "square" | "round";
export type CutType = "kiss" | "die";

export interface ImpositionResult {
  cols: number;
  rows: number;
  total: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
  designWidthMm: number;
  designHeightMm: number;
  rotated: boolean;
  shape: StickerShape;
  cut: CutType;
  /** Total effective printed area in mm² (for square = design area; for round = π·r²). */
  effectiveDesignAreaMm2: number;
  /** Total sheet printable area in mm². */
  printableAreaMm2: number;
  /** Approximate paper utilization percentage. */
  utilization: number;
}

/**
 * Calculate how many copies of a design fit on the BisaPrint A3 printable area.
 * Tries both normal and rotated orientations for square/rectangular designs.
 * Round designs use a square bounding box for placement, but utilization counts circle area.
 */
export function calculateImposition(
  designW: number,
  designH: number,
  cut: CutType = "kiss",
  shape: StickerShape = "square",
): ImpositionResult {
  const gap = cut === "kiss" ? GAP_KISS_CUT_MM : GAP_DIE_CUT_MM;
  const printableW = PRINT_AREA_MM.width;
  const printableH = PRINT_AREA_MM.height;

  // For round stickers, the design is a circle; use diameter as the cell size.
  const cellW = shape === "round" ? designW + gap : designW + gap;
  const cellH = shape === "round" ? designH + gap : designH + gap;

  // Normal orientation
  const cols = Math.floor(printableW / cellW);
  const rows = Math.floor(printableH / cellH);
  const normal = cols * rows;

  // Rotated orientation (only meaningful for non-square designs)
  let rotated = false;
  let finalCols = cols;
  let finalRows = rows;
  let finalTotal = normal;

  if (designW !== designH && shape === "square") {
    const cellWR = designH + gap;
    const cellHR = designW + gap;
    const colsR = Math.floor(printableW / cellWR);
    const rowsR = Math.floor(printableH / cellHR);
    const rotatedTotal = colsR * rowsR;

    if (rotatedTotal > normal && colsR > 0 && rowsR > 0) {
      rotated = true;
      finalCols = colsR;
      finalRows = rowsR;
      finalTotal = rotatedTotal;
    }
  }

  if (finalTotal <= 0) {
    finalTotal = 0;
    finalCols = 0;
    finalRows = 0;
  }

  const effectiveDesignAreaMm2 =
    shape === "round"
      ? Math.PI * Math.pow(designW / 2, 2)
      : designW * designH;

  const printableAreaMm2 = printableW * printableH;

  const totalEffectiveArea = finalTotal * effectiveDesignAreaMm2;
  const utilization = Math.round(Math.min(100, (totalEffectiveArea / printableAreaMm2) * 100));

  return {
    cols: finalCols,
    rows: finalRows,
    total: finalTotal,
    sheetWidthMm: printableW,
    sheetHeightMm: printableH,
    designWidthMm: designW,
    designHeightMm: designH,
    rotated,
    shape,
    cut,
    effectiveDesignAreaMm2,
    printableAreaMm2,
    utilization,
  };
}

/**
 * Estimate how many sheets are needed for a given quantity.
 */
export function estimateSheets(quantity: number, piecesPerSheet: number): number {
  if (!piecesPerSheet || piecesPerSheet <= 0) return 0;
  return Math.ceil(quantity / piecesPerSheet);
}
