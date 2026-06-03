"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, CreditCard, MessageCircle, Check } from "lucide-react";
import { products } from "@/data/products";
import { cn, formatRupiah } from "@/lib/utils";
import { buildWAUrl } from "@/lib/wa";
import { isMidtransConfigured } from "@/lib/midtrans";
import { trackPurchase, trackEvent } from "@/lib/tracking";

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

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setError("");
    },
    [],
  );

  const total = useMemo(() => {
    if (!product) return 0;
    return product.priceFrom * form.quantity;
  }, [product, form.quantity]);

  const handleMidtrans = useCallback(async () => {
    if (!product) return;
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
              name: `${product.name} (${form.size} - ${form.material})`,
              price: product.priceFrom,
              quantity: form.quantity,
            },
          ],
          customerDetails: {
            name: form.name,
            phone: form.phone,
            email: form.email || `${form.phone}@user.bisaprint.com`,
          },
          grossAmount: total,
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

      if (data.token && window.snap) {
        window.snap.pay(data.token, {
          onSuccess: () => {
            trackPurchase(data.orderId, total, "IDR", [{ id: product.id, quantity: form.quantity, price: product.priceFrom }]);
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
  }, [product, form, total, router]);

  const handleWaOnly = useCallback(() => {
    if (!product) return;
    trackEvent("Lead", { source: "checkout-wa", product: product.id });
    const msg = `Halo Admin Bisa Print, saya mau order.\nProduk: ${product.name}\nUkuran: ${form.size}\nBahan: ${form.material}\nFinishing: ${form.finishing}\nJumlah: ${form.quantity}\nNama: ${form.name}\nNo. WA: ${form.phone}\nCatatan: ${form.notes}`;
    window.open(buildWAUrl("general").split("?text=")[0] + "?text=" + encodeURIComponent(msg), "_blank");
    setSubmitted(true);
  }, [product, form]);

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
        <a
          href="/#produk"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" />
          Lihat Produk
        </a>
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
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <a
        href="/#produk"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Produk
      </a>

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
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Ukuran
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update("size", s)}
                        aria-pressed={form.size === s}
                        className={cn(
                          "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                          form.size === s
                            ? "border-primary bg-primary text-white"
                            : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Bahan
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => update("material", m)}
                        aria-pressed={form.material === m}
                        className={cn(
                          "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                          form.material === m
                            ? "border-primary bg-primary text-white"
                            : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Finishing
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.finishings.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => update("finishing", f)}
                        aria-pressed={form.finishing === f}
                        className={cn(
                          "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                          form.finishing === f
                            ? "border-primary bg-primary text-white"
                            : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-primary",
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
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
                    className="w-32 rounded-xl border-2 border-[var(--color-border)] px-4 py-2 text-sm font-semibold outline-none transition focus:border-primary"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 font-display text-base font-bold text-[var(--color-text-primary)]">
                Data Pemesan
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full rounded-xl border-2 border-[var(--color-border)] px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    placeholder="Nama kamu"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    No. WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full rounded-xl border-2 border-[var(--color-border)] px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    placeholder="0812xxxxxxx"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Email (opsional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full rounded-xl border-2 border-[var(--color-border)] px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    placeholder="email@kamu.com"
                  />
                </div>
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
                      className="w-full rounded-xl border-2 border-[var(--color-border)] px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                      placeholder="Jl. ..."
                    />
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
                  <span className="text-[var(--color-text-secondary)]">Jumlah</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{form.quantity} {product.unit}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
                  <span className="font-bold text-[var(--color-text-primary)]">Estimasi Total</span>
                  <span className="font-display text-lg font-black text-accent">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[var(--color-text-muted)]">
                * Estimasi harga belum termasuk ongkir
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
