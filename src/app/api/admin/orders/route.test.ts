import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { StoredOrder } from "@/lib/order-storage";

// Force the in-memory order store regardless of local env.
vi.hoisted(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

import { GET } from "./route";
import { saveOrder } from "@/lib/order-storage";

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

function get(url: string, authed = true) {
  return GET(
    new Request(url, { headers: authed ? { authorization: AUTH } : {} }),
  );
}

describe("GET /api/admin/orders", () => {
  beforeAll(() => {
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "pw";
  });
  afterAll(() => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
  });

  it("401 without credentials (defense in depth, not just proxy)", async () => {
    const res = await get("http://localhost/api/admin/orders", false);
    expect(res.status).toBe(401);
  });

  it("returns orders + nextCursor for authed requests", async () => {
    await saveOrder(makeOrder("BSP-API-1"));
    const res = await get("http://localhost/api/admin/orders?limit=50");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.orders)).toBe(true);
    expect(body.orders.some((o: StoredOrder) => o.id === "BSP-API-1")).toBe(true);
  });

  it("rejects invalid query params", async () => {
    const res = await get("http://localhost/api/admin/orders?limit=abc");
    expect(res.status).toBe(400);
  });
});
