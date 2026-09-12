import type { Metadata } from "next";
import { listOrders } from "@/lib/order-storage";
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Order Masuk</h1>
      <OrderTable initialOrders={orders} initialCursor={nextCursor} />
    </main>
  );
}
