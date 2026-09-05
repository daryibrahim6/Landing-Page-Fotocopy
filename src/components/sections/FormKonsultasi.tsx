"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { DecorativeImage } from "@/components/shared/DecorativeImage";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { buildWAFormUrl } from "@/lib/wa";
import { products } from "@/data/products";

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export function FormKonsultasi() {
  const [fields, setFields] = useState({
    nama: "",
    produk: "",
    jumlah: "",
    ukuran: "",
    bahan: "",
    catatan: "",
  });
  const [error, setError] = useState("");

  const handleChange = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const waHref = buildWAFormUrl(fields);

  return (
    <SectionWrapper id="form-konsultasi" bgVariant="soft" className="relative overflow-hidden">
      <DecorativeImage
        src="/assets/decoratives/squiggle-orange.webp"
        width={100}
        height={80}
        opacity={0.15}
        className="-left-4 top-10 z-0 hidden md:block"
      />

      <div className="mx-auto max-w-2xl">
        <ScrollReveal className="flex flex-col items-center text-center">
          <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
            Konsultasi Order
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-[var(--color-text-secondary)]">
            Isi detail pesanan kamu, lalu klik tombol WhatsApp. Admin akan bantu hitung estimasi harga.
          </p>
        </ScrollReveal>

        <motion.div
          className="mt-10 space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div custom={0} variants={fieldVariants}>
            <label htmlFor="form-nama" className="mb-1.5 block text-sm font-bold text-[var(--color-text-primary)]">
              Nama <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              id="form-nama"
              type="text"
              placeholder="Masukkan nama kamu"
              value={fields.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
              className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus-visible:border-[var(--color-primary)]"
            />
          </motion.div>

          <motion.div custom={1} variants={fieldVariants}>
            <label htmlFor="form-produk" className="mb-1.5 block text-sm font-bold text-[var(--color-text-primary)]">
              Produk <span className="text-[var(--color-accent)]">*</span>
            </label>
            <select
              id="form-produk"
              value={fields.produk}
              onChange={(e) => handleChange("produk", e.target.value)}
              className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus-visible:border-[var(--color-primary)]"
            >
              <option value="">— Pilih produk —</option>
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
              <option value="Lainnya">Lainnya (tidak ada di daftar)</option>
            </select>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <motion.div custom={2} variants={fieldVariants}>
              <label htmlFor="form-jumlah" className="mb-1.5 block text-sm font-bold text-[var(--color-text-primary)]">
                Jumlah <span className="text-[var(--color-accent)]">*</span>
              </label>
              <input
                id="form-jumlah"
                type="number"
                min={1}
                placeholder="Contoh: 50"
                value={fields.jumlah}
                onChange={(e) => handleChange("jumlah", e.target.value)}
                className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus-visible:border-[var(--color-primary)]"
              />
            </motion.div>

            <motion.div custom={3} variants={fieldVariants}>
              <label htmlFor="form-ukuran" className="mb-1.5 block text-sm font-bold text-[var(--color-text-primary)]">
                Ukuran
              </label>
              <input
                id="form-ukuran"
                type="text"
                placeholder="Contoh: A4"
                value={fields.ukuran}
                onChange={(e) => handleChange("ukuran", e.target.value)}
                className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus-visible:border-[var(--color-primary)]"
              />
            </motion.div>

            <motion.div custom={4} variants={fieldVariants}>
              <label htmlFor="form-bahan" className="mb-1.5 block text-sm font-bold text-[var(--color-text-primary)]">
                Bahan
              </label>
              <input
                id="form-bahan"
                type="text"
                placeholder="Contoh: Chromo"
                value={fields.bahan}
                onChange={(e) => handleChange("bahan", e.target.value)}
                className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus-visible:border-[var(--color-primary)]"
              />
            </motion.div>
          </div>

          <motion.div custom={5} variants={fieldVariants}>
            <label htmlFor="form-catatan" className="mb-1.5 block text-sm font-bold text-[var(--color-text-primary)]">
              Catatan
            </label>
            <textarea
              id="form-catatan"
              rows={3}
              placeholder="Tambah catatan atau permintaan khusus"
              value={fields.catatan}
              onChange={(e) => handleChange("catatan", e.target.value)}
              className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus-visible:border-[var(--color-primary)]"
            />
          </motion.div>

          <motion.div
            custom={6}
            variants={fieldVariants}
            className="pt-2 text-center"
          >
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1ebe5d]"
              onClick={(e) => {
                if (!fields.nama || !fields.produk || !fields.jumlah) {
                  e.preventDefault();
                  setError("Mohon isi nama, produk, dan jumlah dulu ya!");
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              Konsultasi via WhatsApp
            </a>
            {error && (
              <p className="mt-2 text-sm font-semibold text-red-500">{error}</p>
            )}
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Gratis konsultasi — admin kami siap bantu
            </p>
          </motion.div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
