"use client";

import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Ruler, Droplet, Crop, Type, AlertTriangle, MessageCircle } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { buildWAUrl } from "@/lib/wa";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const guidelines: { icon: LucideIcon; title: string; desc: string; status: "ok" | "warning" }[] = [
  {
    icon: FileText,
    title: "Format File",
    desc: "PDF, PNG, JPG, CDR, AI, PSD – pastikan file bisa dibuka",
    status: "ok",
  },
  {
    icon: ImageIcon,
    title: "Resolusi Minimal",
    desc: "300 dpi untuk hasil cetak tajam – hindari gambar pecah",
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
    desc: "Desain harus sesuai ukuran cetak final – jangan pakai ukuran asal",
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function PanduanFile() {
  return (
    <SectionWrapper id="panduan-file" bgVariant="white" className="relative overflow-hidden">
      <ScrollReveal className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Panduan File Siap Cetak
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Biar hasil cetaknya maksimal, pastikan file desain kamu sesuai panduan ini.
        </p>
      </ScrollReveal>

      <motion.div
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {guidelines.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className={cn(
                "group relative flex flex-col gap-3 rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1",
                item.status === "warning"
                  ? "border-[var(--color-accent)]/50 hover:border-[var(--color-accent)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary)]",
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    item.status === "warning"
                      ? "bg-[var(--color-accent)]/10"
                      : "bg-primary/10",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5",
                      item.status === "warning"
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-primary)]",
                    )}
                    aria-hidden="true"
                  />
                </div>
                <span className="font-display text-sm font-black text-[var(--color-border)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
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
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.desc}
              </p>
            </motion.div>
          );
        })}

        {/* Tile CTA — nutup grid */}
        <motion.a
          variants={itemVariants}
          href={buildWAUrl("general")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("Lead", { source: "panduan-file-cta" })}
          className="group relative flex flex-col justify-between gap-3 overflow-hidden rounded-2xl p-5 text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          style={{
            background:
              "linear-gradient(150deg, #EE3B97 0%, #DE127A 55%, #A50D5F 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15"
            aria-hidden="true"
          />
          <span className="relative flex size-11 items-center justify-center rounded-xl bg-white/20">
            <MessageCircle className="size-5" aria-hidden="true" />
          </span>
          <h3 className="relative font-display text-base font-bold leading-snug">
            Masih bingung? Kirim aja file kamu
          </h3>
          <p className="relative text-sm leading-relaxed text-white/85">
            Admin cek &amp; kasih tahu kalau ada yang perlu diperbaiki. Gratis!
          </p>
        </motion.a>
      </motion.div>
    </SectionWrapper>
  );
}
