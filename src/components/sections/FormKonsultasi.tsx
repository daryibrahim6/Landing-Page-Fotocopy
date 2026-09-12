"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { buildWAFormUrl, isConsultationFormComplete } from "@/lib/wa";
import { trackEvent } from "@/lib/tracking";
import { products } from "@/data/products";

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const BENEFITS = [
  "Admin bantu hitung estimasi harga",
  "File desain dicek sebelum cetak",
  "Bisa order tanpa file siap cetak",
] as const;

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus-visible:border-[var(--color-primary)]";

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
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {/* Kolom copy */}
        <ScrollReveal>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
            Konsultasi Gratis
          </p>
          <h2 className="mt-2 font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
            Konsultasi Order
          </h2>
          <p className="mt-4 max-w-md text-base text-[var(--color-text-secondary)] md:text-lg">
            Isi detail pesanan kamu, lalu klik tombol WhatsApp. Admin akan bantu hitung estimasi harga.
          </p>
          <ul className="mt-6 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm font-semibold text-[var(--color-text-primary)]">
                <CheckCircle2 className="size-5 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl border border-dashed border-[var(--color-primary)]/40 bg-white/60 px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            Belum punya file desain? Tenang — kirim referensi atau ide aja, tim kami bisa bantu siapkan.
          </p>
        </ScrollReveal>

        {/* Kolom form */}
        <div className="rounded-3xl border border-[var(--color-border)] bg-white shadow-xl shadow-slate-900/5">
          <div className="h-1.5 rounded-t-3xl bg-gradient-to-r from-[#EE3B97] via-[var(--color-primary)] to-[var(--color-accent)]" aria-hidden="true" />
          <motion.div
            className="space-y-5 p-6 sm:p-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
          <motion.div custom={0} variants={fieldVariants}>
            <label htmlFor="form-nama" className="mb-1.5 block text-sm font-bold text-[var(--color-text-primary)]">
              Nama <span className="text-[var(--color-primary)]">*</span>
            </label>
            <input
              id="form-nama"
              type="text"
              required
              aria-required="true"
              autoComplete="name"
              maxLength={200}
              placeholder="Masukkan nama kamu"
              value={fields.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
              className={inputClass}
            />
          </motion.div>

          <motion.div custom={1} variants={fieldVariants}>
            <label htmlFor="form-produk" className="mb-1.5 block text-sm font-bold text-[var(--color-text-primary)]">
              Produk <span className="text-[var(--color-primary)]">*</span>
            </label>
            <select
              id="form-produk"
              required
              aria-required="true"
              value={fields.produk}
              onChange={(e) => handleChange("produk", e.target.value)}
              className={inputClass}
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
                Jumlah <span className="text-[var(--color-primary)]">*</span>
              </label>
              <input
                id="form-jumlah"
                type="number"
                min={1}
                required
                aria-required="true"
                placeholder="Contoh: 50"
                value={fields.jumlah}
                onChange={(e) => handleChange("jumlah", e.target.value)}
                className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
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
              maxLength={1000}
              placeholder="Tambah catatan atau permintaan khusus"
              value={fields.catatan}
              onChange={(e) => handleChange("catatan", e.target.value)}
              className={inputClass}
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
              className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1ebe5d]"
              onClick={(e) => {
                if (!isConsultationFormComplete(fields)) {
                  e.preventDefault();
                  setError("Mohon isi nama, produk, dan jumlah (minimal 1) dulu ya!");
                  return;
                }
                trackEvent("Lead", { source: "form-konsultasi" });
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              Konsultasi via WhatsApp
            </a>
            {error && (
              <p role="alert" className="mt-2 text-sm font-semibold text-red-500">{error}</p>
            )}
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Gratis konsultasi – admin kami siap bantu
            </p>
          </motion.div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
