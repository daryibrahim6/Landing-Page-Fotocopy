import { describe, it, expect } from "vitest";
import {
  saveOrder,
  getOrder,
  getOrderByMidtransOrderId,
  updateOrderStatus,
  type StoredOrder,
} from "./order-storage";

// Runs against the in-memory fallback (UPSTASH_REDIS_* not set in test env).

function makeOrder(id: string, midtransId = id): StoredOrder {
  return {
    id,
    productId: "stiker-a3",
    productName: "Stiker A3",
    specs: { ukuran: "A3" },
    customer: { name: "Budi", phone: "6281299435019", email: "", pickup: "ambil" },
    pricing: { subtotal: 50000, total: 50000 },
    payment: { status: "pending", midtransOrderId: midtransId },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("order-storage (in-memory fallback)", () => {
  it("saves and retrieves an order by id", async () => {
    const order = makeOrder("BSP-T1-AAA");
    await saveOrder(order);
    expect(await getOrder("BSP-T1-AAA")).toMatchObject({ id: "BSP-T1-AAA" });
  });

  it("resolves an order by its Midtrans order id", async () => {
    const order = makeOrder("BSP-T2-BBB");
    await saveOrder(order);
    expect(await getOrderByMidtransOrderId("BSP-T2-BBB")).toMatchObject({ id: "BSP-T2-BBB" });
  });

  it("returns null for unknown ids", async () => {
    expect(await getOrder("BSP-NOPE")).toBeNull();
    expect(await getOrderByMidtransOrderId("BSP-NOPE")).toBeNull();
  });
});

describe("updateOrderStatus — monotonic guard", () => {
  it("transitions pending → paid", async () => {
    await saveOrder(makeOrder("BSP-M1-AAA"));
    const updated = await updateOrderStatus("BSP-M1-AAA", "paid");
    expect(updated?.payment.status).toBe("paid");
    expect(updated?.payment.paidAt).toBeTruthy();
  });

  it("blocks a late expire from regressing a paid order", async () => {
    await saveOrder(makeOrder("BSP-M2-BBB"));
    await updateOrderStatus("BSP-M2-BBB", "paid");
    const regressed = await updateOrderStatus("BSP-M2-BBB", "expired");
    expect(regressed?.payment.status).toBe("paid");
    expect(await getOrder("BSP-M2-BBB")).toMatchObject({ payment: { status: "paid" } });
  });

  it("blocks cancelled → paid regression", async () => {
    await saveOrder(makeOrder("BSP-M3-CCC"));
    await updateOrderStatus("BSP-M3-CCC", "cancelled");
    const regressed = await updateOrderStatus("BSP-M3-CCC", "paid");
    expect(regressed?.payment.status).toBe("cancelled");
  });

  it("same-status writes are idempotent no-ops", async () => {
    await saveOrder(makeOrder("BSP-M4-DDD"));
    const first = await updateOrderStatus("BSP-M4-DDD", "paid");
    const second = await updateOrderStatus("BSP-M4-DDD", "paid");
    expect(second?.payment.status).toBe("paid");
    expect(second?.payment.paidAt).toBe(first?.payment.paidAt);
  });

  it("returns null for unknown midtrans order ids", async () => {
    expect(await updateOrderStatus("BSP-MISSING", "paid")).toBeNull();
  });
});
