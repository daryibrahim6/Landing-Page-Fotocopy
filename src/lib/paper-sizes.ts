export interface PaperSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
}

export const PAPER_SIZES: PaperSize[] = [
  { id: "a3", name: "A3 (297 × 420 mm)", widthMm: 297, heightMm: 420 },
  { id: "a4", name: "A4 (210 × 297 mm)", widthMm: 210, heightMm: 297 },
  { id: "f4", name: "F4 (215 × 330 mm)", widthMm: 215, heightMm: 330 },
  { id: "a5", name: "A5 (148 × 210 mm)", widthMm: 148, heightMm: 210 },
  { id: "a2", name: "A2 (420 × 594 mm)", widthMm: 420, heightMm: 594 },
  { id: "sra3", name: "SRA3 (320 × 450 mm)", widthMm: 320, heightMm: 450 },
];

export const DEFAULT_PAPER = PAPER_SIZES[0]; // A3

export const MM_TO_PX = 96 / 25.4; // 96 DPI standard

export function mmToPx(mm: number, scale: number = 1): number {
  return mm * MM_TO_PX * scale;
}

export function pxToMm(px: number, scale: number = 1): number {
  return px / MM_TO_PX / scale;
}

export interface ImpositionResult {
  cols: number;
  rows: number;
  total: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
  designWidthMm: number;
  designHeightMm: number;
  rotated: boolean;
}

/**
 * Calculate how many copies of a design fit on a sheet.
 * Tries both normal and rotated orientations.
 */
export function calculateImposition(
  sheetW: number,
  sheetH: number,
  designW: number,
  designH: number,
  gap: number = 2,
): ImpositionResult {
  const cellW = designW + gap;
  const cellH = designH + gap;

  // Normal orientation
  const cols = Math.floor(sheetW / cellW);
  const rows = Math.floor(sheetH / cellH);
  const normal = cols * rows;

  // Rotated orientation
  const colsR = Math.floor(sheetW / cellH);
  const rowsR = Math.floor(sheetH / cellW);
  const rotated = colsR * rowsR;

  if (rotated > normal && colsR > 0 && rowsR > 0) {
    return {
      cols: colsR,
      rows: rowsR,
      total: rotated,
      sheetWidthMm: sheetW,
      sheetHeightMm: sheetH,
      designWidthMm: designH,
      designHeightMm: designW,
      rotated: true,
    };
  }

  return {
    cols,
    rows,
    total: Math.max(normal, 1),
    sheetWidthMm: sheetW,
    sheetHeightMm: sheetH,
    designWidthMm: designW,
    designHeightMm: designH,
    rotated: false,
  };
}
