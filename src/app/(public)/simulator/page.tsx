"use client";

import { DesignSimulator } from "@/components/design-simulator/DesignSimulator";
import { ArrowLeft, Printer, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SimulatorPage() {
  return (
    <div className="relative min-h-screen bg-[var(--color-bg-soft)]">
      {/* tekstur halus */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                <Printer className="size-6 text-primary" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-black text-[var(--color-text-primary)] sm:text-3xl">
                    Simulasi Cetak
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-accent)]">
                    <Sparkles className="size-3" />
                    Gratis
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                  Kalkulator stiker UMKM: hitung jumlah per lembar A3, susun layout otomatis, export PDF siap cetak.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DesignSimulator />
      </div>
    </div>
  );
}
