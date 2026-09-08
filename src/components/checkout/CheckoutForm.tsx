"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, CreditCard, MessageCircle, Check, Upload, FileText, X } from "lucide-react";
import { products } from "@/data/products";
import { cn, formatRupiah } from "@/lib/utils";
import { buildWAUrl } from "@/lib/wa";
import { isMidtransConfigured } from "@/lib/midtrans";
import { trackPurchase, trackEvent } from "@/lib/tracking";
import { calculatePrice } from "@/lib/pricing";

interface FormData {
  name: string;
  phone: string;
  email: string;
  pickup: "ambil" | "kirim";
  address: string;
  notes: string;
  quantity: number;
  material: string;
  size: string;
  finishing: string;
}

const PHONE_REGEX = /^[0-9]{9,15}$/;

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("product");

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [productId],
  );

  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    pickup: "ambil",
    address: "",
    notes: "",
    quantity: 1,
    material: product?.materials[0] ?? "",
    size: product?.sizes[0] ?? "",
    finishing: product?.finishings[0] ?? "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileUploading, setFileUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "file", string>>>({});
  const [error, setError] = useState("");

  const pricing = useMemo(() => {
    if (!product) return { subtotal: 0, total: 0, breakdown: "" };
    return calculatePrice(product.id, form.size, form.material, form.finishing, form.quantity);
  }, [product, form.size, form.material, form.finishing, form.quantity]);

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
      setError("");
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof FormData | "file", string>> = {};

    if (!form.name.trim()) next.name = "Nama wajib diisi";
    if (!form.phone.trim()) {
      next.phone = "No. WhatsApp wajib diisi";
    } else if (!PHONE_REGEX.test(form.phone.replace(/\D/g, ""))) {
      next.phone = "No. WhatsApp tidak valid";
    }
    if (form.pickup === "kirim" && !form.address.trim()) {
      next.address = "Alamat wajib diisi untuk pengiriman";
    }
    if (form.quantity < 1) next.quantity = "Jumlah minimal 1";

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(selected.type)) {
      setErrors((prev) => ({ ...prev, file: "Hanya PDF, PNG, JPG, WEBP" }));
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: "Maksimal 10MB" }));
      return;
    }

    setFile(selected);
    setErrors((prev) => ({ ...prev, file: undefined }));
    setFileUploading(true);

    try {
      const data = new FormData();
      data.append("file", selected);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (result.url) {
        setFileUrl(result.url);
      } else {
        setErrors((prev) => ({ ...prev, file: result.error ?? "Gagal upload file" }));
        setFile(null);
      }
    } catch {
      setErrors((prev) => ({ ...prev, file: "Gagal upload file" }));
      setFile(null);
    } finally {
      setFileUploading(false);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setFileUrl("");
  }, []);

  const handleMidtrans = useCallback(async () => {
    if (!product || !validate()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/midtrans/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: product.id,
              name: `${product.name} (${form.size} - ${form.material} - ${form.finishing})`,
              price: Math.round(pricing.total / form.quantity),
              quantity: form.quantity,
            },
          ],
          customerDetails: {
            name: form.name,
            phone: form.phone,
            email: form.email || `customer-${form.phone.replace(/\D/g, "")}@bisaprint.com`,
          },
          grossAmount: pricing.total,
          specs: {
            ukuran: form.size,
            bahan: form.material,
            finishing: form.finishing,
            jumlah: String(form.quantity),
            file: fileUrl || "Belum upload",
          },
          customerExtra: {
            pickup: form.pickup,
            address: form.address,
            notes: form.notes,
          },
        }),
      });

      const data = await res.json();

      if (data.simulation) {
        const waLink = buildWAUrl("postCheckout", data.orderId);
        window.open(waLink, "_blank");
        setSubmitted(true);
        setSubmitting(false);
        return;
      }

      if (data.token && typeof window !== "undefined" && "snap" in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const snap = (window as any).snap;
        snap.pay(data.token, {
          onSuccess: () => {
            trackPurchase(data.orderId, pricing.total, "IDR", [{ id: product.id, quantity: form.quantity, price: pricing.total / form.quantity }]);
            setSubmitted(true);
            setSubmitting(false);
            router.push(`/checkout/success?orderId=${data.orderId}`);
          },
          onPending: () => {
            setSubmitting(false);
            setError("Pembayaran pending. Silakan selesaikan pembayaran.");
          },
          onError: () => {
            setSubmitting(false);
            setError("Pembayaran gagal. Silakan coba lagi.");
          },
        });
      } else {
        const waLink = buildWAUrl("postCheckout", data.orderId ?? "ORDER");
        window.open(waLink, "_blank");
        setSubmitted(true);
        setSubmitting(false);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan hubungi admin via WhatsApp.");
      const waLink = buildWAUrl("general");
      window.open(waLink, "_blank");
      setSubmitting(false);
    }
  }, [product, form, pricing, fileUrl, router, validate]);

  const handleWaOnly = useCallback(() => {
    if (!product || !validate()) return;
    trackEvent("Lead", { source: "checkout-wa", product: product.id });
    const fileInfo = fileUrl ? `\nFile: ${fileUrl}` : "";
    const msg = `Halo Admin Bisa Print, saya mau order.\nProduk: ${product.name}\nUkuran: ${form.size}\nBahan: ${form.material}\nFinishing: ${form.finishing}\nJumlah: ${form.quantity}\nNama: ${form.name}\nNo. WA: ${form.phone}\nPengambilan: ${form.pickup}${form.pickup === "kirim" ? `\nAlamat: ${form.address}` : ""}\nCatatan: ${form.notes}${fileInfo}`;
    window.open(buildWAUrl("general").split("?text=")[0] + "?text=" + encodeURIComponent(msg), "_blank");
    setSubmitted(true);
  }, [product, form, fileUrl, validate]);

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShoppingCart className="mx-auto mb-4 size-12 text-[var(--color-text-muted)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Produk Tidak Ditemukan
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Silakan pilih produk dari halaman utama.
        </p>
        <Link
          href="/#produk"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" />
          Lihat Produk
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
          <Check className="size-8 text-green-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Pesanan Diterima
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Admin kami akan menghubungi kamu melalui WhatsApp untuk konfirmasi.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/#produk"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Produk
      </Link>

      <div className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-6 sm:p-8">
        <div className="mb-8 border-b-2 border-[var(--color-border)] pb-6">
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {product.name} &mdash; Mulai {formatRupiah(product.priceFrom)}/{product.unit}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-3 font-display text-base font-bold text-[var(--color-text-primary)]">
                Spesifikasi Produk
              </legend>
              <div className="space-y-4">
                <OptionGroup
                  label="Ukuran"
                  options={product.sizes}
                  selected={form.size}
                  onSelect={(value) => update("size", value)}
                />
                <OptionGroup
                  label="Bahan"
                  options={product.materials}
                  selected={form.material}
                  onSelect={(value) => update("material", value)}
                />
                <OptionGroup
                  label="Finishing"
                  options={product.finishings}
                  selected={form.finishing}
                  onSelect={(value) => update("finishing", value)}
                />
                <div>
                  <label htmlFor="qty" className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Jumlah
                  </label>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    max={9999}
                    value={form.quantity}
                    onChange={(e) => update("quantity", Math.max(1, Number(e.target.value)))}
                    className={cn(
                      "w-32 rounded-xl border-2 px-4 py-2 text-sm font-semibold outline-none transition focus:border-primary",
                      errors.quantity ? "border-red-400" : "border-[var(--color-border)]",
                    )}
                  />
                  {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 font-display text-base font-bold text-[var(--color-text-primary)]">
                File Desain
              </legend>
              <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-soft)] p-5 text-center">
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!file ? (
                  <label htmlFor="file" className="flex cursor-pointer flex-col items-center gap-2">
                    <Upload className="size-8 text-[var(--color-text-muted)]" />
                    <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                      Upload file desain (PDF/PNG/JPG, max 10MB)
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">Opsional — bisa dikirim via WhatsApp nanti</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-primary" />
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{file.name}</span>
                    </div>
                    <button type="button" onClick={clearFile} className="rounded-full p-1 hover:bg-red-50">
                      <X className="size-4 text-red-500" />
                    </button>
                  </div>
                )}
                {fileUploading && <p className="mt-2 text-xs text-[var(--color-text-muted)]">Mengupload...</p>}
                {errors.file && <p className="mt-2 text-xs text-red-500">{errors.file}</p>}
                {fileUrl && <p className="mt-2 text-xs text-green-600">File siap</p>}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 font-display text-base font-bold text-[var(--color-text-primary)]">
                Data Pemesan
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="name"
                  label="Nama Lengkap"
                  type="text"
                  value={form.name}
                  onChange={(value) => update("name", value)}
                  error={errors.name}
                  placeholder="Nama kamu"
                  required
                />
                <Field
                  id="phone"
                  label="No. WhatsApp"
                  type="tel"
                  value={form.phone}
                  onChange={(value) => update("phone", value.replace(/\D/g, ""))}
                  error={errors.phone}
                  placeholder="0812xxxxxxx"
                  required
                />
                <Field
                  id="email"
                  label="Email (opsional)"
                  type="email"
                  value={form.email}
                  onChange={(value) => update("email", value)}
                  error={errors.email}
                  placeholder="email@kamu.com"
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Pengambilan
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => update("pickup", "ambil")}
                      aria-pressed={form.pickup === "ambil"}
                      className={cn(
                        "flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition",
                        form.pickup === "ambil"
                          ? "border-primary bg-primary text-white"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-primary",
                      )}
                    >
                      Ambil Sendiri
                    </button>
                    <button
                      type="button"
                      onClick={() => update("pickup", "kirim")}
                      aria-pressed={form.pickup === "kirim"}
                      className={cn(
                        "flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition",
                        form.pickup === "kirim"
                          ? "border-primary bg-primary text-white"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-primary",
                      )}
                    >
                      Dikirim
                    </button>
                  </div>
                </div>
                {form.pickup === "kirim" && (
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                      Alamat Lengkap
                    </label>
                    <textarea
                      id="address"
                      rows={2}
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className={cn(
                        "w-full rounded-xl border-2 px-4 py-2.5 text-sm outline-none transition focus:border-primary",
                        errors.address ? "border-red-400" : "border-[var(--color-border)]",
                      )}
                      placeholder="Jl. ..."
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Catatan (opsional)
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="w-full rounded-xl border-2 border-[var(--color-border)] px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    placeholder="Catatan untuk admin..."
                  />
                </div>
              </div>
            </fieldset>
          </div>

          <div className="lg:border-l-2 lg:border-[var(--color-border)] lg:pl-6">
            <div className="sticky top-24 space-y-4 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-soft)] p-5">
              <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                Ringkasan Pesanan
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Produk</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Ukuran</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{form.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Bahan</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{form.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Finishing</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{form.finishing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Jumlah</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{form.quantity} {product.unit}</span>
                </div>
                {pricing.breakdown && (
                  <p className="text-xs text-[var(--color-text-muted)]">{pricing.breakdown}</p>
                )}
                <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
                  <span className="font-bold text-[var(--color-text-primary)]">Estimasi Total</span>
                  <span className="font-display text-lg font-black text-accent">
                    {formatRupiah(pricing.total)}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[var(--color-text-muted)]">
                * Estimasi harga belum termasuk ongkir. Admin akan konfirmasi final.
              </div>

              {error && (
                <p className="text-sm font-semibold text-red-500">{error}</p>
              )}

              {isMidtransConfigured() ? (
                <button
                  type="button"
                  onClick={handleMidtrans}
                  disabled={submitting || !form.name || !form.phone}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  Bayar Sekarang
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWaOnly}
                  disabled={submitting || !form.name || !form.phone}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1ebe5d] disabled:opacity-50"
                >
                  <MessageCircle className="size-4" />
                  Order via WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            aria-pressed={selected === opt}
            className={cn(
              "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
              selected === opt
                ? "border-primary bg-primary text-white"
                : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={cn(
          "w-full rounded-xl border-2 px-4 py-2.5 text-sm outline-none transition focus:border-primary",
          error ? "border-red-400" : "border-[var(--color-border)]",
        )}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
