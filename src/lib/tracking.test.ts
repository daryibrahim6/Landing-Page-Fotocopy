import { describe, it, expect, vi, afterEach } from "vitest";
import { trackEvent, trackPurchase } from "./tracking";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("trackEvent", () => {
  it("is a no-op without window (SSR)", () => {
    expect(() => trackEvent("view_item")).not.toThrow();
  });

  it("calls gtag and fbq when available", () => {
    const gtag = vi.fn();
    const fbq = vi.fn();
    vi.stubGlobal("window", { gtag, fbq });
    trackEvent("add_to_cart", { value: 1000 });
    expect(gtag).toHaveBeenCalledWith("event", "add_to_cart", { value: 1000 });
    expect(fbq).toHaveBeenCalledWith("track", "add_to_cart", { value: 1000 });
  });

  it("does not throw when a tracker throws", () => {
    vi.stubGlobal("window", {
      gtag: () => {
        throw new Error("gtag down");
      },
    });
    expect(() => trackEvent("x")).not.toThrow();
  });
});

describe("trackPurchase", () => {
  it("sends purchase with transaction_id to gtag and Purchase to fbq", () => {
    const gtag = vi.fn();
    const fbq = vi.fn();
    vi.stubGlobal("window", { gtag, fbq });
    trackPurchase("BSP-1-ABC", 50000, "IDR", [{ id: "stiker", quantity: 2, price: 25000 }]);
    expect(gtag).toHaveBeenCalledWith("event", "purchase", {
      transaction_id: "BSP-1-ABC",
      value: 50000,
      currency: "IDR",
      items: [{ id: "stiker", quantity: 2, price: 25000 }],
    });
    expect(fbq).toHaveBeenCalledWith("track", "Purchase", {
      value: 50000,
      currency: "IDR",
      content_ids: ["stiker"],
      content_type: "product",
    });
  });
});
