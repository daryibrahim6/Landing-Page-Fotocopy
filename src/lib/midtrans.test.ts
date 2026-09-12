import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getMidtransBaseUrl,
  isMidtransConfigured,
  generateOrderId,
} from "./midtrans";

describe("getMidtransBaseUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns sandbox URL by default", () => {
    delete process.env.MIDTRANS_IS_PRODUCTION;
    expect(getMidtransBaseUrl()).toBe("https://api.sandbox.midtrans.com");
  });

  it("returns production URL when MIDTRANS_IS_PRODUCTION is true", () => {
    process.env.MIDTRANS_IS_PRODUCTION = "true";
    expect(getMidtransBaseUrl()).toBe("https://api.midtrans.com");
  });
});

describe("isMidtransConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns false when keys are missing", () => {
    delete process.env.MIDTRANS_SERVER_KEY;
    delete process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    expect(isMidtransConfigured()).toBe(false);
  });

  it("returns true when both keys are present", () => {
    process.env.MIDTRANS_SERVER_KEY = "server-key";
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY = "client-key";
    expect(isMidtransConfigured()).toBe(true);
  });

  it("returns true with only the client key (server key is server-only)", () => {
    delete process.env.MIDTRANS_SERVER_KEY;
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY = "client-key";
    expect(isMidtransConfigured()).toBe(true);
  });
});

describe("generateOrderId", () => {
  it("generates a BSP order id", () => {
    const orderId = generateOrderId();
    expect(orderId).toMatch(/^BSP-[A-Z0-9-]+$/);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateOrderId()));
    expect(ids.size).toBe(100);
  });
});
