import { describe, it, expect } from "vitest";
import { createTokenBodySchema, midtransWebhookBodySchema, orderIdSchema, phoneSchema } from "./schemas";

const validTokenBody = {
  productId: "stiker-a3",
  size: "A3",
  material: "Vinyl Glossy",
  finishing: "Tanpa Cutting",
  quantity: 10,
  customerDetails: { name: "Budi", phone: "081299435019" },
};

describe("createTokenBodySchema", () => {
  it("accepts a valid checkout body", () => {
    expect(createTokenBodySchema.safeParse(validTokenBody).success).toBe(true);
  });

  it("normalizes phone to 62-prefix", () => {
    const parsed = createTokenBodySchema.safeParse(validTokenBody);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.customerDetails.phone).toBe("6281299435019");
    }
  });

  it("does not accept client-supplied price fields", () => {
    const body = { ...validTokenBody, grossAmount: 1000, items: [{ price: 1 }] };
    const parsed = createTokenBodySchema.safeParse(body);
    // Extra keys are stripped — no trusted amount ever comes from the client.
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("grossAmount" in parsed.data).toBe(false);
      expect("items" in parsed.data).toBe(false);
    }
  });

  it("rejects missing customer name", () => {
    const body = { ...validTokenBody, customerDetails: { name: "", phone: "0812" } };
    expect(createTokenBodySchema.safeParse(body).success).toBe(false);
  });

  it("rejects invalid phone", () => {
    const body = { ...validTokenBody, customerDetails: { name: "Budi", phone: "abc" } };
    expect(createTokenBodySchema.safeParse(body).success).toBe(false);
  });

  it("rejects non-positive or absurd quantity", () => {
    expect(createTokenBodySchema.safeParse({ ...validTokenBody, quantity: 0 }).success).toBe(false);
    expect(createTokenBodySchema.safeParse({ ...validTokenBody, quantity: 99999 }).success).toBe(false);
  });

  it("rejects invalid pickup enum", () => {
    const body = { ...validTokenBody, customerExtra: { pickup: "ojol" } };
    expect(createTokenBodySchema.safeParse(body).success).toBe(false);
  });
});

describe("phoneSchema", () => {
  it("normalizes local formats to international", () => {
    expect(phoneSchema.parse("081299435019")).toBe("6281299435019");
    expect(phoneSchema.parse("81299435019")).toBe("6281299435019");
    expect(phoneSchema.parse("6281299435019")).toBe("6281299435019");
  });
});

describe("midtransWebhookBodySchema", () => {
  const validWebhook = {
    order_id: "BSP-1-ABC",
    transaction_status: "settlement",
    status_code: "200",
    gross_amount: "50000.00",
    signature_key: "abc",
    fraud_status: "accept",
  };

  it("accepts a valid Midtrans notification", () => {
    expect(midtransWebhookBodySchema.safeParse(validWebhook).success).toBe(true);
  });

  it("rejects when required Midtrans fields are missing", () => {
    const rest = { ...validWebhook } as Record<string, unknown>;
    delete rest.transaction_status;
    expect(midtransWebhookBodySchema.safeParse(rest).success).toBe(false);
  });
});

describe("orderIdSchema", () => {
  it("accepts BSP-format order ids", () => {
    expect(orderIdSchema.safeParse("BSP-1700000000-X7K2").success).toBe(true);
  });

  it("rejects malformed ids", () => {
    for (const bad of ["", "random", "BSP", "DROP TABLE", "../../etc"]) {
      expect(orderIdSchema.safeParse(bad).success).toBe(false);
    }
  });
});
