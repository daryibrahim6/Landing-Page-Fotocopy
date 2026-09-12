import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";
import type { StoredOrder } from "@/lib/order-storage";

// Force the in-memory order store regardless of local env — vi.hoisted runs
// before module imports so redis.ts sees unset env vars.
vi.hoisted(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

vi.mock("@/lib/notification", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/notification")>();
  return { ...mod, logNotification: vi.fn() };
});

import { POST } from "./route";
import { logNotification } from "@/lib/notification";
import { saveOrder, getOrderByMidtransOrderId } from "@/lib/order-storage";

const SERVER_KEY = "test-server-key";

function makeOrder(midtransOrderId: string, total = 50000): StoredOrder {
  return {
    id: midtransOrderId,
    productId: "stiker-a3",
    productName: "Stiker A3",
    specs: { ukuran: "A3" },
    customer: { name: "Budi", phone: "6281299435019", email: "", pickup: "ambil" },
    pricing: { subtotal: total, total },
    payment: { status: "pending", midtransOrderId },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function signedPayload(
  orderId: string,
  transactionStatus: string,
  opts: { statusCode?: string; grossAmount?: string; fraudStatus?: string } = {},
) {
  const statusCode = opts.statusCode ?? "200";
  const grossAmount = opts.grossAmount ?? "50000.00";
  const signature = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${SERVER_KEY}`)
    .digest("hex");
  return {
    order_id: orderId,
    transaction_status: transactionStatus,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signature,
    ...(opts.fraudStatus ? { fraud_status: opts.fraudStatus } : {}),
  };
}

function postJson(body: unknown) {
  return POST(
    new Request("http://localhost/api/midtrans/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/midtrans/webhook", () => {
  beforeAll(() => {
    process.env.MIDTRANS_SERVER_KEY = SERVER_KEY;
  });
  beforeEach(() => {
    process.env.MIDTRANS_SERVER_KEY = SERVER_KEY;
  });
  afterEach(() => {
    process.env.MIDTRANS_SERVER_KEY = SERVER_KEY;
  });

  it("marks a valid settlement notification as paid", async () => {
    await saveOrder(makeOrder("BSP-W1-AAA"));
    const res = await postJson(signedPayload("BSP-W1-AAA", "settlement"));
    expect(res.status).toBe(200);
    const order = await getOrderByMidtransOrderId("BSP-W1-AAA");
    expect(order?.payment.status).toBe("paid");
    expect(order?.payment.paidAt).toBeTruthy();
  });

  it("rejects invalid signatures with 403", async () => {
    await saveOrder(makeOrder("BSP-W2-BBB"));
    const body = { ...signedPayload("BSP-W2-BBB", "settlement"), signature_key: "forged" };
    const res = await postJson(body);
    expect(res.status).toBe(403);
    expect((await getOrderByMidtransOrderId("BSP-W2-BBB"))?.payment.status).toBe("pending");
  });

  it("fails closed when MIDTRANS_SERVER_KEY is missing", async () => {
    delete process.env.MIDTRANS_SERVER_KEY;
    const res = await postJson(signedPayload("BSP-W3-CCC", "settlement"));
    expect(res.status).toBe(500);
  });

  it("does not mark capture with fraud_status=challenge as paid", async () => {
    await saveOrder(makeOrder("BSP-W4-DDD"));
    const res = await postJson(
      signedPayload("BSP-W4-DDD", "capture", { fraudStatus: "challenge" }),
    );
    expect(res.status).toBe(200);
    expect((await getOrderByMidtransOrderId("BSP-W4-DDD"))?.payment.status).toBe("pending");
  });

  it("flags a discrepancy instead of marking paid on amount mismatch", async () => {
    await saveOrder(makeOrder("BSP-W5-EEE", 50000));
    const res = await postJson(signedPayload("BSP-W5-EEE", "settlement", { grossAmount: "1000.00" }));
    expect(res.status).toBe(200);
    const order = await getOrderByMidtransOrderId("BSP-W5-EEE");
    expect(order?.payment.status).toBe("pending");
    expect(order?.payment.discrepancy).toContain("1000.00");
  });

  it("ignores unknown transaction statuses without mutating the order", async () => {
    await saveOrder(makeOrder("BSP-W6-FFF"));
    const res = await postJson(signedPayload("BSP-W6-FFF", "refund"));
    expect(res.status).toBe(200);
    expect((await res.json()).ignored).toBe(true);
    expect((await getOrderByMidtransOrderId("BSP-W6-FFF"))?.payment.status).toBe("pending");
  });

  it("a late expire cannot regress a paid order", async () => {
    await saveOrder(makeOrder("BSP-W7-GGG"));
    await postJson(signedPayload("BSP-W7-GGG", "settlement"));
    await postJson(signedPayload("BSP-W7-GGG", "expire"));
    expect((await getOrderByMidtransOrderId("BSP-W7-GGG"))?.payment.status).toBe("paid");
  });

  it("does not re-notify admin when a webhook carries the same status twice", async () => {
    vi.mocked(logNotification).mockClear();
    await saveOrder(makeOrder("BSP-W8-HHH"));
    await postJson(signedPayload("BSP-W8-HHH", "settlement"));
    await postJson(signedPayload("BSP-W8-HHH", "settlement"));
    expect(vi.mocked(logNotification).mock.calls.length).toBe(1);
  });

  it("does not notify when a regression is blocked", async () => {
    vi.mocked(logNotification).mockClear();
    await saveOrder(makeOrder("BSP-W9-III"));
    await postJson(signedPayload("BSP-W9-III", "settlement"));
    await postJson(signedPayload("BSP-W9-III", "expire"));
    // settlement notifies once; the blocked expire must not fire another notification
    expect(vi.mocked(logNotification).mock.calls.length).toBe(1);
  });

  it("does not send a 'new order' notification for expire transitions", async () => {
    vi.mocked(logNotification).mockClear();
    await saveOrder(makeOrder("BSP-W10-JJJ"));
    const res = await postJson(signedPayload("BSP-W10-JJJ", "expire"));
    expect(res.status).toBe(200);
    expect((await getOrderByMidtransOrderId("BSP-W10-JJJ"))?.payment.status).toBe("expired");
    // expire is logged server-side, but admin gets no notification (new-order
    // was already sent at create-token; there is no expire template)
    expect(vi.mocked(logNotification).mock.calls.length).toBe(0);
  });
});
