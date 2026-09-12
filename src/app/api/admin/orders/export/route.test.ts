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

function makeOrder(id: string, name = "Budi"): StoredOrder {
  return {
    id,
    productId: "stiker-a3",
    productName: "Stiker A3",
    specs: { ukuran: "A3" },
    customer: { name, phone: "62812", email: "", pickup: "ambil" },
    pricing: { subtotal: 50000, total: 50000 },
    payment: { status: "paid", midtransOrderId: id },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function get(authed = true) {
  return GET(
    new Request("http://localhost/api/admin/orders/export", {
      headers: authed ? { authorization: AUTH } : {},
    }),
  );
}

describe("GET /api/admin/orders/export", () => {
  beforeAll(() => {
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "pw";
  });
  afterAll(() => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
  });

  it("401 without credentials", async () => {
    const res = await get(false);
    expect(res.status).toBe(401);
  });

  it("returns a CSV attachment with header and order rows", async () => {
    await saveOrder(makeOrder("BSP-CSV-1"));
    const res = await get();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toContain("bisaprint-orders-");
    const body = await res.text();
    expect(body).toContain('"Order ID"');
    expect(body).toContain('"BSP-CSV-1"');
  });

  it("escapes quotes and commas in customer data", async () => {
    await saveOrder(makeOrder("BSP-CSV-2", 'Budi, "Jr"'));
    const body = await (await get()).text();
    expect(body).toContain('"Budi, ""Jr"""');
  });
});
