import { describe, it, expect, beforeAll, vi } from "vitest";

vi.hoisted(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

import { POST } from "./route";
import { getOrder } from "@/lib/order-storage";

const VALID_BODY = {
  productId: "brosur-flyer",
  size: "A4",
  material: "Art Paper 120gsm",
  finishing: "Glossy",
  quantity: 10,
  customerDetails: { name: "Budi", phone: "081299435019" },
};

function postJson(body: unknown) {
  return POST(
    new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/orders (WA-only checkout)", () => {
  beforeAll(() => {
    vi.unstubAllGlobals();
  });

  it("rejects invalid bodies with 400", async () => {
    expect((await postJson({})).status).toBe(400);
    expect((await postJson({ ...VALID_BODY, productId: "" })).status).toBe(400);
    expect(
      (await postJson({ ...VALID_BODY, customerDetails: { name: "", phone: "abc" } })).status,
    ).toBe(400);
  });

  it("rejects unknown product/spec options", async () => {
    expect((await postJson({ ...VALID_BODY, productId: "nope" })).status).toBe(400);
    expect((await postJson({ ...VALID_BODY, size: "A999" })).status).toBe(400);
  });

  it("stores the order with method whatsapp and returns a BSP orderId", async () => {
    const res = await postJson(VALID_BODY);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.orderId).toMatch(/^BSP-/);

    const order = await getOrder(data.orderId);
    expect(order).not.toBeNull();
    expect(order?.payment.method).toBe("whatsapp");
    expect(order?.payment.status).toBe("pending");
    expect(order?.payment.midtransOrderId).toBeUndefined();
    expect(order?.productName).toContain("Brosur");
    expect(order?.customer.phone).toBe("6281299435019");
  });

  it("drops data: fileUrl but keeps blob: references", async () => {
    const res = await postJson({ ...VALID_BODY, fileUrl: "data:image/png;base64,xxx" });
    const data = await res.json();
    const order = await getOrder(data.orderId);
    expect(order?.fileUrl).toBeUndefined();
  });
});
