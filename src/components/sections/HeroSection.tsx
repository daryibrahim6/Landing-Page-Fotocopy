"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { DecorativeImage } from "@/components/shared/DecorativeImage";

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
      className="relative flex min-h-screen items-center overflow-hidden bg-[var(--color-bg-soft)]"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(222,18,122,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 20% 80%, rgba(232,120,23,0.06) 0%, transparent 50%)",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute -bottom-8 -left-16 z-0 select-none animate-float-y"
        aria-hidden="true"
      >
        <Image
          src="/assets/decoratives/blob-pink-glossy.webp"
          alt=""
          width={200}
          height={200}
          className="h-auto w-full opacity-[0.65]"
          draggable={false}
          quality={90}
          sizes="200px"
        />
      </div>

      <div
        className="pointer-events-none absolute left-[6%] top-[28%] z-10 select-none animate-sparkle"
        style={{ animationDelay: "0.4s" }}
        aria-hidden="true"
      >
        <Image
          src="/assets/decoratives/sparkle-stars.webp"
          alt=""
          width={72}
          height={72}
          className="h-auto w-full"
          draggable={false}
          quality={90}
          sizes="72px"
        />
      </div>

      <DecorativeImage
        src="/assets/decoratives/tape-strip.webp"
        width={100}
        height={43}
        className="-top-3 left-1/2 z-20 hidden -translate-x-1/2 md:block"
        rotate={-3}
        opacity={0.85}
        zIndex={20}
      />

      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8"
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col py-20 lg:py-0">
          <motion.div
            className="mb-6 flex flex-wrap gap-2"
            variants={badgeContainerVariants}
          >
            {BADGES.map((badge) => (
              <motion.span
                key={badge.text}
                variants={badgeItemVariants}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-primary)]/20 bg-white px-4 py-1.5 text-xs font-bold text-[var(--color-primary)] shadow-sm"
                style={{ transform: badge.rotate }}
              >
                <BadgeIcon icon={badge.icon} />
                {badge.text}
              </motion.span>
            ))}
          </motion.div>

          <div className="mb-6">
            <motion.h1
              className="font-display text-6xl font-black leading-[1.05] tracking-tight text-[var(--color-text-primary)] md:text-8xl lg:text-9xl"
              variants={headlineVariants}
            >
              bisa mewujudkan
              <br />
              <span className="text-[var(--color-accent)]">
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

          <div className="relative mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
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
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-6 py-3 font-display text-base font-bold text-[var(--color-primary)] transition duration-200 hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 sm:px-8 sm:py-4"
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
            <div className="flex -space-x-1">
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                1
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-white">
                0
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">
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
            className="relative w-[340px] overflow-hidden rounded-3xl border-4 border-white shadow-2xl"
            style={{ transform: "rotate(2deg)" }}
          >
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/assets/hero/company-photo.webp"
                alt="BisaPrint — Percetakan Digital"
                fill
                className="object-cover"
                priority
                quality={90}
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
            className="text-[var(--color-primary-muted)]"
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
