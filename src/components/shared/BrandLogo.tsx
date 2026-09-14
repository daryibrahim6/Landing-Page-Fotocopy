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
        src="/assets/brand/logo-bisaprint-mark-v2.png"
        alt="Logo BisaPrint"
        width={966}
        height={975}
        className="size-9 shrink-0"
        priority
      />
      <span
        className={cn(
          // leading-none + translate: tanpa ini line-box text-xl (28px) bikin
          // wordmark optically naik ~1px dari center mark — keliatan "keatasan".
          "font-display translate-y-[0.5px] text-xl font-extrabold leading-none tracking-tight",
          light ? "text-white" : "text-[var(--color-text-primary)]",
        )}
      >
        Bisa<span className="text-[var(--color-primary)]">Print</span>
      </span>
    </span>
  );
}
