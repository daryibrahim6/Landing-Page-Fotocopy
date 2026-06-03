"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCheck, MessageCircle, Package, Users, Palette, HeadphonesIcon, Rocket } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { LucideIcon } from "lucide-react";

const advantages: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: MessageCircle,
    title: "Proses Order Mudah",
    description: "Pemesanan gampang lewat WhatsApp, tanpa ribet",
  },
  {
    icon: Package,
    title: "Satuan Maupun Banyak",
    description: "Bisa cetak 1 lembar atau ribuan sekalipun",
  },
  {
    icon: Users,
    title: "Cocok untuk Semua",
    description: "UMKM, event, sekolah, kantor, dan personal",
  },
  {
    icon: Palette,
    title: "Banyak Pilihan Produk",
    description: "Ratusan produk cetak tersedia untuk semua kebutuhan",
  },
  {
    icon: HeadphonesIcon,
    title: "Tim yang Responsif",
    description: "Tim produksi dan CS yang cepat tanggap",
  },
  {
    icon: CheckCheck,
    title: "Cek Desain Sebelum Cetak",
    description: "File dan desain dicek dulu sebelum proses produksi",
  },
  {
    icon: Rocket,
    title: "Cepat & Custom",
    description: "Cocok untuk kebutuhan mendesak dan personalisasi tinggi",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function WhyBisaPrint() {
  return (
    <SectionWrapper id="why-bisaprint" bgVariant="white" className="relative overflow-hidden">
      <DecorativeImage
        src="/assets/decoratives/gem-crystal.png"
        width={70}
        height={82}
        opacity={0.4}
        className="-right-4 top-6 z-0 hidden md:block"
      />
      <DecorativeImage
        src="/assets/decoratives/squiggle-orange.png"
        width={100}
        height={50}
        opacity={0.3}
        className="-bottom-4 left-4 z-0 hidden md:block"
      />

      <ScrollReveal className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Kenapa Bisa Print?
        </h2>
        <div className="relative mt-2 h-7 w-[200px] select-none md:w-[240px]">
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
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Kenapa harus pilih Bisa Print? Ini alasannya.
        </p>
      </ScrollReveal>

      <div className="mt-12 rounded-3xl border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-bg-soft)] p-6 sm:p-8 md:p-10">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {advantages.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[var(--color-border)] bg-white p-5 text-center shadow-sm transition-colors hover:border-[var(--color-primary)] hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-bg-soft)]">
                  <Icon className="size-[22px] text-[var(--color-primary)]" aria-hidden="true" />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
