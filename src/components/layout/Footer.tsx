"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { WA_NUMBER, waUrl, IG_URL, SHOPEE_URL } from "@/lib/constants";
import { formatWaDisplay } from "@/lib/utils";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { WHATSAPP_ICON_PATH, INSTAGRAM_ICON_PATH, SHOPEE_ICON_PATH } from "@/lib/brand-icons";

// Ikon brand resmi (Simple Icons, CC0) — Lucide tidak punya brand icons.
export function Footer() {
  const router = useRouter();
  const waDisplay = formatWaDisplay(WA_NUMBER);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", href);
    } else {
      router.push(`/${href}`);
    }
  }, [router]);

  return (
    <footer className="relative overflow-hidden bg-slate-900 text-slate-300">
      {/* tekstur + glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
        }}
      />
      <div
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full"
        aria-hidden="true"
        style={{ background: "radial-gradient(circle, rgba(222,18,122,0.22) 0%, transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full"
        aria-hidden="true"
        style={{ background: "radial-gradient(circle, rgba(232,120,23,0.12) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)] lg:px-8">
        <div>
          <div className="mb-4">
            <BrandLogo light />
          </div>
          <p className="mt-3 font-display text-lg font-bold text-slate-200">
            &ldquo;bisa mewujudkan imajinasi mu&rdquo;
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Percetakan digital Bekasi untuk UMKM dan perorangan &mdash; digital
            printing, sablon, dokumen, dan kebutuhan brand dalam satu tempat.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-600 text-slate-300 transition hover:border-slate-300 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d={INSTAGRAM_ICON_PATH} />
              </svg>
            </a>
            <a
              href={waUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-600 text-slate-300 transition hover:border-slate-300 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d={WHATSAPP_ICON_PATH} />
              </svg>
            </a>
            <a
              href={SHOPEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shopee"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-600 text-slate-300 transition hover:border-slate-300 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d={SHOPEE_ICON_PATH} />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Navigasi
          </p>
          <nav className="mt-4 flex flex-col gap-3" aria-label="Footer navigasi">
            {[
              { label: "Produk", href: "#produk" },
              { label: "Portfolio", href: "#portfolio" },
              { label: "Cara Order", href: "#cara-order" },
              { label: "FAQ", href: "#faq" },
              { label: "Panduan File", href: "#panduan-file" },
              { label: "Simulasi Cetak", href: "/simulator" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith("/")) return;
                  handleNavClick(e, item.href);
                }}
                className="w-fit text-sm text-slate-400 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Kontak
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 size-4 shrink-0 text-[#25D366]" aria-hidden="true">
                <path d={WHATSAPP_ICON_PATH} />
              </svg>
              <a
                href={waUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white transition-colors hover:text-slate-200"
              >
                {waDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Jl. Dalang I No.45, Pengasinan, Rawalumbu, Kota Bekasi, Jawa Barat 17115</span>
            </li>
            <li className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Senin &ndash; Sabtu: 08.00 &ndash; 17.00 WIB</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-slate-700/60">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left sm:px-6 lg:px-8">
          <p className="relative z-10">&copy; 2026 Bisa Print. All rights reserved.</p>
          <p className="relative z-10">Bekasi, Jawa Barat</p>
        </div>
      </div>
    </footer>
  );
}
