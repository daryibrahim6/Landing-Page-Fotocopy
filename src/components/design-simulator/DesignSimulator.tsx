"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Calculator, Upload, RotateCcw, ZoomIn, ZoomOut,
  FileText, ImageIcon, Maximize, Printer, Circle, Square,
} from "lucide-react";
import { UploadZone } from "./UploadZone";
import { DesignCanvas } from "./DesignCanvas";
import {
  BISA_PRINT_A3,
  PRINT_AREA_MM,
  GAP_KISS_CUT_MM,
  GAP_DIE_CUT_MM,
  calculateImposition,
  estimateSheets,
  type StickerShape,
  type CutType,
  type ImpositionResult,
} from "@/lib/paper-sizes";
import { cn } from "@/lib/utils";

interface Preset {
  name: string;
  w: number;
  h: number;
  shape: StickerShape;
}

const PRESETS: Preset[] = [
  { name: "Stiker Bulat 3 cm", w: 30, h: 30, shape: "round" },
  { name: "Stiker Bulat 5 cm", w: 50, h: 50, shape: "round" },
  { name: "Stiker Bulat 8 cm", w: 80, h: 80, shape: "round" },
  { name: "Stiker Kotak 3 × 3 cm", w: 30, h: 30, shape: "square" },
  { name: "Stiker Kotak 5 × 5 cm", w: 50, h: 50, shape: "square" },
  { name: "Stiker Kotak 8 × 8 cm", w: 80, h: 80, shape: "square" },
  { name: "Label 4 × 2,5 cm", w: 40, h: 25, shape: "square" },
  { name: "Label 6 × 4 cm", w: 60, h: 40, shape: "square" },
];

// Default price per A3 sheet for UMKM sticker (placeholder — admin can adjust)
const BASE_SHEET_PRICE = 15000;

