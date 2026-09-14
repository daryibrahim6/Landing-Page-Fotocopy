"use client";

import Image from "next/image";
import { Printer, Store, Zap, Palette } from "lucide-react";

import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────

interface Machine {
  id: string;
  name: string;
  badge: string;
  badgeStyle: string;
  image: string;
  imageClass: string;
  specs: string[];
}

const machines: Machine[] = [
  {
    id: "c2060",
    name: "Konica Minolta AccurioPress C2060",
    badge: "Warna Produksi",
    badgeStyle: "bg-primary/10 text-primary",
    image: "/assets/machines/konica-c2060.webp",
    imageClass: "object-contain",
    specs: [
      "Digital color press — warna konsisten di setiap lembar",
      "Kertas hingga A3+ — brosur, stiker, kartu nama, poster",
      "Finishing lengkap — potong, lipat, jilid inline",
    ],
  },
  {
    id: "b958",
    name: "Konica Minolta bizhub 958",
    badge: "Mono Kecepatan Tinggi",
    badgeStyle: "bg-slate-800/10 text-slate-700",
    image: "/assets/machines/konica-958.webp",
    imageClass: "object-contain",
    specs: [
      "Cetak hitam-putih volume besar, tetap tajam",
      "Ideal untuk dokumen, skripsi, fotocopy & jilid",
      "Antrian cepat — order satuan sampai ribuan lembar",
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function MachinesSection() {
  return (
    <SectionWrapper id="mesin" bgVariant="soft" className="relative overflow-hidden">
      <ScrollReveal className="relative z-10 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Printer className="size-3.5" aria-hidden="true" />
          Dapur Produksi
        </span>
        <h2 className="mt-4 font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Dicetak di Mesin Industri, Bukan Printer Rumahan
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Semua order dikerjakan di tempat pakai mesin produksi Konica Minolta —
          warna stabil, hasil tajam, antrian cepat.
        </p>
      </ScrollReveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {machines.map((m) => (
          <ScrollReveal key={m.id}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition-all duration-200 hover:shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12)]">
              {/* Machine image — object-contain di atas dot texture biar foto mesin
                  (transparan, aspect beda-beda) tetap rapi */}
              <div className="relative flex h-56 items-center justify-center bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:14px_14px] p-6">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  className={cn(m.imageClass, "p-4 transition-transform duration-300 group-hover:scale-[1.03]")}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className={cn("inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold", m.badgeStyle)}>
                  {m.badge}
                </span>
                <h3 className="font-display text-lg font-bold leading-snug text-[var(--color-text-primary)]">
                  {m.name}
                </h3>
                <ul className="mt-auto space-y-1.5">
                  {m.specs.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <Zap className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </ScrollReveal>
        ))}

        {/* Card toko offline — foto asli = bukti toko beneran ada */}
        <ScrollReveal>
          <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition-all duration-200 hover:shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12)]">
            <div className="relative h-56 overflow-hidden">
              <Image
                src="/assets/machines/company-photo.webp"
                alt="Toko BisaPrint di Rawalumbu, Bekasi"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">
                <Store className="size-3" aria-hidden="true" />
                Toko Offline
              </span>
              <h3 className="font-display text-lg font-bold leading-snug text-[var(--color-text-primary)]">
                Kunjungi Toko Kami
              </h3>
              <ul className="mt-auto space-y-1.5">
                <li className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Palette className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  Jl. Dalang I No.45, Rawalumbu, Kota Bekasi
                </li>
                <li className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Zap className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  Bisa datang langsung — konsultasi file & bahan di tempat
                </li>
              </ul>
            </div>
          </article>
        </ScrollReveal>
      </div>
    </SectionWrapper>
  );
}
