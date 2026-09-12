import type { Metadata } from "next";
import { isPersistentStorage, listOrders } from "@/lib/order-storage";
import OrderTable from "@/components/admin/OrderTable";

export const metadata: Metadata = {
  title: "Admin — Order Masuk | BisaPrint",
  robots: { index: false, follow: false },
};

// Always read fresh — order list changes on every checkout/webhook.
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { orders, nextCursor } = await listOrders(20, 0);
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Order Masuk</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not SPA navigation */}
        <a
          href="/api/admin/orders/export"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Export CSV
        </a>
      </div>
      {!isPersistentStorage() && (
        <p role="alert" className="mb-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Mode in-memory — order tidak persisten. Isi UPSTASH_REDIS_REST_URL/TOKEN untuk production.
        </p>
      )}
      <OrderTable initialOrders={orders} initialCursor={nextCursor} />
    </main>
  );
}
