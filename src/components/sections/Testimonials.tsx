"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { testimonials } from "@/data/testimonials";
import type { Testimonial, TestimonialSource } from "@/data/testimonials";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const ROTATIONS = ["-1deg", "0.5deg", "-0.5deg", "0.8deg", "-0.3deg", "0.6deg"];

const cardVariants = {
  hidden: { opacity: 0, y: 28, rotate: 0 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: ROTATIONS[i % ROTATIONS.length],
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: i * 0.08,
    },
  }),
};

// ─── Source badge ────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: TestimonialSource }) {
  if (source === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1 text-xs font-semibold text-white">
        <WhatsAppMiniIcon />
        WhatsApp
      </span>
    );
  }

  if (source === "google") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
        <span className="flex gap-0.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-[#4285F4]" />
          <span className="size-2 rounded-full bg-[#EA4335]" />
          <span className="size-2 rounded-full bg-[#FBBC05]" />
          <span className="size-2 rounded-full bg-[#34A853]" />
        </span>
        Google
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#42B549] px-3 py-1 text-xs font-semibold text-white">
      Marketplace
    </span>
  );
}

// ─── WhatsApp mini icon ──────────────────────────────────────────────────────

function WhatsAppMiniIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-3"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Star rating ─────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span
      className="text-base tracking-wide"
      aria-label={`Rating ${rating} dari 5`}
    >
      {Array.from({ length: rating }, (_, i) => (
        <span key={i} aria-hidden="true">
          ⭐
        </span>
      ))}
    </span>
  );
}

// ─── WhatsApp header bar ─────────────────────────────────────────────────────

function WhatsAppHeaderBar() {
  return (
    <div className="flex items-center gap-2 rounded-t-2xl bg-[#075E54] px-4 py-2.5">
      <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
        <WhatsAppMiniIcon />
      </div>
      <div>
        <p className="text-xs font-bold text-white">BisaPrint</p>
        <p className="text-[10px] text-white/60">online</p>
      </div>
    </div>
  );
}

// ─── Testimonial card ────────────────────────────────────────────────────────

function TestimonialCard({
  item,
  index,
}: {
  item: Testimonial;
  index: number;
}) {
  const isWhatsApp = item.source === "whatsapp";

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{
        rotate: "0deg",
        scale: 1.02,
        boxShadow:
          "0 12px 32px -4px rgba(224,24,122,0.14), 0 4px 12px -2px rgba(0,0,0,0.06)",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex h-full cursor-default flex-col overflow-hidden rounded-2xl border-2 shadow-sm relative",
        isWhatsApp
          ? "border-[#075E54]/30"
          : "border-[var(--color-border)]",
      )}
    >
        {/* Decoratives */}
        {index % 2 === 0 && (
          <DecorativeImage
            src="/assets/decoratives/tape-strip.png"
            width={120}
            height={51}
            rotate={-3}
            className="-top-5 left-1/2 -translate-x-1/2 z-20 drop-shadow-sm hidden sm:block"
          />
        )}
        <DecorativeImage
          src="/assets/decoratives/bow-ribbon.png"
          width={80}
          height={85}
          rotate={10}
          className="-right-5 -top-5 z-10 drop-shadow-sm hidden sm:block"
        />

      {/* WhatsApp header bar */}
      {isWhatsApp && <WhatsAppHeaderBar />}

      {/* Card body with paper texture */}
      <div
        className={cn(
          "relative flex flex-1 flex-col bg-white p-5",
          !isWhatsApp && "rounded-t-2xl",
        )}
        style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            rgba(224,24,122,0.04) 27px,
            rgba(224,24,122,0.04) 28px
          )`,
        }}
      >
        <SourceBadge source={item.source} />

        <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          &ldquo;{item.quote}&rdquo;
        </blockquote>

        <footer className="mt-5 flex items-center justify-between gap-3">
          <cite className="font-display text-sm font-bold not-italic text-[var(--color-text-primary)]">
            {item.name}
          </cite>
          <StarRating rating={item.rating} />
        </footer>
      </div>
    </motion.article>
  );
}

// ─── Sticky note callout ─────────────────────────────────────────────────────

function VerifiedCallout() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, rotate: "-2deg", scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      className="mx-auto mb-8 w-fit rounded-lg bg-[var(--color-accent-light)] px-5 py-3 shadow-md"
      style={{
        boxShadow:
          "2px 3px 0 rgba(0,0,0,0.06), 0 8px 24px -4px rgba(224,120,32,0.15)",
      }}
    >
      <p className="font-display text-sm font-black text-[var(--color-text-primary)]">
        100% review asli
      </p>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Testimonials() {
  return (
    <SectionWrapper id="testimoni" bgVariant="soft" className="relative">
      <DecorativeImage
        src="/assets/decoratives/sparkle-stars.png"
        width={90}
        height={88}
        opacity={0.5}
        className="-left-6 -top-6 z-0 hidden md:block"
      />

      {/* Section header */}
      <div className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Kata Mereka
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
          Bukan kami yang bilang. Mereka yang membuktikan.
        </p>
      </div>

      {/* Verified sticky note */}
      <div className="mt-10">
        <VerifiedCallout />
      </div>

      {/* Testimonial cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <TestimonialCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}
