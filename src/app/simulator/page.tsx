"use client";

import { DesignSimulator } from "@/components/design-simulator/DesignSimulator";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-soft)]">
      <div className="sticky top-0 z-50 border-b-2 border-[var(--color-border)] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Printer className="size-5 text-accent" />
              <h1 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                Simulasi Cetak
              </h1>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Kalkulator stiker UMKM: bulat & kotak, kertas A3 BisaPrint
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DesignSimulator />
      </div>
    </div>
  );
}
