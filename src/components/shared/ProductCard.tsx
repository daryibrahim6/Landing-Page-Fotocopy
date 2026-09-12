"use client";

import Image from "next/image";
import Link from "next/link";

import { cn, formatRupiah } from "@/lib/utils";
import { buildWAUrl } from "@/lib/wa";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const CATEGORY_LABELS: Record<Product["category"], string> = {
  "digital-printing": "Digital Print",
  "print-dokumen": "Dokumen",
  "stiker-label": "Stiker & Label",
  "produk-custom": "Custom",
};

export function ProductCard({ product, className }: ProductCardProps) {
  const imageSrc = product.images[0] ?? "";
  const hasImage = imageSrc.length > 0;
  const waHref = buildWAUrl("fromProduct", product.name);

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm transition-all duration-200 hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {hasImage ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-[var(--color-bg-soft-2)]"
            aria-hidden="true"
          >
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              Gambar segera hadir
            </span>
          </div>
        )}

        {product.isCheckoutEnabled && (
          <span
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white bg-[var(--color-primary)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Bisa Checkout
          </span>
        )}

        <span
          className="absolute left-3 top-3 z-10 inline-flex rounded-full border border-white bg-[var(--color-bg-soft-2)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)] shadow-md"
        >
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] sm:text-lg">
          {product.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {product.description}
        </p>

        <div className="mt-3 flex items-center">
          <div
            className="relative inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-text-primary)] sm:text-sm"
          >
            <span>
              Mulai {formatRupiah(product.priceFrom)}/{product.unit}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.sizes.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          {product.isCheckoutEnabled ? (
            <Link
              href={`/checkout?product=${product.id}`}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--color-primary-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Pesan Sekarang
            </Link>
          ) : (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Tanya Admin
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
