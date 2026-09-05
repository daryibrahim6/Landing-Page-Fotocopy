"use client";

import Image from "next/image";

import { MapPin, Clock, Printer } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { BlobDecoration } from "@/components/shared/BlobDecoration";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { IG_URL, waUrl, EMAIL_URL, MAPS_EMBED_URL } from "@/lib/constants";

const socialLinks = [
  {
    label: "Instagram",
    href: IG_URL,
    handle: "@bisaprintshop",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: waUrl(),
    handle: "+62 81299435019",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: EMAIL_URL,
    handle: "bisadigitalprint@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4L12 13 2 4" />
      </svg>
    ),
  },
];

export function ContactSection() {
  return (
    <SectionWrapper id="kontak" bgVariant="soft" className="relative overflow-hidden">
      <DecorativeImage
        src="/assets/decoratives/torn-paper-tape.webp"
        width={200}
        height={150}
        opacity={0.45}
        className="-bottom-6 -right-6 z-0 hidden md:block"
      />
      <DecorativeImage
        src="/assets/decoratives/blob-pink-glossy.webp"
        width={240}
        height={240}
        opacity={0.15}
        className="-left-16 top-1/4 z-0 hidden md:block"
      />
      <DecorativeImage
        src="/assets/decoratives/bow-ribbon.webp"
        width={130}
        height={138}
        opacity={0.4}
        rotate={-10}
        className="right-12 top-12 z-0 hidden md:block"
      />

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

      <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col items-start">
          <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
            Hubungi Kami
          </h2>
          <div className="relative mt-2 h-7 w-[200px] select-none md:w-[240px]">
            <Image
              src="/assets/decoratives/swoosh-orange.webp"
              alt=""
              fill
              className="object-contain opacity-80"
              aria-hidden="true"
              quality={90}
              sizes="(max-width: 768px) 200px, 400px"
            />
          </div>
          <p className="mt-4 max-w-md text-base text-[var(--color-text-secondary)]">
            Mampir langsung atau chat kami dulu &mdash; kami siap bantu.
          </p>

          <div className="mt-6 space-y-3 text-sm text-[var(--color-text-secondary)]">
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
              <span className="pt-1">Senin &ndash; Sabtu: 08.00 &ndash; 17.00 WIB</span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-primary hover:text-primary"
                style={{ transform: "rotate(-1deg)" }}
              >
                {link.icon}
                {link.handle}
              </a>
            ))}
          </div>

          <a
            href="/simulator"
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-5 py-2.5 text-sm font-bold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)] hover:text-white"
          >
            <Printer className="size-4" aria-hidden="true" />
            Simulasi Cetak &mdash; Upload &amp; Preview
          </a>

          <div className="mt-6 w-full overflow-hidden rounded-2xl border-2 border-[var(--color-border)] shadow-sm">
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={MAPS_EMBED_URL}
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi BisaPrint"
              />
            </div>
          </div>
        </div>

        <div>
          <div
            className="relative overflow-hidden rounded-3xl border-2 border-[#25D366]/30 bg-white shadow-md p-8"
            style={{ transform: "rotate(1deg)" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              aria-hidden="true"
              style={{
                backgroundImage: `radial-gradient(circle, #25D366 1px, transparent 1px)`,
                backgroundSize: "16px 16px",
              }}
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
              </div>

              <h3 className="mt-5 font-display text-xl font-bold text-[var(--color-text-primary)]">
                Pesan Sekarang via WhatsApp!
              </h3>
              <p className="mt-2 max-w-xs text-sm text-[var(--color-text-secondary)]">
                Hubungi kami untuk konsultasi, tanya harga, atau langsung pesan
              </p>

              <a
                href={waUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:bg-[#1ebe5d] hover:shadow-xl"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
                Chat WhatsApp Sekarang
              </a>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
