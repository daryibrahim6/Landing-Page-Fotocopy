"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, MessageCircle, FileText, Search, CreditCard, Printer, MapPin } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
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
  hidden: { opacity: 0, x: 24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

export function CaraOrderSection() {
  return (
    <SectionWrapper id="cara-order" bgVariant="white" className="relative overflow-hidden">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {/* Panel kiri — sticky di desktop */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ScrollReveal>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
              Cara Order
            </p>
            <h2 className="mt-2 font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
              Cara Order via WhatsApp
            </h2>
            <p className="mt-4 max-w-md text-base text-[var(--color-text-secondary)] md:text-lg">
              Gampang banget! Ikuti 7 langkah simpel ini — dari pilih produk sampai pesanan sampai di tangan.
            </p>

            <div className="relative mx-auto mt-8 max-w-sm lg:mx-0">
              <div className="relative aspect-square w-full">
                <Image
                  src="/assets/illustrations/chat-order.svg"
                  alt="Ilustrasi percakapan order di WhatsApp dengan admin BisaPrint"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 380px"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center lg:justify-start">
              <WhatsAppButton
                label="Mulai Order Sekarang"
                message="Halo BisaPrint, saya ingin pesan cetak."
                variant="primary"
                size="md"
              />
            </div>
          </ScrollReveal>
        </div>

        {/* Timeline kanan */}
        <ol className="relative space-y-4">
          <div
            className="pointer-events-none absolute bottom-6 left-7 top-6 w-0.5 -translate-x-1/2"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, var(--color-border) 0px, var(--color-border) 6px, transparent 6px, transparent 12px)",
            }}
            aria-hidden="true"
          />
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <motion.li
                key={step.title}
                custom={i}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="relative flex items-start gap-4"
              >
                <span
                  className={
                    "relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 font-display text-lg font-black shadow-sm " +
                    (isLast
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] bg-white text-[var(--color-primary)]")
                  }
                >
                  {i + 1}
                </span>
                <div className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md sm:p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-[var(--color-primary)]" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </SectionWrapper>
  );
}
