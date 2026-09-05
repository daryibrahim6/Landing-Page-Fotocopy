"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { WA_NUMBER, waUrl, IG_URL, SHOPEE_URL } from "@/lib/constants";

function formatWaDisplay(number: string): string {
  if (number.startsWith("62")) {
    const local = number.slice(2);
    return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
  }
  return number;
}

export function Footer() {
  const waDisplay = formatWaDisplay(WA_NUMBER);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", href);
    }
  }, []);

  return (
    <>
      <div className="relative h-[60px] w-full overflow-hidden">
        <Image
          src="/assets/decoratives/wavy-divider.webp"
          alt=""
          width={1440}
          height={60}
          className="-mt-1 block h-full w-full object-cover"
          style={{ transform: "rotate(180deg)" }}
        />
      </div>

      <footer className="relative overflow-hidden border-t border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-primary) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="mb-4">
              <Image
                src="/assets/brand/logo-bisaprint.webp"
                alt="BisaPrint"
                width={100}
                height={32}
                className="h-auto w-auto"
              />
            </div>
            <p className="mt-3 font-display text-lg font-bold text-[var(--color-accent-light)]">
              &ldquo;bisa mewujudkan imajinasi mu&rdquo;
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Percetakan digital Bekasi untuk UMKM dan perorangan &mdash; digital
              printing, sablon, dokumen, dan kebutuhan brand dalam satu tempat.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent-light)]">
              Navigasi
            </p>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer navigasi">
              {[
                { label: "Produk", href: "#produk" },
                { label: "Portfolio", href: "#portfolio" },
                { label: "FAQ", href: "#faq" },
                { label: "Panduan File", href: "#panduan-file" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-sm text-white/70 transition-colors hover:text-[var(--color-accent-light)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent-light)]">
              Kontak
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 size-4 shrink-0 text-[var(--color-accent-light)]" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
                <a
                  href={waUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--color-accent-light)] transition-colors hover:text-white"
                >
                  {waDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 size-4 shrink-0 text-[var(--color-accent-light)]" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Jl. Dalang I No.45, Pengasinan, Rawalumbu, Kota Bekasi, Jawa Barat 17115</span>
              </li>
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 size-4 shrink-0 text-[var(--color-accent-light)]" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>Senin &ndash; Sabtu: 08.00 &ndash; 17.00 WIB</span>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-[var(--color-accent-light)] hover:text-[var(--color-accent-light)]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={waUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-[var(--color-accent-light)] hover:text-[var(--color-accent-light)]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
              </a>
              <a
                href={SHOPEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shopee"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-[var(--color-accent-light)] hover:text-[var(--color-accent-light)]"
              >
                <div className="flex size-5 items-center justify-center rounded bg-[#EE4D2D] text-[10px] font-black text-white">
                  S
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10">
          <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-white/60 sm:flex-row sm:text-left sm:px-6 lg:px-8">
            <p className="relative z-10">&copy; 2026 Bisa Print. All rights reserved.</p>
            <p className="relative z-10">Bekasi, Jawa Barat</p>
          </div>
        </div>
      </footer>
    </>
  );
}
