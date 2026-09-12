import Image from "next/image";
import { cn } from "@/lib/utils";

// Logo brand BisaPrint: mark PNG transparan (hasil remove-bg dari
// logo-bisaprint.webp) + wordmark HTML — SVG <text> di dalam <img> tidak bisa
// mengakses font halaman, jadi wordmark dirender sebagai HTML agar tetap pakai
// font-display asli. `light` untuk latar gelap (footer).
export function BrandLogo({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/assets/brand/logo-bisaprint-mark.png"
        alt="Logo BisaPrint"
        width={966}
        height={975}
        className="size-9 shrink-0"
        priority
      />
      <span
        className={cn(
          "font-display text-xl font-extrabold tracking-tight",
          light ? "text-white" : "text-[var(--color-text-primary)]",
        )}
      >
        Bisa<span className="text-[var(--color-primary)]">Print</span>
      </span>
    </span>
  );
}
