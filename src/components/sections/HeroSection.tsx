"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

// ponytail: opacity stays 1 in `hidden` – h1/paragraf adalah kandidat LCP;
// Chrome abaikan elemen opacity:0 sebagai LCP, jadi animasi entry hanya geser (y).
const headlineVariants = {
  hidden: { opacity: 1, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 14, delay: 0.1 },
  },
};

const subtextVariants = {
  hidden: { opacity: 1, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.2, ease: "easeOut" as const },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.3 + i * 0.15,
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  }),
};

const badgeContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } },
};

const badgeItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

const proofVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, delay: 0.8 },
  },
};

const photoVariants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -3 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 2,
    transition: { duration: 0.8, delay: 0.6, ease: "easeOut" as const },
  },
};

const BADGES = [
  { icon: "star", text: "10.000+ Customer" },
  { icon: "check", text: "Cetak Satuan Bisa" },
  { icon: "zap", text: "Estimasi Cepat" },
] as const;

function BadgeIcon({ icon }: { icon: string }) {
  if (icon === "star")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-[var(--color-accent-yellow)]" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  if (icon === "check")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4 text-[var(--color-accent-yellow)]" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-[var(--color-accent-yellow)]" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #EE3B97 0%, #DE127A 42%, #B00E63 72%, #7E0B48 100%)",
      }}
    >
      {/* Layered texture: dot grid + radial glows — gradient tidak flat */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            maskImage:
              "radial-gradient(ellipse at 30% 30%, black 0%, transparent 65%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 30% 30%, black 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 85% 15%, rgba(255,255,255,0.22) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 10% 90%, rgba(232,120,23,0.35) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 110%, rgba(126,11,72,0.8) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-10 px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-10 lg:pt-24 xl:px-16"
        initial={prefersReduced ? "visible" : "hidden"}
        animate="visible"
      >
        <div className="flex flex-col justify-center">
          <motion.div
            className="mb-6 flex flex-wrap gap-2"
            variants={badgeContainerVariants}
          >
            {BADGES.map((badge) => (
              <motion.span
                key={badge.text}
                variants={badgeItemVariants}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-sm"
              >
                <BadgeIcon icon={badge.icon} />
                {badge.text}
              </motion.span>
            ))}
          </motion.div>

          <div className="mb-6">
            <motion.h1
              className="font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem]"
              variants={headlineVariants}
            >
              bisa
              <br />
              <span className="relative inline-block text-[var(--color-accent-yellow)]">
                mewujudkan
                <svg
                  viewBox="0 0 300 14"
                  className="absolute -bottom-1 left-0 w-full"
                  fill="none"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M4 10C60 4 150 2 296 8"
                    stroke="#E87817"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              imajinasi mu
            </motion.h1>
          </div>

          <motion.p
            className="max-w-xl text-lg leading-relaxed text-white/85 md:text-xl lg:text-2xl"
            variants={subtextVariants}
          >
            Cetak apa saja &mdash; cepat, rapi, berkualitas.
          </motion.p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <motion.div custom={0} variants={ctaVariants}>
              <WhatsAppButton
                label="Order via WhatsApp"
                message="Halo BisaPrint, saya ingin pesan cetak."
                variant="primary"
                size="lg"
                className="bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-lg shadow-[#0b3d2e]/40"
              />
            </motion.div>
            <motion.div custom={1} variants={ctaVariants}>
              <a
                href="#produk"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-display text-base font-bold text-[var(--color-primary)] shadow-lg shadow-slate-900/20 transition duration-200 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Lihat Produk
              </a>
            </motion.div>
          </div>

          <motion.div
            className="mt-10 flex items-center gap-4"
            variants={proofVariants}
          >
            <div className="flex -space-x-3">
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-white/80 bg-white/20 text-sm font-bold text-white backdrop-blur-sm">
                1
              </span>
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-white/80 bg-white/20 text-sm font-bold text-white backdrop-blur-sm">
                0
              </span>
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-white/80 bg-[var(--color-accent)] text-sm font-bold text-white">
                K
              </span>
            </div>
            <p className="text-base font-bold text-white">
              10.000+ Customer{" "}
              <span className="font-normal text-white/60">
                &bull;
              </span>{" "}
              <span className="font-normal text-white/80">Dipercaya sejak 2020</span>
            </p>
          </motion.div>
        </div>

        <motion.div
          className="hidden lg:flex lg:items-center lg:justify-center"
          variants={photoVariants}
        >
          <div className="relative w-full max-w-2xl rounded-[2rem] border border-white/25 bg-white/10 p-5 shadow-2xl shadow-slate-900/25 backdrop-blur-md">
            <div className="relative aspect-[640/520] w-full">
              <Image
                src="/assets/illustrations/hero-print.svg"
                alt="Lembar stiker die-cut, kartu nama, dan poster hasil cetak BisaPrint"
                fill
                className="object-contain"
                priority
                sizes="(min-width: 1024px) 50vw, 0px"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
