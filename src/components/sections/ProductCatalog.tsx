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
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
          </svg>
          Chat Admin via WhatsApp
        </a>
      </div>
    </SectionWrapper>
  );
}
