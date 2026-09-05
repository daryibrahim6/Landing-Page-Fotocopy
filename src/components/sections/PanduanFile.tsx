"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Ruler, Droplet, Crop, Type, AlertTriangle } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const guidelines: { icon: LucideIcon; title: string; desc: string; status: "ok" | "warning" }[] = [
  {
    icon: FileText,
    title: "Format File",
    desc: "PDF, PNG, JPG, CDR, AI, PSD — pastikan file bisa dibuka",
    status: "ok",
  },
  {
    icon: ImageIcon,
    title: "Resolusi Minimal",
    desc: "300 dpi untuk hasil cetak tajam — hindari gambar pecah",
    status: "ok",
  },
  {
    icon: Droplet,
    title: "Warna CMYK",
    desc: "Gunakan mode warna CMYK, bukan RGB untuk akurasi warna cetak",
    status: "ok",
  },
  {
    icon: Ruler,
    title: "Ukuran Sesuai Cetak",
    desc: "Desain harus sesuai ukuran cetak final — jangan pakai ukuran asal",
    status: "ok",
  },
  {
    icon: Crop,
    title: "Tambahkan Bleed",
    desc: "Beri area bleed 3-5mm di setiap sisi untuk hindari potongan putih",
    status: "ok",
  },
  {
    icon: Type,
    title: "Font: Convert ke Outline",
    desc: "Convert font ke outline atau embed agar tidak berubah di komputer lain",
    status: "ok",
  },
  {
    icon: AlertTriangle,
    title: "Hindari Gambar Pecah",
    desc: "Jangan gunakan gambar resolusi rendah yang terlihat blur atau pecah",
    status: "warning",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function PanduanFile() {
  return (
    <SectionWrapper id="panduan-file" bgVariant="white" className="relative overflow-hidden">
      <ScrollReveal className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Panduan File Siap Cetak
        </h2>
        <div className="relative mt-2 h-3.5 w-[200px] select-none md:w-[240px]">
          <Image
            src="/assets/illustrations/underline-accent.svg"
            alt=""
            fill
            className="object-contain"
            aria-hidden="true"
          />
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Biar hasil cetaknya maksimal, pastikan file desain kamu sesuai panduan ini.
        </p>
      </ScrollReveal>

      <div className="relative mx-auto mt-12 max-w-3xl">
        <div className="absolute -left-3 top-0 h-full w-1 rounded-full bg-[var(--color-border)] max-md:hidden" aria-hidden="true" />

        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {guidelines.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="relative flex items-start gap-5 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition-all duration-200 hover:translate-x-1 hover:border-[var(--color-primary)]"
              >
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl",
                    item.status === "warning"
                      ? "bg-[var(--color-accent)]/10"
                      : "bg-[var(--color-bg-soft)]",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-6",
                      item.status === "warning"
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-primary)]",
                    )}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                      {item.title}
                    </h3>
                    {item.status === "warning" && (
                      <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent)]">
                        PENTING
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {item.desc}
                  </p>
                </div>

                <div className="shrink-0 self-center">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-xs font-bold",
                      item.status === "warning"
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]",
                    )}
                  >
                    {i + 1}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        className="relative mx-auto mt-12 max-w-2xl text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="rounded-2xl border-2 border-dashed border-[var(--color-accent)] bg-white p-6">
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <strong className="text-[var(--color-text-primary)]">Masih bingung?</strong>{" "}
            Gak usah khawatir — kirim aja file kamu, admin kami bakal cek dan kasih tahu kalau ada yang perlu diperbaiki.{" "}
            <span className="font-display font-bold text-[var(--color-primary)]">Gratis!</span>
          </p>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
