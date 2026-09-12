import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

// Mock the shared blob client — signedReadUrl must not hit the network.
const signedReadUrl = vi.hoisted(() =>
  vi.fn(async (key: string) => ({
    url: `https://signed.example/${key}`,
    expiresAt: new Date(Date.now() + 60_000),
  })),
);
vi.mock("@/lib/blob", () => ({ blob: { signedReadUrl } }));

import { GET } from "./route";

const AUTH = `Basic ${btoa("admin:pw")}`;

function get(key: string | null, authed = true) {
  const url = key === null
    ? "http://localhost/api/admin/files"
    : `http://localhost/api/admin/files?key=${encodeURIComponent(key)}`;
  return GET(new Request(url, { headers: authed ? { authorization: AUTH } : {} }));
}

describe("GET /api/admin/files", () => {
  beforeAll(() => {
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "pw";
  });
  afterAll(() => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
  });

  it("401 without credentials", async () => {
    expect((await get("orders/x.png", false)).status).toBe(401);
  });

  it("400 for missing or out-of-scope keys", async () => {
    expect((await get(null)).status).toBe(400);
    expect((await get("../secret.txt")).status).toBe(400);
    expect((await get("other-prefix/x.png")).status).toBe(400);
  });

  it("redirects to a signed URL for a valid orders/ key", async () => {
    const res = await get("orders/123-file.png");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://signed.example/orders/123-file.png");
  });

  it("404 when the object cannot be signed (missing/deleted)", async () => {
    signedReadUrl.mockRejectedValueOnce(new Error("no such key"));
    expect((await get("orders/gone.png")).status).toBe(404);
  });
});
