"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { BlobDecoration } from "@/components/shared/BlobDecoration";
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

// TODO: Replace placeholder links ("#") with actual social media profile URLs from the client.
const socialLinks: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Instagram", href: "#", icon: InstagramIcon },
];

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};



// ─── Component ───────────────────────────────────────────────────────────────

export function ContactSection() {
  return (
    <SectionWrapper id="kontak" bgVariant="soft" className="relative overflow-hidden">
      {/* Task 2 Background decoratives */}
      <DecorativeImage
        src="/assets/decoratives/torn-paper-tape.png"
        width={200}
        height={150}
        opacity={0.45}
        className="-bottom-6 -right-6 z-0 hidden md:block"
      />
      <DecorativeImage
        src="/assets/decoratives/blob-pink-glossy.png"
        width={240}
        height={240}
        opacity={0.15}
        className="-left-16 top-1/4 z-0 hidden md:block"
      />
      <DecorativeImage
        src="/assets/decoratives/bow-ribbon.png"
        width={130}
        height={138}
        opacity={0.4}
        rotate={-10}
        className="right-12 top-12 z-0 hidden md:block"
      />

      {/* Background decoratives */}
      <BlobDecoration
        color="var(--color-primary-light)"
        size={160}
        opacity={0.2}
        variant={1}
        className="-right-12 -top-8 hidden md:block"
      />
      <BlobDecoration
        color="var(--color-accent-light)"
        size={120}
        opacity={0.15}
        variant={2}
        className="-bottom-10 -left-10 hidden md:block"
      />

      <motion.div
        className="relative grid gap-10 lg:grid-cols-2 lg:gap-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {/* Left column: info */}
        <motion.div variants={fadeUp} className="flex flex-col items-start">
          <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
            Temukan Kami
          </h2>
          <div className="relative mt-2 h-7 w-[200px] md:w-[240px] select-none pointer-events-none">
            <Image 
              src="/assets/decoratives/swoosh-orange.png"
              alt="" 
              fill
              className="object-contain opacity-80"
              aria-hidden="true"
              quality={90}
              sizes="(max-width: 768px) 200px, 400px"
            />
          </div>
          <p className="mt-4 max-w-md text-base text-[var(--color-text-secondary)]">
            Mampir langsung atau chat kami dulu - kami siap bantu.
          </p>

          <div className="mt-8 space-y-4 text-[var(--color-text-secondary)]">
            <p className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
              </span>
              <span className="pt-1">Jl. Dalang I No.45, RT.003/RW.017, Pengasinan, Kec. Rawalumbu, Kota Bekasi, Jawa Barat 17115</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock className="size-4 text-primary" aria-hidden="true" />
              </span>
              <span className="pt-1">Senin – Sabtu: 08.00 – 17.00 WIB</span>
            </p>
          </div>

          <Image
            src="/assets/decoratives/arrow-curved.png"
            alt=""
            width={90}
            height={93}
            className="my-2 ml-4 md:ml-12 block rotate-[160deg] animate-pulse hidden sm:block"
            quality={90}
            sizes="(max-width: 768px) 100px, 200px"
          />
          <div className="mt-6">
            <WhatsAppButton
              label="Hubungi via WhatsApp"
              message="Halo BisaPrint, saya ingin bertanya lokasi dan jam operasional."
              variant="primary"
              size="lg"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-primary hover:text-primary"
                  style={{ transform: "rotate(-1deg)" }}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  {link.label}
                </a>
              );
            })}
          </div>
        </motion.div>

        {/* Right column: map placeholder - scrapbook style */}
        <motion.div variants={fadeUp}>
          <div
            className="relative overflow-hidden rounded-3xl border-2 border-[var(--color-border)] bg-white shadow-sm p-2"
            style={{ transform: "rotate(1deg)" }}
          >
            <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://maps.google.com/maps?q=Jl.+Dalang+I+No.45+RT.003+RW.017+Pengasinan+Rawalumbu+Kota+Bekasi+17115&output=embed&hl=id"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi BisaPrint"
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            Peta Lokasi Resmi BisaPrint
          </p>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
