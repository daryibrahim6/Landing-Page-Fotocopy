"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, MessageCircle, FileText, Search, CreditCard, Printer, MapPin } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { LucideIcon } from "lucide-react";

const steps: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ShoppingBag,
    title: "Pilih Produk",
    description: "Pilih produk cetak yang kamu butuhkan di website",
  },
  {
    icon: MessageCircle,
    title: "Klik Order via WhatsApp",
    description: "Klik tombol order, langsung terhubung ke admin",
  },
  {
    icon: FileText,
    title: "Kirim Detail Pesanan",
    description: "Sampaikan ukuran, jumlah, bahan, dan file desain",
  },
  {
    icon: Search,
    title: "Admin Cek & Estimasi",
    description: "Admin periksa file dan hitung estimasi harga",
  },
  {
    icon: CreditCard,
    title: "Konfirmasi & Bayar",
    description: "Konfirmasi order dan lakukan pembayaran",
  },
  {
    icon: Printer,
    title: "Proses Produksi",
    description: "Order masuk proses produksi cetak",
  },
  {
    icon: MapPin,
    title: "Ambil atau Dikirim",
    description: "Ambil langsung di toko atau dikirim ke alamat",
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

export function CaraOrderSection() {
  return (
    <SectionWrapper id="cara-order" bgVariant="soft" className="relative overflow-hidden">
      <DecorativeImage
        src="/assets/decoratives/squiggle-orange.png"
        width={120}
        height={60}
        opacity={0.25}
        className="-right-4 top-6 z-0 hidden md:block"
      />
      <DecorativeImage
        src="/assets/decoratives/sparkle-stars.png"
        width={80}
        height={78}
        opacity={0.35}
        className="-left-4 bottom-10 z-0 hidden md:block"
      />

      <ScrollReveal className="relative flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Cara Order via WhatsApp
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
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Gampang banget! Ikuti 7 langkah simpel ini.
        </p>
      </ScrollReveal>

      <div className="relative mt-14">
        <div
          className="pointer-events-none absolute left-0 right-0 top-8 hidden h-0.5 lg:block"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-accent) 0px, var(--color-accent) 8px, transparent 8px, transparent 14px)",
          }}
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 lg:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                custom={i}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ y: -4 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex size-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white shadow-lg shadow-primary/25">
                  {i + 1}
                </div>

                <div className="mt-4 w-full rounded-2xl border-2 border-[var(--color-border)] bg-white p-4 shadow-sm">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[var(--color-bg-soft)]">
                    <Icon className="size-5 text-[var(--color-primary)]" aria-hidden="true" />
                  </div>
                  <h3 className="mt-2 font-display text-sm font-bold text-[var(--color-text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
