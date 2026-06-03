"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "./UploadZone";
import { DesignCanvas } from "./DesignCanvas";
import {
  PAPER_SIZES,
  DEFAULT_PAPER,
  type PaperSize,
  type ImpositionResult,
} from "@/lib/paper-sizes";
import { cn } from "@/lib/utils";
import { Lightbulb, RotateCcw } from "lucide-react";

export function DesignSimulator() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<PaperSize>(DEFAULT_PAPER);
  const [imposition, setImposition] = useState<ImpositionResult | null>(null);

  const handleFileUpload = useCallback((_file: File, dataUrl: string) => {
    setImageDataUrl(dataUrl);
  }, []);

  const handleReset = () => {
    setImageDataUrl(null);
    setImposition(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {imageDataUrl ? (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full"
            >
              <DesignCanvas
                imageDataUrl={imageDataUrl}
                paperSize={selectedPaper}
                onImpositionChange={setImposition}
              />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[400px] items-center justify-center"
            >
              <UploadZone
                onFileUpload={handleFileUpload}
                className="w-full max-w-md"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-4">
          <label className="mb-3 block text-sm font-bold text-[var(--color-text-primary)]">
            Ukuran Kertas
          </label>
          <div className="flex flex-wrap gap-2">
            {PAPER_SIZES.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedPaper(size)}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                  selectedPaper.id === size.id
                    ? "border-primary bg-primary text-white"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                )}
              >
                {size.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {imposition && (
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
                  {imposition.designWidthMm} &times; {imposition.designHeightMm} mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Kertas</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {imposition.sheetWidthMm} &times; {imposition.sheetHeightMm} mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Layout</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {imposition.cols} &times; {imposition.rows}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
                <span className="font-bold text-[var(--color-text-primary)]">Total per lembar</span>
                <span className="font-display text-lg font-black text-accent">
                  {imposition.total} pcs
                </span>
              </div>
              {imposition.rotated && (
                <p className="text-xs text-accent italic">
                  * Design diputar untuk hasil optimal
                </p>
              )}
            </div>
          </motion.div>
        )}

        <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-white p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-accent" />
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">Tips</p>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
            <li>&bull; Drag design untuk posisi</li>
            <li>&bull; Resize dari corner handles</li>
            <li>&bull; Default kertas A3</li>
            <li>&bull; Gap antar design: 2mm</li>
          </ul>
        </div>

        {imageDataUrl && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-primary hover:text-primary"
          >
            <RotateCcw className="size-4" />
            Upload Design Baru
          </button>
        )}
      </div>
    </div>
  );
}
