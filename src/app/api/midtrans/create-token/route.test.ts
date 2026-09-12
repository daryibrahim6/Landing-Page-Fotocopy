import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";

vi.hoisted(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

import { POST } from "./route";
import { getOrder } from "@/lib/order-storage";
import { calculatePrice } from "@/lib/pricing";

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
    new Request("http://localhost/api/midtrans/create-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/midtrans/create-token", () => {
  beforeAll(() => {
    delete process.env.MIDTRANS_SERVER_KEY; // simulation path
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.MIDTRANS_SERVER_KEY;
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
    expect((await postJson({ ...VALID_BODY, material: "Kertas Gaib" })).status).toBe(400);
  });

  it("rejects products with isCheckoutEnabled=false", async () => {
    const res = await postJson({
      ...VALID_BODY,
      productId: "poster", // isCheckoutEnabled: false in products.ts
      size: "A3",
      material: "Art Paper 120gsm",
      finishing: "Glossy",
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("WhatsApp");
  });

  it("computes the total server-side — client-sent amounts are ignored", async () => {
    const res = await postJson({ ...VALID_BODY, grossAmount: 1000, items: [{ price: 1 }] });
    expect(res.status).toBe(200);
    const { orderId, simulation } = await res.json();
    expect(simulation).toBe(true);

    const expected = calculatePrice("brosur-flyer", "A4", "Art Paper 120gsm", "Glossy", 10);
    const order = await getOrder(orderId);
    expect(order?.pricing.total).toBe(expected.total);
    expect(order?.pricing.total).not.toBe(1000);
  });

  it("stores normalized phone and fileUrl on the order", async () => {
    const res = await postJson({ ...VALID_BODY, fileUrl: "https://blob.example/file.pdf" });
    const { orderId } = await res.json();
    const order = await getOrder(orderId);
    expect(order?.customer.phone).toBe("6281299435019");
    expect(order?.fileUrl).toBe("https://blob.example/file.pdf");
  });

  it("drops non-http fileUrl values (local dev data: URLs)", async () => {
    const res = await postJson({ ...VALID_BODY, fileUrl: "data:image/png;base64,AAAA" });
    const { orderId } = await res.json();
    expect((await getOrder(orderId))?.fileUrl).toBeUndefined();
  });

  it("sends the server-computed gross_amount to Midtrans, never client input", async () => {
    process.env.MIDTRANS_SERVER_KEY = "test-key";
    const expected = calculatePrice("brosur-flyer", "A4", "Art Paper 120gsm", "Glossy", 10);

    const fetchMock = vi.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ token: "tok", redirect_url: "https://snap" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await postJson({ ...VALID_BODY, grossAmount: 1 });
    expect(res.status).toBe(200);

    const sentBody = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(sentBody.transaction_details.gross_amount).toBe(expected.total);
    expect(sentBody.item_details[0].price).toBe(Math.round(expected.total / 10));
  });
});
