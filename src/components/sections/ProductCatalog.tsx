"use client";

import Image from "next/image";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/data/products";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { BlobDecoration } from "@/components/shared/BlobDecoration";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type FilterKey = "all" | Product["category"];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "digital-print", label: "Digital Print" },
  { key: "document", label: "Dokumen" },
  { key: "sablon", label: "Sablon" },
  { key: "umkm", label: "Kebutuhan UMKM" },
];



export function ProductCatalog() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((product) => product.category === filter);

  return (
    <SectionWrapper id="produk" bgVariant="soft" className="relative overflow-hidden z-0">
      {/* Background decoratives */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      
      {/* Section header */}
      <div className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Produk & Layanan
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
          Semua kebutuhan cetak kamu, ada di sini.
        </p>
      </div>

      {/* Filter tabs with sliding indicator */}
      <div
        className="mt-10 flex flex-wrap justify-center gap-2 md:gap-3"
        role="tablist"
        aria-label="Filter kategori produk"
      >
        {FILTERS.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "relative rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 md:text-base",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "border-2 border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary hover:text-primary",
              )}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="product-tab-indicator"
                  className="absolute inset-0 -z-10 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Wavy divider between tabs and grid */}
      <div className="mx-auto mt-10 w-full max-w-4xl px-4" aria-hidden="true">
        <svg
          viewBox="0 0 400 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full opacity-30"
          preserveAspectRatio="none"
        >
          <path
            d="M0 6C20 2 40 10 60 6C80 2 100 10 120 6C140 2 160 10 180 6C200 2 220 10 240 6C260 2 280 10 300 6C320 2 340 10 360 6C380 2 400 10 400 6"
            stroke="var(--color-primary-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* Product grid with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} showTape={index % 2 === 0} />
            ))
          ) : (
            /* Empty state */
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <p className="mt-4 font-display text-xl font-bold text-[var(--color-text-primary)]">
                Belum ada produk di kategori ini
              </p>
              <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
                Tapi tenang, kamu bisa tanya langsung ke kami lewat WhatsApp.
                Kita bisa cetak apapun! 😉
              </p>
              <div className="mt-4">
                <WhatsAppButton
                  label="Tanya Produk"
                  message="Halo BisaPrint, saya mencari produk cetak yang belum ada di katalog."
                  variant="outline"
                  size="sm"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA banner - Y2K style */}
      <div className="relative mt-14 overflow-hidden rounded-3xl bg-primary p-8 text-center shadow-lg md:p-10">
        {/* Masking tape strip */}
        <div
          className="pointer-events-none absolute -top-2 left-10 z-20 h-6 w-20 select-none rounded-sm opacity-90"
          style={{
            transform: "rotate(-3deg)",
            background:
              "repeating-linear-gradient(90deg, rgba(224,120,32,0.2) 0px, rgba(224,120,32,0.2) 3px, rgba(255,179,71,0.35) 3px, rgba(255,179,71,0.35) 6px)",
            backgroundColor: "rgba(255, 243, 224, 0.85)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
          aria-hidden="true"
        />
        {/* Dot pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle, white 1.5px, transparent 1.5px)`,
            backgroundSize: "20px 20px",
          }}
        />
        {/* Diagonal lines overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          aria-hidden="true"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 12px)`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row md:text-left">
          <div>
            <p className="font-display text-xl font-black text-white md:text-2xl flex items-center justify-center md:justify-start">
              <Image
                src="/assets/decoratives/exclamation.png"
                alt=""
                width={72}
                height={106}
                className="mr-2 inline-block -rotate-6"
                quality={90}
                sizes="(max-width: 768px) 100px, 200px"
              />
              Tidak ketemu yang kamu cari?
            </p>
            <p className="mt-1 text-sm text-white/70">
              Chat kami dulu - kita bisa cetak hampir apapun.
            </p>
          </div>
          <WhatsAppButton
            label="Chat WhatsApp"
            message="Halo BisaPrint, saya punya kebutuhan cetak khusus. Bisa dibantu?"
            variant="outline"
            size="lg"
            className="shrink-0 border-white text-white hover:bg-white/10"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
