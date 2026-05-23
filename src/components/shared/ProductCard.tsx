"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn, formatRupiah } from "@/lib/utils";
import type { Product } from "@/types";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { DecorativeImage } from "@/components/shared/DecorativeImage";

interface ProductCardProps {
  product: Product;
  className?: string;
  showTape?: boolean;
}

const CATEGORY_LABELS: Record<Product["category"], string> = {
  "digital-print": "Digital Print",
  document: "Dokumen",
  sablon: "Sablon",
  umkm: "UMKM",
};

export function ProductCard({ product, className, showTape = false }: ProductCardProps) {
  const hasImage = product.image.trim().length > 0;

  return (
    <motion.article
      whileHover={{
        y: -4,
        boxShadow:
          "0 16px 40px -8px rgba(224,24,122,0.16), 0 6px 16px -4px rgba(0,0,0,0.08)",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm transition-colors",
        className,
      )}
    >
      {product.featured && (
        <div className="absolute -right-5 -top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white shadow-md">
          ★
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {hasImage ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[var(--color-primary-light)] via-[var(--color-primary-muted)] to-[var(--color-primary)]"
            aria-hidden="true"
          >
            <span className="text-xs font-semibold text-white/80">
              Gambar segera hadir
            </span>
          </div>
        )}

        {/* Category badge - stamp/sticker style */}
        <span
          className="absolute left-3 top-3 z-10 inline-flex rounded-full border-2 border-white bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md"
          style={{ transform: "rotate(-2deg)" }}
        >
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] sm:text-lg">
          {product.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {product.description}
        </p>

        {/* Price tag shape */}
        <div className="mt-3 flex items-center">
          <div
            className="relative inline-flex items-center gap-1 bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-white sm:text-sm"
            style={{
              clipPath:
                "polygon(8px 0%, 100% 0%, 100% 100%, 8px 100%, 0% 50%)",
            }}
          >
            <span className="pl-1">
              Mulai {formatRupiah(product.startingPrice)}
            </span>
          </div>
        </div>

        {/* WA button - pill, full width */}
        <div className="mt-auto pt-4">
          <WhatsAppButton
            label="Pesan via WA"
            productName={product.name}
            variant="primary"
            size="sm"
            className="w-full justify-center"
          />
        </div>
      </div>
    </motion.article>
  );
}
