"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { useCallback } from "react";
import { WA_NUMBER, waUrl } from "@/lib/constants";
import { DecorativeImage } from "@/components/shared/DecorativeImage";

// ─── Social Icon SVGs ───────────────────────────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="25%" stopColor="#DD2A7F" />
          <stop offset="50%" stopColor="#8134AF" />
          <stop offset="75%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.2-4.358 2.617-6.78 6.979-6.98 1.281-.059 1.69-.073 4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      <circle cx="12" cy="12" r="3.5" fill="#1A0A0F"/>
    </svg>
  );
}

function TokopediaIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded bg-[#42B549] text-[10px] font-black text-white shrink-0 ${className}`}>
      T
    </div>
  );
}

function ShopeeIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded bg-[#EE4D2D] text-[10px] font-black text-white shrink-0 ${className}`}>
      S
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Beranda", href: "#beranda" },
  { label: "Produk", href: "#produk" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "FAQ", href: "#faq" },
  { label: "Kontak", href: "#kontak" },
] as const;

const socialLinks = [
  { label: "Instagram", href: "#", icon: InstagramIcon },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatWaDisplay(number: string): string {
  if (number.startsWith("62")) {
    const local = number.slice(2);
    return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
  }
  return number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Footer() {
  const waDisplay = formatWaDisplay(WA_NUMBER);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', href);
    }
  }, []);

  return (
    <>
      {/* Wavy top edge transitioning into dark footer */}
      <div className="relative h-[60px] w-full overflow-hidden">
        <Image
          src="/assets/decoratives/wavy-divider.png"
          alt=""
          width={1440}
          height={60}
          className="-mt-1 block h-full w-full object-cover"
          style={{ transform: "rotate(180deg)" }}
        />
      </div>

      <footer className="relative overflow-hidden bg-[#1A0A0F] text-white">
        {/* Subtle halftone background texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {/* Col 1: Brand */}
          <div>
            <div className="mb-4">
              <Image
                src="/assets/brand/logo-bisaprint.png"
                alt="BisaPrint"
                width={100}
                height={32}
                className="h-auto w-auto"
              />
            </div>
            <p className="mt-3 font-display text-lg font-bold text-primary-light">
              Cetak Impianmu, Bisa!
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Percetakan digital Bekasi untuk UMKM dan perorangan - digital
              printing, sablon, dokumen, dan kebutuhan brand dalam satu tempat.
            </p>
          </div>

          {/* Col 2: Navigasi */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-light">
              Navigasi
            </p>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer navigasi">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-sm text-white/70 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3: Kontak */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-light">
              Kontak
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href={waUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary transition-colors hover:text-primary-light"
                >
                  {waDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>Alamat lengkap akan diupdate setelah dikonfirmasi dengan klien</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>Senin – Sabtu: 08.00 – 17.00 WIB</span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-primary hover:text-primary"
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 border-t border-white/10">
          <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-white/60 sm:flex-row sm:text-left sm:px-6 lg:px-8">
            <p className="relative z-10">© 2026 BisaPrint · Bekasi, Jawa Barat</p>
            <p className="relative z-10">Dibuat di Bekasi</p>
          </div>
        </div>
      </footer>
    </>
  );
}
