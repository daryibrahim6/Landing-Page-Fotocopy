"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Star, Building2, BookOpen, Landmark, ShoppingBag, Pause, Play } from "lucide-react";
import { testimonials, clientBadges } from "@/data/testimonials";
import type { Testimonial, TestimonialSource, ClientBadge } from "@/data/testimonials";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { WHATSAPP_ICON_PATH } from "@/lib/brand-icons";

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
      <path d={WHATSAPP_ICON_PATH} />
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
        <p className="truncate text-sm font-bold text-[var(--color-text-primary)]" title={badge.name}>
          {badge.name}
        </p>
        {badge.description && (
          <p className="truncate text-xs text-[var(--color-text-muted)]" title={badge.description}>{badge.description}</p>
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
            rgba(15,23,42,0.04) 27px,
            rgba(15,23,42,0.04) 28px
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
    <SectionWrapper id="testimoni" bgVariant="white" className="relative">
      <ScrollReveal className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Klien & Testimoni
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Bukan kami yang bilang. Mereka yang membuktikan.
        </p>
      </ScrollReveal>

      <div className="mt-10">
        <div className="mx-auto mb-10 grid max-w-3xl grid-cols-3 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] shadow-sm">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-4 text-center",
                i < stats.length - 1 && "border-r border-[var(--color-border)]",
              )}
            >
              <span className="font-display text-2xl font-black text-[var(--color-primary)] md:text-3xl">
                {stat.value}
              </span>
              <span className="text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
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
        <div className="relative">
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
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-pressed={isPaused}
            aria-label={isPaused ? "Lanjutkan testimoni otomatis" : "Jeda testimoni otomatis"}
            className="absolute right-2 top-2 z-10 inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/90 text-[var(--color-text-secondary)] shadow-sm transition hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {isPaused ? (
              <Play className="size-4" aria-hidden="true" />
            ) : (
              <Pause className="size-4" aria-hidden="true" />
            )}
          </button>
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
