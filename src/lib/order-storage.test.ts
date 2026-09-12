import { describe, it, expect, vi } from "vitest";
import {
  saveOrder,
  getOrder,
  getOrderByMidtransOrderId,
  updateOrderStatus,
  updateProductionStatus,
  listOrders,
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

describe("listOrders — newest-first pagination", () => {
  it("returns orders newest-first", async () => {
    const old = makeOrder("BSP-L1-OLD");
    old.createdAt = "2024-01-01T00:00:00.000Z";
    const newer = makeOrder("BSP-L1-NEW");
    newer.createdAt = "2024-06-01T00:00:00.000Z";
    await saveOrder(old);
    await saveOrder(newer);
    const { orders } = await listOrders(50, 0);
    const idxOld = orders.findIndex((o) => o.id === "BSP-L1-OLD");
    const idxNew = orders.findIndex((o) => o.id === "BSP-L1-NEW");
    expect(idxNew).toBeGreaterThanOrEqual(0);
    expect(idxNew).toBeLessThan(idxOld);
  });

  it("paginates via cursor with no overlap between pages", async () => {
    // Future dates guarantee these are the newest 3 regardless of earlier tests.
    for (let i = 0; i < 3; i++) {
      const o = makeOrder(`BSP-L2-${String(i).padStart(3, "0")}`);
      o.createdAt = `2099-03-0${i + 1}T00:00:00.000Z`;
      await saveOrder(o);
    }
    const page1 = await listOrders(2, 0);
    expect(page1.orders.map((o) => o.id)).toEqual(["BSP-L2-002", "BSP-L2-001"]);
    expect(page1.nextCursor).toBe(2);
    const page2 = await listOrders(2, page1.nextCursor!);
    expect(page2.orders[0]?.id).toBe("BSP-L2-000");
    const ids1 = new Set(page1.orders.map((o) => o.id));
    expect(page2.orders.every((o) => !ids1.has(o.id))).toBe(true); // no overlap
  });

  it("clamps limit to [1, 100]", async () => {
    await saveOrder(makeOrder("BSP-L3-AAA"));
    const huge = await listOrders(9999, 0);
    expect(huge.orders.length).toBeLessThanOrEqual(100);
    const zero = await listOrders(0, 0);
    expect(zero.orders.length).toBeLessThanOrEqual(1);
  });

  it("clamps a negative cursor to 0 (no crash, first page)", async () => {
    const o = makeOrder("BSP-L4-NEG");
    o.createdAt = "2099-12-31T00:00:00.000Z"; // newest in the shared store
    await saveOrder(o);
    const res = await listOrders(5, -10);
    expect(res.orders[0]?.id).toBe("BSP-L4-NEG");
  });

  it("exhausts: nextCursor is null past the end", async () => {
    const res = await listOrders(1, 1_000_000);
    expect(res.orders).toHaveLength(0);
    expect(res.nextCursor).toBeNull();
  });
});

describe("saveOrder — production guard", () => {
  it("refuses writes when Redis is unconfigured in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      await expect(saveOrder(makeOrder("BSP-PROD-1"))).rejects.toThrow(/UPSTASH/);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("still writes to memory store outside production", async () => {
    await saveOrder(makeOrder("BSP-DEV-1"));
    expect(await getOrder("BSP-DEV-1")).toMatchObject({ id: "BSP-DEV-1" });
  });
});

describe("updateProductionStatus", () => {
  it("sets production.status without touching payment.status", async () => {
    const o = makeOrder("BSP-P1-AAA");
    await saveOrder(o);
    await updateOrderStatus("BSP-P1-AAA", "paid");
    const updated = await updateProductionStatus("BSP-P1-AAA", "diproses");
    expect(updated?.production?.status).toBe("diproses");
    expect(updated?.payment.status).toBe("paid"); // state machine untouched
    const persisted = await getOrder("BSP-P1-AAA");
    expect(persisted?.production?.status).toBe("diproses");
  });

  it("stamps production.updatedAt on every write", async () => {
    await saveOrder(makeOrder("BSP-P2-BBB"));
    const updated = await updateProductionStatus("BSP-P2-BBB", "baru");
    expect(updated?.production?.updatedAt).toBeTruthy();
  });

  it("returns null for unknown order ids", async () => {
    expect(await updateProductionStatus("BSP-NOPE", "selesai")).toBeNull();
  });
});
