"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { useCallback } from "react";
import { WA_NUMBER, waUrl } from "@/lib/constants";
import { DecorativeImage } from "@/components/shared/DecorativeImage";

// ─── Social Icon Components ───────────────────────────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/assets/icon/instagram.png"
      alt="Instagram"
      width={24}
      height={24}
      className={className}
    />
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
                <span>Jl. Dalang I No.45, RT.003/RW.017, Pengasinan, Kec. Rawalumbu, Kota Bekasi, Jawa Barat 17115</span>
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
