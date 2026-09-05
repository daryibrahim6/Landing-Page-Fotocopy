"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

const headlineVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 14, delay: 0.1 },
  },
};

const subtextVariants = {
  hidden: { opacity: 0, y: 20 },
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
  { icon: "star", text: "10.000+ Customer", rotate: "-1.5deg" },
  { icon: "check", text: "Cetak Satuan Bisa", rotate: "1deg" },
  { icon: "zap", text: "Estimasi Cepat", rotate: "-0.5deg" },
] as const;

function BadgeIcon({ icon }: { icon: string }) {
  if (icon === "star")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-[var(--color-accent)]" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  if (icon === "check")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4 text-[var(--color-accent)]" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-[var(--color-accent)]" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex h-screen items-center overflow-hidden bg-white"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(15,23,42,0.04) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 20% 80%, rgba(15,23,42,0.03) 0%, transparent 50%)",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8"
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col py-12 sm:py-16 lg:py-0">
          <motion.div
            className="mb-6 flex flex-wrap gap-2"
            variants={badgeContainerVariants}
          >
            {BADGES.map((badge) => (
              <motion.span
                key={badge.text}
                variants={badgeItemVariants}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-1.5 text-xs font-bold text-[var(--color-text-secondary)] shadow-sm"
                style={{ transform: badge.rotate }}
              >
                <BadgeIcon icon={badge.icon} />
                {badge.text}
              </motion.span>
            ))}
          </motion.div>

          <div className="mb-6">
            <motion.h1
              className="font-display text-4xl font-black leading-[1.1] tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl lg:text-7xl"
              variants={headlineVariants}
            >
              bisa mewujudkan
              <br />
              <span className="text-[var(--color-primary)]">
                imajinasi mu
              </span>
            </motion.h1>
          </div>

          <motion.p
            className="max-w-md text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg"
            variants={subtextVariants}
          >
            Cetak apa saja &mdash; cepat, rapi, berkualitas.
          </motion.p>

          <div className="relative mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
            <motion.div custom={0} variants={ctaVariants}>
              <WhatsAppButton
                label="Order via WhatsApp"
                message="Halo BisaPrint, saya ingin pesan cetak."
                variant="primary"
                size="lg"
                className="bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-lg shadow-[#25D366]/30"
              />
            </motion.div>
            <motion.div custom={1} variants={ctaVariants}>
              <a
                href="#produk"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-bg-soft-2)] px-6 py-3 font-display text-base font-bold text-[var(--color-text-primary)] transition duration-200 hover:bg-[var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 sm:px-8 sm:py-4"
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
            className="mt-8 flex items-center gap-3"
            variants={proofVariants}
          >
            <div className="flex -space-x-2">
              <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[var(--color-bg-soft-2)] text-xs font-bold text-[var(--color-text-secondary)] shadow-sm">
                1
              </span>
              <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[var(--color-bg-soft-2)] text-xs font-bold text-[var(--color-text-secondary)] shadow-sm">
                0
              </span>
              <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[var(--color-primary)] text-xs font-bold text-white shadow-sm">
                K
              </span>
            </div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">
              10.000+ Customer{" "}
              <span className="font-normal text-[var(--color-text-muted)]">
                &bull;
              </span>{" "}
              Dipercaya sejak 2020
            </p>
          </motion.div>
        </div>

        <motion.div
          className="hidden lg:flex lg:flex-col lg:items-end lg:gap-6"
          variants={photoVariants}
        >
          <div
            className="relative w-[340px] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-xl"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/assets/illustrations/print-team.svg"
                alt="BisaPrint — Percetakan Digital"
                fill
                className="object-cover p-4"
                priority
                sizes="(min-width: 1024px) 340px, 0px"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 animate-bounce-y">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            Scroll
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-[var(--color-text-muted)]"
          >
            <path
              d="M10 4v12m0 0l-4-4m4 4l4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
