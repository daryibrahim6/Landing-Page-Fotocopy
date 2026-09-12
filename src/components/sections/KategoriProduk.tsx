"use client";

import Image from "next/image";
import { FileText, Gift, Printer, Tag, ArrowRight, type LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { categories, products } from "@/data/products";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

const categoryIcons: Record<ProductCategory, LucideIcon> = {
  "digital-printing": Printer,
  "print-dokumen": FileText,
  "stiker-label": Tag,
  "produk-custom": Gift,
};

interface KategoriProdukProps {
  onSelect?: (category: ProductCategory) => void;
}

function scrollToCatalog(onSelect: KategoriProdukProps["onSelect"], category: ProductCategory) {
  onSelect?.(category);
  document.getElementById("produk")?.scrollIntoView({ behavior: "smooth" });
}

export function KategoriProduk({ onSelect }: KategoriProdukProps) {
  const [featured, ...rest] = categories;
  const featuredProducts = products
    .filter((p) => p.category === featured.id && p.images[0])
    .slice(0, 3);

  return (
    <section id="kategori-produk" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 md:pt-24 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
                Kategori
              </p>
              <h2 className="mt-1 font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
                Kategori Produk
              </h2>
            </div>
            <p className="max-w-sm text-base text-[var(--color-text-secondary)] md:text-right">
              Pilih kategori yang kamu butuhkan, lalu scroll ke produknya
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Featured bento card — Digital Printing paling luas */}
          <a
            href="#produk"
            onClick={(e) => {
              e.preventDefault();
              scrollToCatalog(onSelect, featured.id);
            }}
            className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border-2 border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg-soft)] to-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg sm:col-span-2 sm:p-8 lg:flex-row lg:items-center"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/5"
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-start">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Printer className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-[var(--color-text-primary)]">
                {featured.name}
              </h3>
              <p className="mt-1 max-w-xs text-sm text-[var(--color-text-secondary)]">
                {featured.tagline}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white transition-colors group-hover:bg-[var(--color-primary-muted)]">
                Lihat Produk
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </div>
            <div className="relative flex shrink-0 items-end gap-3">
              {featuredProducts.map((p, i) => (
                <span
                  key={p.id}
                  className={cn(
                    "relative block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition-transform duration-200 group-hover:-translate-y-1",
                    i === 1 ? "size-24" : "size-20",
                  )}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                </span>
              ))}
            </div>
          </a>

          {rest.map((cat) => {
            const Icon = categoryIcons[cat.id];
            return (
              <a
                key={cat.id}
                href="#produk"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToCatalog(onSelect, cat.id);
                }}
                className="group relative flex flex-col items-start gap-4 rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {cat.tagline}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)]">
                  Lihat Produk
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </a>
            );
          })}

          {/* CTA tile — nutup bento row */}
          <a
            href="#produk"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("produk")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-3xl p-6 text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            style={{
              background:
                "linear-gradient(150deg, #EE3B97 0%, #DE127A 55%, #A50D5F 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-white/15"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-14 -left-8 size-36 rounded-full bg-black/10"
              aria-hidden="true"
            />
            <h3 className="relative font-display text-xl font-bold leading-snug">
              Masih bingung pilih produk?
            </h3>
            <span className="relative mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-white">
              Jelajahi Katalog
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