export function DesignSimulator() {
  const [mode, setMode] = useState<"calculator" | "upload">("calculator");

  // Calculator state — kept as strings so inputs can be cleared while typing;
  // parsed to numbers at the point of use (<= 0 → no result).
  const [designW, setDesignW] = useState("50");
  const [designH, setDesignH] = useState("50");
  const [shape, setShape] = useState<StickerShape>("round");
  const [cut, setCut] = useState<CutType>("kiss");
  const [quantity, setQuantity] = useState("100");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [fileName, setFileName] = useState("layout-stiker-umkm");
  const [zoom, setZoom] = useState(100);

  // Upload state
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [uploadImposition, setUploadImposition] = useState<ImpositionResult | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const sw = useMemo(() => {
    const w = Number(designW) || 0;
    const h = Number(designH) || 0;
    if (shape === "round") return w;
    if (orientation === "landscape") return h;
    return w;
  }, [designW, designH, orientation, shape]);

  const sh = useMemo(() => {
    const w = Number(designW) || 0;
    const h = Number(designH) || 0;
    if (shape === "round") return h;
    if (orientation === "landscape") return w;
    return h;
  }, [designW, designH, orientation, shape]);

  const result: ImpositionResult | null = useMemo(() => {
    if (sw <= 0 || sh <= 0) return null;
    return calculateImposition(sw, sh, cut, shape);
  }, [sw, sh, cut, shape]);

  const sheets = useMemo(() => {
    if (!result || result.total <= 0) return 0;
    return estimateSheets(Number(quantity) || 0, result.total);
  }, [quantity, result]);

  const estimatedPrice = useMemo(() => {
    return sheets * BASE_SHEET_PRICE;
  }, [sheets]);

  const applyPreset = useCallback((preset: Preset) => {
    setDesignW(String(preset.w));
    setDesignH(String(preset.h));
    setShape(preset.shape);
    setOrientation("portrait");
  }, []);

  const handleFileUpload = useCallback((_file: File, dataUrl: string) => {
    setImageDataUrl(dataUrl);
  }, []);

  const resetCalculator = useCallback(() => {
    setDesignW("50");
    setDesignH("50");
    setShape("round");
    setCut("kiss");
    setQuantity("100");
    setOrientation("portrait");
    setFileName("layout-stiker-umkm");
    setZoom(100);
  }, []);

  const handleExportPNG = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      const svg = svgRef.current;
      // Clone + inject explicit width/height — SVGs with only a viewBox have no
      // intrinsic size, so canvas drawImage produces blank/degraded output
      // (Firefox fails silently; spec falls back to canvas size).
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("width", String(BISA_PRINT_A3_WIDTH));
      clone.setAttribute("height", String(BISA_PRINT_A3_HEIGHT));
      const svgData = new XMLSerializer().serializeToString(clone);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scale = 2;
      const rect = svg.getBoundingClientRect();
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;

      const img = new window.Image();
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        ctx.scale(scale, scale);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const a = document.createElement("a");
        a.download = `${fileName || "layout-stiker-umkm"}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      };
      img.src = url;
    } catch {
      alert("Gagal export PNG. Coba tombol Print.");
    }
  }, [fileName]);

  const handleExportPDF = useCallback(async () => {
    try {
      if (!result) return;
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [BISA_PRINT_A3_WIDTH, BISA_PRINT_A3_HEIGHT],
      });

      const gap = cut === "kiss" ? GAP_KISS_CUT_MM : GAP_DIE_CUT_MM;
      const cellW = result.rotated ? result.designHeightMm : result.designWidthMm;
      const cellH = result.rotated ? result.designWidthMm : result.designHeightMm;
      const totalW = result.cols * (cellW + gap) - gap;
      const totalH = result.rows * (cellH + gap) - gap;
      const ox = (BISA_PRINT_A3_WIDTH - totalW) / 2;
      const oy = (BISA_PRINT_A3_HEIGHT - totalH) / 2;

      interface PDFWithGState {
        setGState(gState: unknown): void;
        GState: new (opts: { opacity: number }) => unknown;
      }
      const pdfWithGState = pdf as unknown as PDFWithGState;

      pdf.setDrawColor(222, 18, 122);

      for (let r = 0; r < result.rows; r++) {
        for (let c = 0; c < result.cols; c++) {
          const x = ox + c * (cellW + gap);
          const y = oy + r * (cellH + gap);
          const isFirst = r === 0 && c === 0;
          pdf.setFillColor(222, 18, 122);
          pdfWithGState.setGState(new pdfWithGState.GState({ opacity: isFirst ? 0.6 : 0.12 }));
          if (shape === "round") {
            pdf.circle(x + cellW / 2, y + cellH / 2, (cellW - gap) / 2, "F");
          } else {
            pdf.rect(x, y, cellW, cellH, "F");
          }
          pdfWithGState.setGState(new pdfWithGState.GState({ opacity: 1 }));
          if (shape === "round") {
            pdf.circle(x + cellW / 2, y + cellH / 2, (cellW - gap) / 2, "S");
          } else {
            pdf.rect(x, y, cellW, cellH, "S");
          }
        }
      }

      // Register marks: corners (siku) only
      pdf.setDrawColor(0, 0, 0);
      const m = 5; // small offset from sheet edge for marks
      const w = BISA_PRINT_A3_WIDTH;
      const h = BISA_PRINT_A3_HEIGHT;
      // top-left
      pdf.line(m + 5, m, m + 5, m + 15);
      pdf.line(m, m + 5, m + 15, m + 5);
      // top-right
      pdf.line(w - m - 5, m, w - m - 5, m + 15);
      pdf.line(w - m, m + 5, w - m - 15, m + 5);
      // bottom-left
      pdf.line(m + 5, h - m, m + 5, h - m - 15);
      pdf.line(m, h - m - 5, m + 15, h - m - 5);
      // bottom-right
      pdf.line(w - m - 5, h - m, w - m - 5, h - m - 15);
      pdf.line(w - m, h - m - 5, w - m - 15, h - m - 5);

      pdf.save(`${fileName || "layout-stiker-umkm"}.pdf`);
    } catch {
      alert("Gagal export PDF. Pastikan koneksi internet stabil.");
    }
  }, [result, cut, shape, fileName]);

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[var(--color-border)] bg-white p-1.5 w-fit">
        <button
          type="button"
          onClick={() => setMode("calculator")}
          aria-pressed={mode === "calculator"}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
            mode === "calculator"
              ? "bg-primary text-white shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-primary",
          )}
        >
          <Calculator className="size-4" />
          Kalkulator
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          aria-pressed={mode === "upload"}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
            mode === "upload"
              ? "bg-primary text-white shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-primary",
          )}
        >
          <Upload className="size-4" />
          Upload Design
        </button>
      </div>

      {mode === "calculator" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Calculator main */}
          <div className="flex flex-col gap-5">
            {/* Presets */}
            <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Preset Stiker UMKM
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-full border-2 border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-primary hover:text-primary"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape + design size */}
            <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Bentuk & Ukuran Design
              </p>

              <div className="mb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShape("round")}
                  aria-pressed={shape === "round"}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                    shape === "round"
                      ? "border-primary bg-primary text-white"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                  )}
                >
                  <Circle className="size-3" />
                  Bulat
                </button>
                <button
                  type="button"
                  onClick={() => setShape("square")}
                  aria-pressed={shape === "square"}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                    shape === "square"
                      ? "border-primary bg-primary text-white"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                  )}
                >
                  <Square className="size-3" />
                  Kotak
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ds-width" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                    {shape === "round" ? "Diameter (mm)" : "Lebar (mm)"}
                  </label>
                  <input
                    id="ds-width"
                    type="number"
                    min={1}
                    max={500}
                    value={designW}
                    onChange={(e) => setDesignW(e.target.value)}
                    className="w-full rounded-xl border-2 border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition focus-visible:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="ds-height" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                    {shape === "round" ? "Diameter (mm)" : "Tinggi (mm)"}
                  </label>
                  <input
                    id="ds-height"
                    type="number"
                    min={1}
                    max={500}
                    value={designH}
                    onChange={(e) => setDesignH(e.target.value)}
                    disabled={shape === "round"}
                    className="w-full rounded-xl border-2 border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition focus-visible:border-primary disabled:opacity-50"
                  />
                </div>
              </div>

              {shape === "square" && designW !== designH && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation("portrait")}
                    aria-pressed={orientation === "portrait"}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                      orientation === "portrait"
                        ? "border-primary bg-primary text-white"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                    )}
                  >
                    <Maximize className="size-3" />
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("landscape")}
                    aria-pressed={orientation === "landscape"}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                      orientation === "landscape"
                        ? "border-primary bg-primary text-white"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                    )}
                  >
                    <Maximize className="size-3 rotate-90" />
                    Landscape
                  </button>
                </div>
              )}
            </div>

            {/* Cut type */}
            <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Jenis Potongan
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCut("kiss")}
                  aria-pressed={cut === "kiss"}
                  className={cn(
                    "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                    cut === "kiss"
                      ? "border-primary bg-primary text-white"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                  )}
                >
                  Kiss Cut — gap 2 mm
                </button>
                <button
                  type="button"
                  onClick={() => setCut("die")}
                  aria-pressed={cut === "die"}
                  className={cn(
                    "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                    cut === "die"
                      ? "border-primary bg-primary text-white"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                  )}
                >
                  Die Cut — gap 4 mm
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
              <label htmlFor="ds-quantity" className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Jumlah Pesanan
              </label>
              <input
                id="ds-quantity"
                type="number"
                min={1}
                max={100000}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-2 w-full rounded-xl border-2 border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition focus-visible:border-primary"
              />
            </div>

            {/* Preview + Export */}
            {result && (
              <>
                <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Preview Layout (A3 — 325×485 mm)
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(50, z - 10))}
                        className="rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-[11px] font-semibold text-[var(--color-text-secondary)]">
                        {zoom}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(200, z + 10))}
                        className="rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div
                    className="w-full overflow-auto rounded-lg border border-[var(--color-border)] bg-white"
                    style={{
                      height: Math.max(160, (BISA_PRINT_A3_HEIGHT / BISA_PRINT_A3_WIDTH) * 220 * (zoom / 100)),
                    }}
                  >
                    <svg
                      ref={svgRef}
                      viewBox={`0 0 ${BISA_PRINT_A3_WIDTH} ${BISA_PRINT_A3_HEIGHT}`}
                      className="h-full w-auto"
                      style={{ minHeight: "100%" }}
                    >
                      <rect x={0} y={0} width={BISA_PRINT_A3_WIDTH} height={BISA_PRINT_A3_HEIGHT} fill="white" />
                      {/* Printable area */}
                      <rect
                        x={(BISA_PRINT_A3_WIDTH - PRINT_AREA_MM.width) / 2}
                        y={(BISA_PRINT_A3_HEIGHT - PRINT_AREA_MM.height) / 2}
                        width={PRINT_AREA_MM.width}
                        height={PRINT_AREA_MM.height}
                        fill="none"
                        stroke="#EC91B4"
                        strokeWidth={0.5}
                        strokeDasharray="3 2"
                      />
                      {result.total > 0 && Array.from({ length: result.rows }, (_, r) =>
                        Array.from({ length: result.cols }, (_, c) => {
                          const gap = cut === "kiss" ? GAP_KISS_CUT_MM : GAP_DIE_CUT_MM;
                          const cellW = result.rotated ? result.designHeightMm : result.designWidthMm;
                          const cellH = result.rotated ? result.designWidthMm : result.designHeightMm;
                          const totalW = result.cols * (cellW + gap) - gap;
                          const totalH = result.rows * (cellH + gap) - gap;
                          const ox = (BISA_PRINT_A3_WIDTH - totalW) / 2;
                          const oy = (BISA_PRINT_A3_HEIGHT - totalH) / 2;
                          const x = ox + c * (cellW + gap);
                          const y = oy + r * (cellH + gap);
                          const isFirst = r === 0 && c === 0;
                          const radius = shape === "round" ? (cellW - gap) / 2 : 0.5;
                          return (
                            <rect
                              key={`${r}-${c}`}
                              x={x}
                              y={y}
                              width={cellW}
                              height={cellH}
                              rx={radius}
                              ry={radius}
                              fill="#DE127A"
                              opacity={isFirst ? 0.6 : 0.1}
                              stroke="#DE127A"
                              strokeWidth={0.3}
                            />
                          );
                        }),
                      )}
                      {/* Register marks: siku (corners) */}
                      <g stroke="black" strokeWidth={0.3}>
                        {/* top-left */}
                        <line x1={8} y1={5} x2={8} y2={20} />
                        <line x1={5} y1={8} x2={20} y2={8} />
                        {/* top-right */}
                        <line x1={BISA_PRINT_A3_WIDTH - 8} y1={5} x2={BISA_PRINT_A3_WIDTH - 8} y2={20} />
                        <line x1={BISA_PRINT_A3_WIDTH - 5} y1={8} x2={BISA_PRINT_A3_WIDTH - 20} y2={8} />
                        {/* bottom-left */}
                        <line x1={8} y1={BISA_PRINT_A3_HEIGHT - 5} x2={8} y2={BISA_PRINT_A3_HEIGHT - 20} />
                        <line x1={5} y1={BISA_PRINT_A3_HEIGHT - 8} x2={20} y2={BISA_PRINT_A3_HEIGHT - 8} />
                        {/* bottom-right */}
                        <line x1={BISA_PRINT_A3_WIDTH - 8} y1={BISA_PRINT_A3_HEIGHT - 5} x2={BISA_PRINT_A3_WIDTH - 8} y2={BISA_PRINT_A3_HEIGHT - 20} />
                        <line x1={BISA_PRINT_A3_WIDTH - 5} y1={BISA_PRINT_A3_HEIGHT - 8} x2={BISA_PRINT_A3_WIDTH - 20} y2={BISA_PRINT_A3_HEIGHT - 8} />
                      </g>
                    </svg>
                  </div>

                  {/* File name + Export */}
                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      aria-label="Nama file cetak"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full rounded-xl border-2 border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition focus-visible:border-primary"
                      placeholder="nama-file-cetak"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleExportPNG}
                        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
                      >
                        <ImageIcon className="size-4" />
                        Simpan PNG
                      </button>
                      <button
                        type="button"
                        onClick={handleExportPDF}
                        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent/90"
                      >
                        <FileText className="size-4" />
                        Simpan PDF
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Paper info */}
            <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Kertas (A3 BisaPrint)
              </p>
              <div className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                <p>• Ukuran kertas: <span className="font-semibold text-[var(--color-text-primary)]">325 × 485 mm</span></p>
                <p>• Area cetak: <span className="font-semibold text-[var(--color-text-primary)]">305 × 460 mm</span></p>
                <p>• Register marks: <span className="font-semibold text-[var(--color-text-primary)]">siku</span></p>
                <p>• Margin: <span className="font-semibold text-[var(--color-text-primary)]">0 mm</span> (ikut area cetak)</p>
              </div>
            </div>

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border-2 border-accent bg-gradient-to-br from-accent/5 to-transparent p-4"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Hasil Simulasi
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Bentuk</span>
                    <span className="font-semibold text-[var(--color-text-primary)] capitalize">
                      {shape === "round" ? "Bulat" : "Kotak"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Ukuran design</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {sw} × {sh} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Jenis potong</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {cut === "kiss" ? "Kiss cut" : "Die cut"} ({cut === "kiss" ? GAP_KISS_CUT_MM : GAP_DIE_CUT_MM} mm)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Layout</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {result.cols} × {result.rows}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Efisiensi area</span>
                    <span className={cn("font-semibold", result.utilization > 60 ? "text-green-600" : result.utilization > 35 ? "text-accent" : "text-red-500")}>
                      {result.utilization}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Jumlah lembar</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {sheets} lembar
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
                    <span className="font-bold text-[var(--color-text-primary)]">
                      Total per lembar
                    </span>
                    <span className="font-display text-xl font-black text-accent">
                      {result.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--color-text-primary)]">
                      Estimasi harga*
                    </span>
                    <span className="font-display text-lg font-black text-accent">
                      Rp {estimatedPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-[11px] italic text-[var(--color-text-muted)]">
                    *Indikatif per lembar A3 — harga final dikonfirmasi admin via WhatsApp.
                  </p>
                  {result.rotated && (
                    <p className="text-xs italic text-accent">
                      * Design diputar untuk hasil optimal
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-white p-4">
              <div className="flex items-center gap-2">
                <Printer className="size-4 text-accent" />
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">Catatan</p>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                <li>&bull; Fokus: stiker kemasan UMKM</li>
                <li>&bull; Bentuk bulat & kotak</li>
                <li>&bull; Kiss cut = 2 mm, die cut = 4 mm</li>
                <li>&bull; Estimasi harga bersifat patokan</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={resetCalculator}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-primary hover:text-primary"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
          </div>
        </div>
      ) : (
        /* Upload mode */
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="min-h-[400px]">
            {imageDataUrl ? (
              <motion.div
                key="canvas"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full"
              >
                <DesignCanvas
                  imageDataUrl={imageDataUrl}
                  onImpositionChange={setUploadImposition}
                />
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[400px] items-center justify-center"
              >
                <UploadZone
                  onFileUpload={handleFileUpload}
                  className="w-full max-w-md"
                />
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
              <label className="mb-3 block text-sm font-bold text-[var(--color-text-primary)]">
                Ukuran Kertas
              </label>
              <p className="text-sm text-[var(--color-text-secondary)]">
                A3 BisaPrint — 325 × 485 mm (area cetak 305 × 460 mm)
              </p>
            </div>

            {uploadImposition && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border-2 border-accent bg-[var(--color-bg-soft)] p-4"
              >
                <label className="mb-3 block text-sm font-bold text-[var(--color-text-primary)]">
                  Hasil Simulasi
                </label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Ukuran design</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {uploadImposition.designWidthMm} × {uploadImposition.designHeightMm} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Layout</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {uploadImposition.cols} × {uploadImposition.rows}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
                    <span className="font-bold text-[var(--color-text-primary)]">Total per lembar</span>
                    <span className="font-display text-lg font-black text-accent">
                      {uploadImposition.total} pcs
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-white p-4">
              <div className="flex items-center gap-2">
                <Printer className="size-4 text-accent" />
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">Tips</p>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                <li>&bull; Resize dari corner handles</li>
                <li>&bull; Atau isi ukuran L × T di pojok kanan atas</li>
                <li>&bull; Default A3 BisaPrint</li>
                <li>&bull; Gap antar design: 2 mm</li>
              </ul>
            </div>

            {imageDataUrl && (
              <button
                type="button"
                onClick={() => setImageDataUrl(null)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-primary hover:text-primary"
              >
                <RotateCcw className="size-4" />
                Upload Design Baru
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const BISA_PRINT_A3_WIDTH = BISA_PRINT_A3.widthMm;
const BISA_PRINT_A3_HEIGHT = BISA_PRINT_A3.heightMm;
