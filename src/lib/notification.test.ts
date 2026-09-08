import { describe, it, expect } from "vitest";
import { notifyAdminNewOrder, notifyAdminPaidOrder } from "./notification";
import type { StoredOrder } from "./order-storage";

const mockOrder: StoredOrder = {
  id: "BSP-TEST-123",
  productId: "test",
  productName: "Stiker Chromo",
  specs: { ukuran: "A4" },
  customer: {
    name: "Budi",
    phone: "081299435019",
    email: "budi@test.com",
    pickup: "ambil",
    notes: "Dicetak cepat",
  },
  pricing: { subtotal: 10000, total: 10000 },
  payment: { status: "pending", midtransOrderId: "BSP-TEST-123" },
  createdAt: "2026-09-08T00:00:00.000Z",
  updatedAt: "2026-09-08T00:00:00.000Z",
};

describe("notification", () => {
  it("builds new order admin notification URL", () => {
    const n = notifyAdminNewOrder(mockOrder);
    expect(n.channel).toBe("whatsapp");
    expect(n.label).toBe("Order Baru");
    expect(n.url).toContain("wa.me");
    expect(n.url).toContain(encodeURIComponent("BSP-TEST-123"));
    expect(n.message).toContain("BSP-TEST-123");
  });

  it("builds paid order admin notification URL", () => {
    const n = notifyAdminPaidOrder({ ...mockOrder, payment: { ...mockOrder.payment, status: "paid" } });
    expect(n.channel).toBe("whatsapp");
    expect(n.label).toBe("Pembayaran Berhasil");
    expect(n.url).toContain("wa.me");
    expect(n.url).toContain(encodeURIComponent("Pembayaran Berhasil"));
  });
});
