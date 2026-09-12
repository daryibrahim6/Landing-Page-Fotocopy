import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { StoredOrder } from "@/lib/order-storage";

vi.hoisted(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

import { PATCH } from "./route";
import { saveOrder, getOrder } from "@/lib/order-storage";

const AUTH = `Basic ${btoa("admin:pw")}`;

function makeOrder(id: string): StoredOrder {
  return {
    id,
    productId: "stiker-a3",
    productName: "Stiker A3",
    specs: { ukuran: "A3" },
    customer: { name: "Budi", phone: "62812", email: "", pickup: "ambil" },
    pricing: { subtotal: 50000, total: 50000 },
    payment: { status: "pending", midtransOrderId: id },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function patch(id: string, body: unknown, authed = true) {
  return PATCH(
    new Request(`http://localhost/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authed ? { authorization: AUTH } : {}),
      },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

describe("PATCH /api/admin/orders/[id]", () => {
  beforeAll(() => {
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "pw";
  });
  afterAll(() => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
  });

  it("401 without credentials", async () => {
    const res = await patch("BSP-API-2", { productionStatus: "diproses" }, false);
    expect(res.status).toBe(401);
  });

  it("400 on invalid productionStatus", async () => {
    const res = await patch("BSP-API-2", { productionStatus: "paid" });
    expect(res.status).toBe(400);
  });

  it("404 for unknown order ids", async () => {
    const res = await patch("BSP-NOPE", { productionStatus: "diproses" });
    expect(res.status).toBe(404);
  });

  it("updates production status without touching payment.status", async () => {
    await saveOrder(makeOrder("BSP-API-2"));
    const res = await patch("BSP-API-2", { productionStatus: "diproses" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.order.production.status).toBe("diproses");
    const persisted = await getOrder("BSP-API-2");
    expect(persisted?.production?.status).toBe("diproses");
    expect(persisted?.payment.status).toBe("pending");
  });
});
