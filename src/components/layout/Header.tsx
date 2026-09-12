"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Produk", href: "#produk", sectionId: "produk" },
  { label: "Portfolio", href: "#portfolio", sectionId: "portfolio" },
  { label: "Cara Order", href: "#cara-order", sectionId: "cara-order" },
  { label: "FAQ", href: "#faq", sectionId: "faq" },
  { label: "Simulasi", href: "/simulator", sectionId: "simulator" },
] as const;

const OBSERVED_SECTIONS = [
  "hero",
  "produk",
  "kategori-produk",
  "why-bisaprint",
  "cara-order",
  "form-konsultasi",
  "portfolio",
  "testimoni",
  "panduan-file",
  "faq",
  "kontak",
] as const;

const SECTION_TO_NAV: Record<string, string> = {
  hero: "produk",
  produk: "produk",
  "kategori-produk": "produk",
  "why-bisaprint": "produk",
  "cara-order": "cara-order",
  "form-konsultasi": "cara-order",
  portfolio: "portfolio",
  testimoni: "portfolio",
  "panduan-file": "faq",
  faq: "faq",
  kontak: "faq",
};

export function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("produk");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 8);
  });

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("/")) {
        closeMenu();
        router.push(href);
        return;
      }
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", href);
        closeMenu();
      } else {
        closeMenu();
        router.push(`/${href}`);
      }
    },
    [closeMenu, router],
  );

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen, closeMenu]);

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
          setActiveSection(SECTION_TO_NAV[id] ?? "produk");
          if (window.location.hash !== `#${id}`) {
            window.history.replaceState(null, "", `#${id}`);
          }
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        isScrolled
          ? "bg-white/85 shadow-sm backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 lg:px-8">
        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/assets/brand/logo-bisaprint.webp"
            alt="BisaPrint"
            width={160}
            height={56}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border border-[var(--color-border)] bg-white/60 px-2 py-1.5 backdrop-blur-sm md:flex"
          aria-label="Navigasi utama"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.sectionId}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                activeSection === item.sectionId
                  ? "bg-primary text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)] hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden shrink-0 md:block">
            <WhatsAppButton
              label="Chat Admin"
              variant="primary"
              size="sm"
            />
          </div>

          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-soft)] md:hidden"
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

      <div
        className={cn(
          "h-0.5 w-full transition-opacity duration-300",
          isScrolled ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-border), transparent)",
        }}
        aria-hidden="true"
      />

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-white/95 backdrop-blur-md md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Navigasi mobile">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.sectionId}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
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
                  label="Chat Admin"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
