"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Ada yang Error
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          Maaf, terjadi kesalahan yang tidak terduga. Coba muat ulang halaman ini.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-border)] px-6 py-3 font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-soft)]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
