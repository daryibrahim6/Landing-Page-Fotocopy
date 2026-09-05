"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Building2, BookOpen, Landmark, ShoppingBag } from "lucide-react";
import { testimonials, clientBadges } from "@/data/testimonials";
import type { Testimonial, TestimonialSource, ClientBadge } from "@/data/testimonials";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const stats = [
  { value: "10.000+", label: "Customer di Shopee" },
  { value: "5+", label: "Tahun Berpengalaman" },
  { value: "5", label: "Kategori Layanan" },
];

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
    <span className="inline-flex rounded-full bg-[#EE4D2D] px-3 py-1 text-xs font-semibold text-white">
      Shopee
    </span>
  );
}

function WhatsAppMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-base" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: rating }, (_, i) => (
        <Star key={i} className="size-4 fill-[var(--color-accent)] text-[var(--color-accent)]" aria-hidden="true" />
      ))}
    </span>
  );
}

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

const badgeIcons: Record<string, LucideIcon> = {
  building: Building2,
  book: BookOpen,
  "book-2": BookOpen,
  mosque: Landmark,
  "shopping-bag": ShoppingBag,
};

function ClientBadgeCard({ badge }: { badge: ClientBadge }) {
  const Icon = badgeIcons[badge.icon] ?? Building2;

  return (
    <div
      className="flex items-center gap-3 rounded-xl border-2 border-[var(--color-border)] bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02]"
      style={{ borderLeftColor: badge.borderColor, borderLeftWidth: "4px" }}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-bg-soft)]">
        <Icon className="size-[18px] text-[var(--color-primary)]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[var(--color-text-primary)]">
          {badge.name}
        </p>
        {badge.description && (
          <p className="truncate text-xs text-[var(--color-text-muted)]">{badge.description}</p>
        )}
      </div>
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  const isWhatsApp = item.source === "whatsapp";

  return (
    <article
      className={cn(
        "transition-all duration-200 hover:scale-[1.02]",
        "flex h-full w-[300px] shrink-0 cursor-default flex-col overflow-hidden rounded-2xl border-2 shadow-sm",
        isWhatsApp ? "border-[#075E54]/30" : "border-[var(--color-border)]",
      )}
    >
      {isWhatsApp && <WhatsAppHeaderBar />}

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
            rgba(255,77,141,0.04) 27px,
            rgba(255,77,141,0.04) 28px
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
    </article>
  );
}

export function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const duplicated = [...testimonials, ...testimonials];

  const baseDuration = 30;
  const autoScrollDuration = prefersReduced ? 0 : baseDuration;

  return (
    <SectionWrapper id="testimoni" bgVariant="soft" className="relative">
      <DecorativeImage
        src="/assets/decoratives/bow-ribbon.webp"
        width={52}
        height={52}
        className="-right-1 -top-1 z-10 hidden md:block"
        rotate={10}
        zIndex={10}
      />

      <ScrollReveal className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Klien & Testimoni
        </h2>
        <div className="relative mt-2 h-7 w-[200px] select-none md:w-[240px]">
          <Image
            src="/assets/decoratives/swoosh-orange.webp"
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
      </ScrollReveal>

      <div className="mt-10">
        <div className="mx-auto mb-10 grid max-w-3xl grid-cols-3 overflow-hidden rounded-2xl bg-[var(--color-accent)] shadow-lg">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-4 text-center",
                i < stats.length - 1 && "border-r border-white/20",
              )}
            >
              <span className="font-display text-2xl font-black text-white md:text-3xl">
                {stat.value}
              </span>
              <span className="text-xs font-medium text-white/80 md:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {clientBadges.map((badge) => (
          <ScrollReveal key={badge.id}>
            <ClientBadgeCard badge={badge} />
          </ScrollReveal>
        ))}
      </div>

      {autoScrollDuration > 0 ? (
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex gap-6 px-4 animate-scroll-x"
            style={{
              width: `${duplicated.length * 316}px`,
              animationDuration: `${autoScrollDuration}s`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {duplicated.map((item, i) => (
              <div key={`${item.id}-${i}`} className="shrink-0 py-2">
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
