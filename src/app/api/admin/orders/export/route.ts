import { isAdminRequest, adminUnauthorized } from "@/lib/admin-auth";
import { listOrders, type StoredOrder } from "@/lib/order-storage";

// GET /api/admin/orders/export — semua order sebagai CSV untuk rekap/Excel.
// Auth: Basic Auth (sama seperti route admin lain; browser mengirim credential
// yang sudah ter-cache saat admin buka link dari /admin/orders).
// ponytail: full table scan per request — fine at MVP order volume; kalau
// order sudah ribuan, tambahkan filter rentang tanggal (?from=&to=).
const COLUMNS = [
  "Order ID",
  "Tanggal",
  "Nama",
  "No. WA",
  "Email",
  "Pengambilan",
  "Alamat",
  "Produk",
  "Spesifikasi",
  "Total (Rp)",
  "Status Bayar",
  "Dibayar Pada",
  "Status Produksi",
  "File Desain",
  "Catatan",
] as const;

function csvCell(value: string | number | undefined): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function toRow(o: StoredOrder): (string | undefined)[] {
  return [
    o.id,
    o.createdAt,
    o.customer.name,
    o.customer.phone,
    o.customer.email,
    o.customer.pickup,
    o.customer.address,
    o.productName,
    Object.entries(o.specs)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; "),
    String(o.pricing.total),
    o.payment.status,
    o.payment.paidAt,
    o.production?.status ?? "baru",
    o.fileUrl,
    o.customer.notes,
  ];
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return adminUnauthorized();

  const orders: StoredOrder[] = [];
  let cursor = 0;
  for (;;) {
    const page = await listOrders(100, cursor);
    orders.push(...page.orders);
    if (page.nextCursor === null) break;
    cursor = page.nextCursor;
  }

  const lines = [COLUMNS.map(csvCell).join(",")];
  for (const o of orders) lines.push(toRow(o).map(csvCell).join(","));
  // BOM so Excel renders UTF-8 (Indonesian chars) correctly on open.
  const csv = "\uFEFF" + lines.join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bisaprint-orders-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
