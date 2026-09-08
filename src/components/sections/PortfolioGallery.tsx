"use client";

import Image from "next/image";

import { portfolioItems } from "@/data/portfolio";
import type { PortfolioItem } from "@/data/portfolio";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const gradients = [
  "from-slate-800 to-slate-600",
  "from-slate-700 to-slate-500",
  "from-neutral-700 to-neutral-500",
  "from-zinc-700 to-zinc-500",
  "from-stone-700 to-stone-500",
  "from-gray-700 to-gray-500",
];





// ─── Portfolio tile ──────────────────────────────────────────────────────────

function PortfolioTile({
  item,
  index,
}: {
  item: PortfolioItem;
  index: number;
}) {
  const hasImage = item.image.trim().length > 0;
  const aspects = ["aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]"];
  const aspect = aspects[index % aspects.length];

  return (
    <div
      className="group relative mb-5 break-inside-avoid transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12),0_6px_16px_-4px_rgba(0,0,0,0.08)]"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition-shadow duration-300",
          aspect,
        )}
      >
        {hasImage ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className={cn("flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center bg-gradient-to-br", gradients[index % gradients.length])}>
            <p className="text-sm font-semibold text-white">{item.category}</p>
          </div>
        )}

        {/* Hover overlay with title */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[var(--color-text-primary)]/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div>
            <p className="font-display text-base font-bold text-white md:text-lg">
              {item.title}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {item.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

// TODO: replace with higher res version
export function PortfolioGallery() {
  return (
    <SectionWrapper id="portfolio" bgVariant="white" className="relative overflow-hidden">
      {/* Section header */}
      <ScrollReveal className="relative z-10 flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Hasil Cetak Kami
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Ribuan produk sudah keluar dari mesin kami. Ini sebagian hasilnya.
        </p>
      </ScrollReveal>

      {/* Masonry-like CSS columns grid */}
      <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {portfolioItems.map((item, index) => (
          <PortfolioTile key={item.id} item={item} index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}
