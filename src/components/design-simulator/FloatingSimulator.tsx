"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X, RotateCcw, Printer, ZoomIn, ZoomOut, FileText, ImageIcon, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAPER_SIZES, calculateImposition, type PaperSize, type ImpositionResult } from "@/lib/paper-sizes";

type Orientation = "portrait" | "landscape";
type RegisterMode = "none" | "center" | "siku-l";

interface Preset {
  name: string;
  w: number;
  h: number;
}

const PRESETS: Preset[] = [
  { name: "Kartu Nama", w: 85, h: 55 },
  { name: "Brosur A5", w: 148, h: 210 },
  { name: "Stiker A4", w: 210, h: 297 },
  { name: "Poster A3", w: 297, h: 420 },
  { name: "Label Kecil", w: 50, h: 70 },
  { name: "Flyer DL", w: 99, h: 210 },
];

export function FloatingSimulator() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [designW, setDesignW] = useState(50);
  const [designH, setDesignH] = useState(70);
  const [gutter, setGutter] = useState(2);
  const [margin, setMargin] = useState(10);
  const [selectedPaper, setSelectedPaper] = useState<PaperSize>(PAPER_SIZES[0]);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [register, setRegister] = useState<RegisterMode>("none");
  const [fileName, setFileName] = useState("layout-cetak");
  const [zoom, setZoom] = useState(100);
  const [isMobile, setIsMobile] = useState(false);
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    let timer: ReturnType<typeof setTimeout>;
    const debounced = () => {
      clearTimeout(timer);
      timer = setTimeout(check, 150);
    };
    window.addEventListener("resize", debounced);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", debounced);
    };
  }, []);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  const sw = useMemo(() => {
    if (orientation === "landscape") return designH;
    return designW;
  }, [designW, designH, orientation]);

  const sh = useMemo(() => {
    if (orientation === "landscape") return designW;
    return designH;
  }, [designW, designH, orientation]);

  const result: ImpositionResult | null = useMemo(() => {
    if (sw <= 0 || sh <= 0) return null;
    const usableW = selectedPaper.widthMm - 2 * margin;
    const usableH = selectedPaper.heightMm - 2 * margin;
    if (usableW <= 0 || usableH <= 0) return null;
    return calculateImposition(usableW, usableH, sw, sh, gutter);
  }, [sw, sh, gutter, margin, selectedPaper]);

  const efficiency = useMemo(() => {
    if (!result) return 0;
    const cellW = result.rotated ? result.designHeightMm : result.designWidthMm;
    const cellH = result.rotated ? result.designWidthMm : result.designHeightMm;
    const used = result.total * cellW * cellH;
    const totalSheet = (selectedPaper.widthMm - 2 * margin) * (selectedPaper.heightMm - 2 * margin);
    if (totalSheet <= 0) return 0;
    return Math.round((used / totalSheet) * 100);
  }, [result, selectedPaper, margin]);

  const applyPreset = useCallback((preset: Preset) => {
    setDesignW(preset.w);
    setDesignH(preset.h);
  }, []);

  const handleExportPNG = useCallback(async () => {
    if (!svgRef.current) return;
    setExporting("png");
    try {
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
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
        a.download = `${fileName || "layout-cetak"}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        setExporting(null);
      };
      img.src = url;
    } catch {
      alert("Gagal export PNG. Coba gunakan tombol Print.");
      setExporting(null);
    }
  }, [fileName]);

  const handleExportPDF = useCallback(async () => {
    setExporting("pdf");
    try {
      if (!result) { setExporting(null); return; }

      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: selectedPaper.widthMm > selectedPaper.heightMm ? "landscape" : "portrait",
        unit: "mm",
        format: [selectedPaper.widthMm, selectedPaper.heightMm],
      });

      const cellW = result.rotated ? result.designHeightMm : result.designWidthMm;
      const cellH = result.rotated ? result.designWidthMm : result.designHeightMm;
      const totalW = result.cols * (cellW + gutter) - gutter;
      const totalH = result.rows * (cellH + gutter) - gutter;
      const ox = margin + (selectedPaper.widthMm - 2 * margin - totalW) / 2;
      const oy = margin + (selectedPaper.heightMm - 2 * margin - totalH) / 2;

      pdf.setDrawColor(222, 18, 122);
      pdf.setFillColor(222, 18, 122);

      for (let r = 0; r < result.rows; r++) {
        for (let c = 0; c < result.cols; c++) {
          const x = ox + c * (cellW + gutter);
          const y = oy + r * (cellH + gutter);
          const isFirst = r === 0 && c === 0;
          pdf.setFillColor(222, 18, 122);
          pdf.setGState(new (pdf as any).GState({ opacity: isFirst ? 0.6 : 0.12 }));
          pdf.rect(x, y, cellW, cellH, "F");
          pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
          pdf.rect(x, y, cellW, cellH, "S");
        }
      }

      if (register === "center") {
        const cx = selectedPaper.widthMm / 2;
        const cy = selectedPaper.heightMm / 2;
        pdf.setDrawColor(0, 0, 0);
        pdf.line(cx - 5, cy, cx + 5, cy);
        pdf.line(cx, cy - 5, cx, cy + 5);
      } else if (register === "siku-l") {
        pdf.setDrawColor(0, 0, 0);
        pdf.line(margin + 5, margin, margin + 5, margin + 15);
        pdf.line(margin, margin + 5, margin + 15, margin + 5);
        const trX = selectedPaper.widthMm - margin;
        const trY = margin;
        pdf.line(trX - 5, trY, trX - 5, trY + 15);
        pdf.line(trX, trY + 5, trX - 15, trY + 5);
        const blX = margin;
        const blY = selectedPaper.heightMm - margin;
        pdf.line(blX + 5, blY, blX + 5, blY - 15);
        pdf.line(blX, blY - 5, blX + 15, blY - 5);
        const brX = selectedPaper.widthMm - margin;
        const brY = selectedPaper.heightMm - margin;
        pdf.line(brX - 5, brY, brX - 5, brY - 15);
        pdf.line(brX, brY - 5, brX - 15, brY - 5);
      }

      pdf.save(`${fileName || "layout-cetak"}.pdf`);
    } catch {
      alert("Gagal export PDF. Pastikan koneksi internet stabil.");
    }
    setExporting(null);
  }, [result, selectedPaper, gutter, margin, register, fileName]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const resetAll = useCallback(() => {
    setDesignW(50);
    setDesignH(70);
    setGutter(2);
    setMargin(10);
    setOrientation("portrait");
    setRegister("none");
    setFileName("layout-cetak");
    setZoom(100);
  }, []);

  const sideVariants = isMobile
    ? {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
      }
    : {
        initial: { x: "-100%" },
        animate: { x: 0 },
        exit: { x: "-100%" },
      };

  const panelClasses = isMobile
    ? "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t-2 border-[var(--color-border)] bg-white shadow-2xl"
    : "fixed left-0 top-0 z-50 h-full overflow-y-auto border-r-2 border-[var(--color-border)] bg-white shadow-2xl w-full md:w-[380px]";

  if (pathname.startsWith("/checkout") || pathname.startsWith("/simulator")) return null;

  return (
    <>
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Tutup simulasi cetak" : "Buka simulasi cetak"}
        className={cn(
          "fixed left-0 top-1/2 z-50 -translate-y-1/2 rounded-r-xl border-2 border-l-0 border-accent bg-accent px-3 py-4 text-white shadow-lg shadow-accent/30 transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/40",
          isOpen && (isMobile ? "translate-y-0" : "translate-x-[380px]"),
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Printer className="size-5" />
        <span className="mt-1 block text-[10px] font-bold leading-tight tracking-wide">
          SIMULASI CETAK
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />

            <motion.aside
              initial={sideVariants.initial}
              animate={sideVariants.animate}
              exit={sideVariants.exit}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className={panelClasses}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[var(--color-border)] bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <Printer className="size-5 text-accent" />
                  <h2 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                    Simulasi Cetak
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Tutup"
                  className="inline-flex size-9 items-center justify-center rounded-full border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-soft)]"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex flex-col gap-5 p-4 pb-8">
                <div className="space-y-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Preset Cepat
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="rounded-full border-2 border-[var(--color-border)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)] transition hover:border-primary hover:text-primary"
                      >
                        {preset.name} ({preset.w}&times;{preset.h})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Ukuran Design
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                        Lebar (mm)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={designW}
                        onChange={(e) => setDesignW(Math.max(1, Number(e.target.value)))}
                        className="w-full rounded-xl border-2 border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
                        Tinggi (mm)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={designH}
                        onChange={(e) => setDesignH(Math.max(1, Number(e.target.value)))}
                        className="w-full rounded-xl border-2 border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
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
                      onClick={() => setOrientation(orientation === "landscape" ? "portrait" : "landscape")}
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
                </div>

                <div className="space-y-3 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Kertas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PAPER_SIZES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPaper(p)}
                        className={cn(
                          "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                          selectedPaper.id === p.id
                            ? "border-primary bg-primary text-white"
                            : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                        )}
                      >
                        {p.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                    <label className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Gap (mm)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={gutter}
                      onChange={(e) => setGutter(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{gutter} mm</span>
                  </div>
                  <div className="space-y-2 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                    <label className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Margin (mm)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{margin} mm</span>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Register Marks
                  </p>
                  <div className="mt-2 flex gap-2">
                    {(["none", "center", "siku-l"] as RegisterMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setRegister(mode)}
                        className={cn(
                          "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                          register === mode
                            ? "border-primary bg-primary text-white"
                            : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                        )}
                      >
                        {mode === "none" ? "None" : mode === "center" ? "O (Center)" : "L (Siku)"}
                      </button>
                    ))}
                  </div>
                </div>

                {result && (
                  <>
                    <div className="rounded-2xl border-2 border-accent bg-gradient-to-br from-accent/5 to-transparent p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Hasil Simulasi
                      </p>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">Layout</span>
                          <span className="font-semibold text-[var(--color-text-primary)]">
                            {result.cols} &times; {result.rows}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">Efisiensi Kertas</span>
                          <span className={cn("font-semibold", efficiency > 60 ? "text-green-600" : efficiency > 35 ? "text-accent" : "text-red-500")}>
                            {efficiency}%
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
                        {result.rotated && (
                          <p className="text-xs italic text-accent">
                            * Design diputar untuk hasil optimal
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                          Preview Layout
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
                        style={{ height: Math.max(120, (selectedPaper.heightMm / selectedPaper.widthMm) * 180 * (zoom / 100)) }}
                      >
                        <svg
                          ref={svgRef}
                          viewBox={`0 0 ${selectedPaper.widthMm} ${selectedPaper.heightMm}`}
                          className="h-full w-auto"
                          style={{ minHeight: "100%" }}
                        >
                          <rect x={0} y={0} width={selectedPaper.widthMm} height={selectedPaper.heightMm} fill="white" />
                          <rect
                            x={margin}
                            y={margin}
                            width={selectedPaper.widthMm - 2 * margin}
                            height={selectedPaper.heightMm - 2 * margin}
                            fill="none"
                            stroke="#EC91B4"
                            strokeWidth={0.5}
                            strokeDasharray="3 2"
                          />
                          {Array.from({ length: result.rows }, (_, r) =>
                            Array.from({ length: result.cols }, (_, c) => {
                              const cellW = result.rotated ? result.designHeightMm : result.designWidthMm;
                              const cellH = result.rotated ? result.designWidthMm : result.designHeightMm;
                              const totalW = result.cols * (cellW + gutter) - gutter;
                              const totalH = result.rows * (cellH + gutter) - gutter;
                              const ox = margin + (selectedPaper.widthMm - 2 * margin - totalW) / 2;
                              const oy = margin + (selectedPaper.heightMm - 2 * margin - totalH) / 2;
                              const x = ox + c * (cellW + gutter);
                              const y = oy + r * (cellH + gutter);
                              const isFirst = r === 0 && c === 0;
                              return (
                                <rect
                                  key={`${r}-${c}`}
                                  x={x}
                                  y={y}
                                  width={cellW}
                                  height={cellH}
                                  fill="#DE127A"
                                  opacity={isFirst ? 0.6 : 0.1}
                                  stroke="#DE127A"
                                  strokeWidth={0.3}
                                  rx={0.5}
                                />
                              );
                            }),
                          )}
                          {register === "center" && (
                            <>
                              <line x1={selectedPaper.widthMm / 2 - 3} y1={selectedPaper.heightMm / 2} x2={selectedPaper.widthMm / 2 + 3} y2={selectedPaper.heightMm / 2} stroke="black" strokeWidth={0.3} />
                              <line x1={selectedPaper.widthMm / 2} y1={selectedPaper.heightMm / 2 - 3} x2={selectedPaper.widthMm / 2} y2={selectedPaper.heightMm / 2 + 3} stroke="black" strokeWidth={0.3} />
                            </>
                          )}
                          {register === "siku-l" && (
                            <>
                              <line x1={margin + 3} y1={margin} x2={margin + 3} y2={margin + 10} stroke="black" strokeWidth={0.3} />
                              <line x1={margin} y1={margin + 3} x2={margin + 10} y2={margin + 3} stroke="black" strokeWidth={0.3} />
                              <line x1={selectedPaper.widthMm - margin - 3} y1={margin} x2={selectedPaper.widthMm - margin - 3} y2={margin + 10} stroke="black" strokeWidth={0.3} />
                              <line x1={selectedPaper.widthMm - margin} y1={margin + 3} x2={selectedPaper.widthMm - margin - 10} y2={margin + 3} stroke="black" strokeWidth={0.3} />
                              <line x1={margin + 3} y1={selectedPaper.heightMm - margin} x2={margin + 3} y2={selectedPaper.heightMm - margin - 10} stroke="black" strokeWidth={0.3} />
                              <line x1={margin} y1={selectedPaper.heightMm - margin - 3} x2={margin + 10} y2={selectedPaper.heightMm - margin - 3} stroke="black" strokeWidth={0.3} />
                              <line x1={selectedPaper.widthMm - margin - 3} y1={selectedPaper.heightMm - margin} x2={selectedPaper.widthMm - margin - 3} y2={selectedPaper.heightMm - margin - 10} stroke="black" strokeWidth={0.3} />
                              <line x1={selectedPaper.widthMm - margin} y1={selectedPaper.heightMm - margin - 3} x2={selectedPaper.widthMm - margin - 10} y2={selectedPaper.heightMm - margin - 3} stroke="black" strokeWidth={0.3} />
                            </>
                          )}
                        </svg>
                      </div>
                    </div>

                    <div className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                      <label className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Nama File
                      </label>
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition focus:border-primary"
                        placeholder="nama-file-cetak"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleExportPNG}
                        disabled={exporting !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
                      >
                        {exporting === "png" ? (
                          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <ImageIcon className="size-4" />
                        )}
                        Simpan PNG
                      </button>
                      <button
                        type="button"
                        onClick={handleExportPDF}
                        disabled={exporting !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
                      >
                        {exporting === "pdf" ? (
                          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                        Simpan PDF
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-primary hover:text-primary"
                    >
                      <Printer className="size-4" />
                      Cetak
                    </button>

                    <a
                      href="/simulator"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                    >
                      <Calculator className="size-4" />
                      Buka Simulator Lengkap
                    </a>
                  </>
                )}

                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-primary hover:text-primary"
                >
                  <RotateCcw className="size-4" />
                  Reset
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
