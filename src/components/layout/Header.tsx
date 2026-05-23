"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { cn } from "@/lib/utils";

// ─── Navigation config ───────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Beranda", href: "#beranda", sectionId: "beranda" },
  { label: "Produk", href: "#produk", sectionId: "produk" },
  { label: "Portfolio", href: "#portfolio", sectionId: "portfolio" },
  { label: "Testimoni", href: "#testimoni", sectionId: "testimoni" },
  { label: "FAQ", href: "#faq", sectionId: "faq" },
  { label: "Kontak", href: "#kontak", sectionId: "kontak" },
] as const;

const OBSERVED_SECTIONS = [
  "beranda",
  "kenapa-bisaprint",
  "produk",
  "portfolio",
  "testimoni",
  "faq",
  "kontak",
] as const;

const SECTION_TO_NAV: Record<string, string> = {
  beranda: "beranda",
  "kenapa-bisaprint": "beranda",
  produk: "produk",
  portfolio: "portfolio",
  testimoni: "testimoni",
  faq: "faq",
  kontak: "kontak",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("beranda");

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = OBSERVED_SECTIONS.map((id) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = visible[0].target.id;
          setActiveSection(SECTION_TO_NAV[id] ?? "beranda");
        }
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        isScrolled
          ? "bg-white/85 shadow-sm backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      {/* Main header bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 lg:px-8">
        {/* LEFT: Brand */}
        <Link
          href="#beranda"
          onClick={closeMenu}
          className="shrink-0 font-display text-xl font-black tracking-tight md:text-2xl"
        >
          <Image
            src="/assets/brand/logo-bisaprint.png"
            alt="BisaPrint"
            width={110}
            height={35}
            className="h-auto w-auto"
            priority
          />
        </Link>

        {/* CENTER: Desktop nav */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Navigasi utama"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.sectionId}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                activeSection === item.sectionId
                  ? "font-semibold text-primary"
                  : "text-[var(--color-text-secondary)] hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT: CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden shrink-0 md:block">
            <WhatsAppButton
              label="Pesan Sekarang"
              variant="primary"
              size="sm"
            />
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-soft)] md:hidden"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Y2K rainbow gradient border */}
      <div
        className={cn(
          "h-0.5 w-full transition-opacity duration-300",
          isScrolled ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "linear-gradient(to right, var(--color-primary), var(--color-accent-light), var(--color-primary))",
        }}
        aria-hidden="true"
      />

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden bg-white/95 backdrop-blur-md transition-[max-height,opacity] duration-300 md:hidden",
          isMenuOpen
            ? "max-h-[28rem] opacity-100"
            : "max-h-0 opacity-0",
        )}
      >
        <nav
          className="flex flex-col gap-1 px-4 py-4"
          aria-label="Navigasi mobile"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.sectionId}
              href={item.href}
              onClick={closeMenu}
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                activeSection === item.sectionId
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)]",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 px-2">
            <WhatsAppButton
              label="Pesan Sekarang"
              variant="primary"
              size="sm"
              className="w-full justify-center"
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
