import { describe, it, expect, vi, afterEach } from "vitest";
import { notifyAdminNewOrder, notifyAdminPaidOrder, dispatchAdminNotification } from "./notification";
import type { StoredOrder } from "./order-storage";

const mockOrder: StoredOrder = {
  id: "BSP-TEST-123",
  productId: "test",
  productName: "Stiker Chromo",
  specs: { ukuran: "A4" },
  customer: {
    name: "Budi",
    phone: "081299435019",
    email: "budi@test.com",
    pickup: "ambil",
    notes: "Dicetak cepat",
  },
  pricing: { subtotal: 10000, total: 10000 },
  payment: { status: "pending", midtransOrderId: "BSP-TEST-123" },
  createdAt: "2026-09-08T00:00:00.000Z",
  updatedAt: "2026-09-08T00:00:00.000Z",
};

describe("notification", () => {
  it("builds new order admin notification URL", () => {
    const n = notifyAdminNewOrder(mockOrder);
    expect(n.channel).toBe("whatsapp");
    expect(n.label).toBe("Order Baru");
    expect(n.url).toContain("wa.me");
    expect(n.url).toContain(encodeURIComponent("BSP-TEST-123"));
    expect(n.message).toContain("BSP-TEST-123");
  });

  it("builds paid order admin notification URL", () => {
    const n = notifyAdminPaidOrder({ ...mockOrder, payment: { ...mockOrder.payment, status: "paid" } });
    expect(n.channel).toBe("whatsapp");
    expect(n.label).toBe("Pembayaran Berhasil");
    expect(n.url).toContain("wa.me");
    expect(n.url).toContain(encodeURIComponent("Pembayaran Berhasil"));
  });

  it("recipient resolves to a non-empty wa number", () => {
    const n = notifyAdminNewOrder(mockOrder);
    expect(n.recipient).toMatch(/^\d+$/);
    expect(n.url).toContain(`wa.me/${n.recipient}`);
  });
});

describe("dispatchAdminNotification", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("posts payload to ADMIN_NOTIFY_WEBHOOK_URL when set", async () => {
    vi.stubEnv("ADMIN_NOTIFY_WEBHOOK_URL", "https://hooks.example.com/notify");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await dispatchAdminNotification(() => notifyAdminNewOrder(mockOrder));

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hooks.example.com/notify");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.orderId).toBe("BSP-TEST-123");
    expect(body.channel).toBe("whatsapp");
  });

  it("skips webhook when env is unset", async () => {
    vi.stubEnv("ADMIN_NOTIFY_WEBHOOK_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "log").mockImplementation(() => {});

    await dispatchAdminNotification(() => notifyAdminNewOrder(mockOrder));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws when the builder throws", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      dispatchAdminNotification(() => {
        throw new Error("builder boom");
      }),
    ).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalled();
  });

  it("never throws when the webhook fetch fails", async () => {
    vi.stubEnv("ADMIN_NOTIFY_WEBHOOK_URL", "https://hooks.example.com/down");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      dispatchAdminNotification(() => notifyAdminNewOrder(mockOrder)),
    ).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalled();
  });
});
