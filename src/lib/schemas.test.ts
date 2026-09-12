import { describe, it, expect } from "vitest";
import { createTokenBodySchema, midtransWebhookBodySchema, orderIdSchema } from "./schemas";

const validTokenBody = {
  items: [{ id: "stiker-a3", price: 5000, quantity: 10, name: "Stiker A3" }],
  customerDetails: { name: "Budi", phone: "081299435019" },
  grossAmount: 50000,
};

describe("createTokenBodySchema", () => {
  it("accepts a valid checkout body", () => {
    expect(createTokenBodySchema.safeParse(validTokenBody).success).toBe(true);
  });

  it("rejects empty items", () => {
    expect(createTokenBodySchema.safeParse({ ...validTokenBody, items: [] }).success).toBe(false);
  });

  it("rejects missing customer name", () => {
    const body = { ...validTokenBody, customerDetails: { name: "", phone: "0812" } };
    expect(createTokenBodySchema.safeParse(body).success).toBe(false);
  });

  it("rejects non-positive grossAmount", () => {
    expect(createTokenBodySchema.safeParse({ ...validTokenBody, grossAmount: 0 }).success).toBe(false);
    expect(createTokenBodySchema.safeParse({ ...validTokenBody, grossAmount: -5 }).success).toBe(false);
  });

  it("rejects invalid pickup enum", () => {
    const body = { ...validTokenBody, customerExtra: { pickup: "ojol" } };
    expect(createTokenBodySchema.safeParse(body).success).toBe(false);
  });
});

describe("midtransWebhookBodySchema", () => {
  const validWebhook = {
    order_id: "BSP-1-ABC",
    transaction_status: "settlement",
    status_code: "200",
    gross_amount: "50000.00",
    signature_key: "abc",
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
