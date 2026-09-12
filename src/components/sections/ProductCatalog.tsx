"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ProductCard } from "@/components/shared/ProductCard";
import { categories, products } from "@/data/products";
import { cn } from "@/lib/utils";
import { buildWAUrl } from "@/lib/wa";
import { trackEvent } from "@/lib/tracking";
import type { ProductCategory } from "@/types";
import { WHATSAPP_ICON_PATH } from "@/lib/brand-icons";

const categoryTabs: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "Semua" },
  ...categories.map((c) => ({ id: c.id as ProductCategory, label: c.name })),
];

interface ProductCatalogProps {
  activeCategory?: ProductCategory | "all";
  onCategoryChange?: (category: ProductCategory | "all") => void;
}

export function ProductCatalog({
  activeCategory: controlledCategory,
  onCategoryChange,
}: ProductCatalogProps = {}) {
  const [internalCategory, setInternalCategory] = useState<ProductCategory | "all">("all");
  const activeCategory = controlledCategory ?? internalCategory;
  const setActiveCategory = onCategoryChange ?? setInternalCategory;

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <SectionWrapper id="produk" bgVariant="white" className="relative overflow-hidden">
      <ScrollReveal>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
            Katalog Produk
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-secondary)]">
            Pilih produk yang kamu butuhkan, langsung chat admin untuk order
          </p>
        </div>
      </ScrollReveal>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activeCategory === tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={cn(
              "min-h-11 rounded-full px-5 py-2 text-sm font-bold transition-colors",
              activeCategory === tab.id
                ? "bg-primary text-white shadow-md"
                : "border-2 border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

          {/* Card penutup katalog: produk di luar etalase (DTF, banner,
              merchandise, dll) diarahkan ke admin — sesuai request owner. */}
          {(activeCategory === "all" || activeCategory === "produk-custom") && (
            <a
              href={buildWAUrl("general")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Lead", { source: "catalog-lainnya-card" })}
              className="group relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-soft)] p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-7" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] sm:text-lg">
                Produk Lainnya
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Sablon DTF, banner, totebag, merchandise, atau kebutuhan cetak lain? Tanya admin.
              </p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border-2 border-[var(--color-primary)]/30 px-4 py-1.5 text-xs font-bold text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                Hubungi Admin
              </span>
            </a>
          )}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-[var(--color-text-muted)]">
          Tidak ada produk di kategori ini.
        </p>
      )}

      <div className="relative mt-16 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-soft-2)] px-8 py-10 text-center shadow-sm">
        <h3 className="relative font-display text-xl font-bold text-[var(--color-text-primary)] md:text-2xl">
          Tidak nemu produk yang kamu cari?
        </h3>
        <p className="relative mx-auto mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
          Langsung aja chat admin, kami siap bantu! Konsultasi gratis.
        </p>
        <a
          href={buildWAUrl("general")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("Lead", { source: "catalog-chat-admin" })}
          className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[var(--color-primary-muted)]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
            <path d={WHATSAPP_ICON_PATH} />
          </svg>
          Chat Admin via WhatsApp
        </a>
      </div>
    </SectionWrapper>
  );
}
