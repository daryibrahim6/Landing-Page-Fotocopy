"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { categories } from "@/data/products";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

const categoryIcons: Record<ProductCategory, string> = {
  "digital-printing": "🖨️",
  "print-dokumen": "📄",
  "stiker-label": "🏷️",
  "dtf-apparel": "👕",
  "produk-custom": "🎁",
};

interface KategoriProdukProps {
  onSelect?: (category: ProductCategory) => void;
}

export function KategoriProduk({ onSelect }: KategoriProdukProps) {
  return (
    <section id="kategori-produk" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
              Kategori Produk
            </h2>
            <p className="mt-3 text-base text-[var(--color-text-secondary)]">
              Pilih kategori yang kamu butuhkan, lalu scroll ke produknya
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.id}
              href={`#produk`}
              onClick={(e) => {
                e.preventDefault();
                onSelect?.(cat.id);
                const el = document.getElementById("produk");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative flex flex-col items-center gap-4 rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center transition-colors hover:border-[var(--color-primary)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ scale: 1.03, y: -4, rotate: i % 2 === 0 ? 1 : -1 }}
              style={{ transform: `rotate(${i % 2 === 0 ? 1 : -1}deg)` }}
            >
              <span className="text-4xl" role="img" aria-hidden="true">
                {categoryIcons[cat.id]}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {cat.tagline}
                </p>
              </div>
              <span
                className={cn(
                  "mt-auto inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                  "border-2 border-[var(--color-primary)]/30 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white",
                )}
              >
                Lihat Produk
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
