"use client";

import Image from "next/image";

import { portfolioItems } from "@/data/portfolio";
import type { PortfolioItem } from "@/data/portfolio";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { Variants } from "framer-motion";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const ROTATIONS = ["-1.5deg", "1deg", "-0.5deg", "1.5deg"] as const;

const gradients = [
  "from-[#DE127A] to-[#EC91B4]",      // brand pink
  "from-[#E87817] to-[#F5A860]",      // brand orange
  "from-[#D66E9E] to-[#DE127A]",      // muted pink
  "from-[#EC91B4] to-[#FFEAF4]",      // light pink
  "from-[#E87817] to-[#D66E9E]",      // orange-pink
  "from-[#D66E9E] to-[#EC91B4]",      // pink gradient
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};





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
  const rotation = ROTATIONS[index % ROTATIONS.length];

  return (
    <div
      className="group relative mb-5 break-inside-avoid transition-all duration-200 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_40px_-8px_rgba(224,24,122,0.14),0_6px_16px_-4px_rgba(0,0,0,0.08)]"
      style={{ rotate: rotation }}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border-2 border-[var(--color-border)] bg-white shadow-sm transition-shadow duration-300",
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
      <DecorativeImage
        src="/assets/decoratives/torn-paper-corner.png"
        width={300}
        height={220}
        opacity={0.55}
        className="-bottom-6 -left-6 z-0 hidden md:block"
      />
      <DecorativeImage
        src="/assets/decoratives/sparkle-stars.png"
        width={120}
        height={118}
        opacity={0.6}
        className="-right-6 top-8 z-0 hidden md:block"
      />

      {/* Section header */}
      <ScrollReveal className="relative z-10 flex flex-col items-center text-center">
        <h2 className="inline-flex items-center font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Hasil Cetak Kami
          <Image
            src="/assets/decoratives/camera-sticker.png"
            alt=""
            width={110}
            height={105}
            className="ml-3 inline-block -rotate-8 align-middle animate-pulse hidden sm:block"
            quality={90}
            sizes="(max-width: 768px) 100px, 200px"
          />
        </h2>
        <div className="relative mt-2 h-7 w-[200px] md:w-[240px] select-none pointer-events-none">
          <Image 
            src="/assets/decoratives/swoosh-orange.png"
            alt="" 
            fill
            className="object-contain opacity-80"
            aria-hidden="true"
            quality={90}
            sizes="(max-width: 768px) 200px, 400px"
          />
        </div>
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
