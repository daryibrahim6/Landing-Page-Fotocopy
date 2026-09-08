import { describe, it, expect } from "vitest";
import { saveOrder, getOrder, getOrderByMidtransOrderId, updateOrderStatus, type StoredOrder } from "./order-storage";

const mockOrder: StoredOrder = {
  id: "BSP-TEST-123",
  productId: "stiker-chromo",
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

describe("order-storage", () => {
  it("saves and retrieves order", async () => {
    await saveOrder(mockOrder);
    const found = await getOrder("BSP-TEST-123");
    expect(found).not.toBeNull();
    expect(found?.customer.name).toBe("Budi");
  });

  it("finds order by midtrans order id", async () => {
    await saveOrder(mockOrder);
    const found = await getOrderByMidtransOrderId("BSP-TEST-123");
    expect(found).not.toBeNull();
    expect(found?.id).toBe("BSP-TEST-123");
  });

  it("updates order status", async () => {
    await saveOrder(mockOrder);
    const updated = await updateOrderStatus("BSP-TEST-123", "paid");
    expect(updated).not.toBeNull();
    expect(updated?.payment.status).toBe("paid");
    expect(updated?.payment.paidAt).toBeDefined();
  });

  it("returns null for unknown order", async () => {
    const found = await getOrder("UNKNOWN");
    expect(found).toBeNull();
  });
});
