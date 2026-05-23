"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

const features = [
  {
    emoji: "🖨️",
    title: "Mesin Professional",
    description:
      "Konica Minolta c2060 untuk warna akurat, Konica Minolta 958 untuk dokumen hitam putih massal.",
    rotate: "-1.2deg",
    accent: "var(--color-primary-light)",
  },
  {
    emoji: "⏱️",
    title: "Pengerjaan Cepat",
    description:
      "Sebagian besar order selesai di hari yang sama. Urgent? Bilang aja.",
    rotate: "0.8deg",
    accent: "var(--color-accent-light)",
  },
  {
    emoji: "💰",
    title: "Harga Bersahabat",
    description:
      "Harga transparan mulai dari, cocok untuk UMKM hingga kebutuhan personal.",
    rotate: "1deg",
    accent: "var(--color-primary-light)",
  },
  {
    emoji: "📦",
    title: "Berbagai Layanan",
    description:
      "Digital printing, sablon, dokumen, kebutuhan UMKM - semua dalam satu tempat.",
    rotate: "-0.5deg",
    accent: "var(--color-accent-light)",
  },
] as const;



function RibbonBadge() {
  return (
    <div className="absolute -left-3 -top-3 z-10 flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-3 py-1.5 shadow-md">
      <span className="font-display text-xs font-black text-white">
        Pro
      </span>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: i * 0.1,
    },
  }),
};

export function WhyBisaPrint() {
  return (
    <SectionWrapper id="kenapa" bgVariant="white" className="relative overflow-hidden">
      {/* Background Decoratives */}
      <DecorativeImage
        src="/assets/decoratives/swoosh-orange.png"
        width={280}
        height={54}
        opacity={0.45}
        className="bottom-4 right-4 z-0"
      />
      <DecorativeImage
        src="/assets/decoratives/squiggle-orange.png"
        width={140}
        height={140}
        opacity={0.3}
        rotate={30}
        className="-left-6 top-1/2 z-0"
      />

      <div className="flex flex-col items-center text-center">
        <Image
          src="/assets/decoratives/gem-crystal.png"
          alt=""
          width={80}
          height={95}
          className="mb-3 inline-block -rotate-12"
          aria-hidden="true"
          quality={90}
          sizes="(max-width: 768px) 100px, 200px"
        />
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Kenapa BisaPrint?
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
        <p className="mx-auto mt-4 max-w-2xl font-body text-base text-[var(--color-text-secondary)] md:text-lg">
          Bukan cuma cetak. Kita pastikan hasilnya bikin klienmu terkesan.
        </p>
      </div>

      {/* Feature cards - sticky note style */}
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {features.map((feature, i) => {
          const rotations = ["-1.2deg", "0.8deg", "1deg", "-0.5deg"];
          const cardRotate = rotations[i % rotations.length];
          return (
            <motion.article
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              style={{ rotate: cardRotate }}
              whileHover={{
                rotate: "0deg",
                scale: 1.03,
                boxShadow:
                  "0 12px 32px -4px rgba(224,24,122,0.18), 0 4px 12px -2px rgba(0,0,0,0.08)",
                transition: { duration: 0.25, ease: "easeOut" },
              }}
              className="cursor-default rounded-3xl border-2 border-dashed border-primary-light bg-white p-6 shadow-sm"
            >
            {/* Emoji badge */}
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-full"
              style={{ backgroundColor: feature.accent }}
            >
              <span className="text-2xl" aria-hidden="true">
                {feature.emoji}
              </span>
            </div>

            <h3 className="font-display text-lg font-black text-[var(--color-text-primary)]">
              {feature.title}
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {feature.description}
            </p>
          </motion.article>
        )})}
      </div>

      {/* Machine photo placeholder */}
      <motion.figure
        className="relative mx-auto mt-14 max-w-sm overflow-hidden sm:overflow-visible"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <RibbonBadge />
        <div className="relative mt-8 flex h-[380px] w-full items-center justify-center overflow-hidden rounded-3xl bg-[var(--color-bg-soft)] p-6 shadow-md">
          <Image
            src="/assets/machines/konica-958.png"
            alt="Konica Minolta 958 (B&W) - standar produksi profesional BisaPrint"
            width={319}
            height={577}
            style={{ objectFit: "contain" }}
            className="z-10 h-full w-auto transition-transform duration-500 hover:scale-105"
            quality={95}
          />
        </div>
        <figcaption className="mt-3 text-center font-body text-sm text-[var(--color-text-muted)]">
          Konica Minolta 958 (B&W) - standar produksi profesional
        </figcaption>
      </motion.figure>
    </SectionWrapper>
  );
}
