"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingSimulator() {
  const pathname = usePathname();

  if (pathname.startsWith("/checkout") || pathname.startsWith("/simulator")) return null;

  return (
    <Link
      href="/simulator"
      aria-label="Buka Simulasi Cetak"
      className={cn(
        "group fixed bottom-24 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 transition hover:scale-110 hover:shadow-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40 animate-pulse-sim",
      )}
    >
      <Calculator className="size-6" aria-hidden="true" />
      <span className="absolute bottom-full right-0 mb-2 scale-0 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition group-hover:scale-100" role="tooltip">
        Simulasi Cetak
      </span>
    </Link>
  );
}
