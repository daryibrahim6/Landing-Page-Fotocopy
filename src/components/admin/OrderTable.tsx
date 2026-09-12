"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { PRODUCTION_STATUSES, type ProductionStatus } from "@/types";
import type { StoredOrder } from "@/lib/order-storage";

// Admin order table — server-rendered first page, client-side pagination and
// production-status mutations via /api/admin/orders. Basic Auth credentials are
// cached by the browser per-origin, so plain fetch() is already authenticated.

const PAYMENT_LABEL: Record<StoredOrder["payment"]["status"], string> = {
  pending: "Menunggu bayar",
  paid: "Lunas",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
};

const PRODUCTION_LABEL: Record<ProductionStatus, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function OrderTable({
  initialOrders,
  initialCursor,
}: {
  initialOrders: StoredOrder[];
  initialCursor: number | null;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (cursor === null || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders?cursor=${cursor}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { orders: StoredOrder[]; nextCursor: number | null };
      setOrders((prev) => [...prev, ...data.orders]);
      setCursor(data.nextCursor);
    } catch {
      setError("Gagal memuat order berikutnya.");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(orderId: string, productionStatus: ProductionStatus) {
    const prev = orders;
    setOrders((o) =>
      o.map((ord) =>
        ord.id === orderId
          ? { ...ord, production: { status: productionStatus, updatedAt: new Date().toISOString() } }
          : ord,
      ),
    );
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productionStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setOrders(prev); // rollback optimistic update
      setError("Gagal mengubah status produksi.");
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {orders.length === 0 ? (
        <p className="py-10 text-center text-gray-500">Belum ada order masuk.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const prod = o.production?.status ?? "baru";
            return (
              <li key={o.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {o.id}
                      <span className="ml-2 font-normal text-gray-500">{fmtDate(o.createdAt)}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {o.customer.name} · {o.customer.phone} ·{" "}
                      {o.customer.pickup === "kirim" ? "Kirim" : "Ambil"}
                      {o.customer.address ? ` — ${o.customer.address}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {o.productName} · {Object.entries(o.specs).map(([k, v]) => `${k}: ${v}`).join(", ")}
                    </p>
                    {o.customer.notes && (
                      <p className="mt-1 text-sm italic text-gray-500">Catatan: {o.customer.notes}</p>
                    )}
                    {o.fileUrl && (
                      <a
                        // blob: keys resolve through the admin signed-URL redirect;
                        // http(s) URLs (Vercel Blob) are opened directly.
                        href={
                          o.fileUrl.startsWith("blob:")
                            ? `/api/admin/files?key=${encodeURIComponent(o.fileUrl.slice(5))}`
                            : o.fileUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm text-blue-600 underline"
                      >
                        File desain
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-sm">
                    <span className="font-semibold text-gray-900">{formatRupiah(o.pricing.total)}</span>
                    <span
                      className={
                        o.payment.status === "paid"
                          ? "rounded bg-green-100 px-2 py-0.5 text-green-800"
                          : "rounded bg-amber-100 px-2 py-0.5 text-amber-800"
                      }
                    >
                      {PAYMENT_LABEL[o.payment.status]}
                    </span>
                    <label className="flex items-center gap-1 text-gray-600">
                      Produksi:
                      <select
                        value={prod}
                        onChange={(e) => setStatus(o.id, e.target.value as ProductionStatus)}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                      >
                        {PRODUCTION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {PRODUCTION_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {cursor !== null && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            {loading ? "Memuat…" : "Muat lebih banyak"}
          </button>
        </div>
      )}
    </div>
  );
}
