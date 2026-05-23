"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BlobDecoration } from "@/components/shared/BlobDecoration";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";


// ─── Animation variants ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

const imageReveal = {
  hidden: { opacity: 0, scale: 0.92, rotate: -1 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0.35 },
  },
};



// ─── Halftone background ─────────────────────────────────────────────────────

function HalftonePattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      aria-hidden="true"
      style={{
        backgroundImage: `radial-gradient(circle, #E0187A 1.5px, transparent 1.5px)`,
        backgroundSize: "24px 24px",
      }}
    />
  );
}







// ─── Main Component ──────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <SectionWrapper
      id="beranda"
      bgVariant="soft"
      className="relative overflow-hidden"
    >
      <HalftonePattern />

      <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* ── Left column: text ── */}
        <div className="flex flex-col">
          {/* Badge / sticker label */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 w-fit"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-border-strong)] bg-white px-5 py-2 font-display text-sm font-bold text-[var(--color-primary)] shadow-md"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              Percetakan Digital Terpercaya
            </span>
          </motion.div>

          {/* H1 - two lines */}
          <div className="mb-6 overflow-visible">
            <motion.div
              custom={0.1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h1
                className="font-display text-5xl font-black leading-none tracking-tight text-[var(--color-text-primary)] md:text-7xl"
              >
                Cetak Impianmu,
              </h1>
            </motion.div>

            <motion.div
              custom={0.2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-1"
            >
              <span
                className="font-display text-5xl font-black leading-none tracking-tight text-[var(--color-accent)] md:text-7xl"
              >
                Bisa!
              </span>
            </motion.div>
          </div>

          {/* Subheadline */}
          <motion.p
            custom={0.3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-lg font-body text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg"
          >
            Dari brosur hingga banner, dari dokumen hingga sablon - semua bisa
            di BisaPrint. Hasil premium, harga bersahabat, kirim via WhatsApp.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={0.4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <DecorativeImage
              src="/assets/decoratives/arrow-curved.png"
              width={110}
              height={75}
              rotate={-75}
              className="hidden md:block -ml-30 mr-4 -mt-25 z-20"
              opacity={0.95}
            />
            <WhatsAppButton
              label="Pesan Sekarang"
              message="Halo BisaPrint, saya ingin pesan cetak."
              variant="primary"
              size="lg"
            />
            <a
              href="#produk"
              className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-transparent px-6 py-3 font-display text-base font-bold text-[var(--color-primary)] transition duration-200 hover:bg-[var(--color-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 sm:px-8 sm:py-4"
            >
              Lihat Produk
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.p
            custom={0.5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 font-body text-sm text-[var(--color-text-muted)]"
          >
            Dipercaya ratusan UMKM &amp; perorangan di Bekasi
          </motion.p>
        </div>

        {/* ── Right column: visual ── */}
        <motion.div
          variants={imageReveal}
          initial="hidden"
          animate="visible"
          className="relative mx-auto w-full max-w-md p-6 lg:max-w-none lg:p-8"
        >
          {/* Card wrapper */}
          <div className="relative w-full">
            {/* Tape on top center of the card */}
            <DecorativeImage
              src="/assets/decoratives/tape-strip.png"
              width={136}
              height={58}
              rotate={-3}
              className="-top-7 left-1/2 -translate-x-1/2 z-20 drop-shadow-sm"
            />
            {/* Blob floating behind the bottom left */}
            <DecorativeImage
              src="/assets/decoratives/blob-pink-glossy.png"
              width={240}
              height={242}
              opacity={0.6}
              className="-left-12 -bottom-10 z-0"
            />
            
            {/* Vector Blobs behind */}
            <BlobDecoration
              color="var(--color-primary-light)"
              size={180}
              opacity={0.25}
              variant={1}
              className="-left-10 -top-8 -z-10"
            />
            <BlobDecoration
              color="var(--color-accent-light)"
              size={180}
              opacity={0.3}
              variant={2}
              className="-bottom-12 -right-12 -z-10"
            />

            {/* Actual machine card */}
            <div className="relative z-10 w-full flex items-center justify-center min-h-[320px] rounded-3xl bg-[var(--color-bg-soft)] shadow-2xl p-8 lg:p-12 border-2 border-[var(--color-border)]">
              <Image
                src="/assets/machines/konica-c2060.png"
                alt="Mesin Konica Minolta c2060 - mesin cetak profesional BisaPrint"
                width={879}
                height={419}
                style={{ objectFit: "contain" }}
                className="z-10 h-auto w-full max-w-[500px] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                priority
                quality={95}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
