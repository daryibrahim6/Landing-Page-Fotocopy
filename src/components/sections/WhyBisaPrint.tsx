"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCheck, MessageCircle, Package, Users, Palette, HeadphonesIcon, Rocket } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
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
    <SectionWrapper id="why-bisaprint" bgVariant="soft" className="relative overflow-hidden">
      <ScrollReveal className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Kenapa Bisa Print?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Kenapa harus pilih Bisa Print? Ini alasannya.
        </p>
      </ScrollReveal>

      <motion.div
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Kartu ilustrasi — anchor visual bento */}
        <motion.article
          variants={cardVariants}
          className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:col-span-2 lg:p-8"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/5"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="font-display text-4xl font-black text-[var(--color-primary)] md:text-5xl">
              10.000+
            </p>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-[var(--color-text-secondary)]">
              order cetak selesai — dari stiker label sampai spanduk event, semua dicek sebelum naik produksi.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-[560/420] w-full">
              <Image
                src="/assets/illustrations/why-bisaprint-v2.svg"
                alt="Ilustrasi produk cetak BisaPrint yang sudah dicek kualitasnya"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </motion.article>

        {advantages.map((item) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              variants={cardVariants}
              className="group flex flex-col items-start gap-3 rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
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
    </SectionWrapper>
  );
}
