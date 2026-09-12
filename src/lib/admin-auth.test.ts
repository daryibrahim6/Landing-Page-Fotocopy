import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isAdminRequest, adminUnauthorized } from "./admin-auth";

const USER = "admin";
const PASS = "s3cret";

function req(authHeader?: string) {
  return new Request("http://localhost/admin/orders", {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

function basic(u: string, p: string) {
  return `Basic ${btoa(`${u}:${p}`)}`;
}

describe("isAdminRequest", () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = USER;
    process.env.ADMIN_PASSWORD = PASS;
  });
  afterEach(() => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
  });

  it("accepts valid Basic credentials", () => {
    expect(isAdminRequest(req(basic(USER, PASS)))).toBe(true);
  });

  it("rejects wrong password", () => {
    expect(isAdminRequest(req(basic(USER, "wrong")))).toBe(false);
  });

  it("rejects wrong username", () => {
    expect(isAdminRequest(req(basic("root", PASS)))).toBe(false);
  });

  it("rejects a missing Authorization header", () => {
    expect(isAdminRequest(req())).toBe(false);
  });

  it("rejects non-Basic schemes", () => {
    expect(isAdminRequest(req(`Bearer ${btoa(`${USER}:${PASS}`)}`))).toBe(false);
  });

  it("rejects malformed base64", () => {
    expect(isAdminRequest(req("Basic !!!not-base64!!!"))).toBe(false);
  });

  it("rejects base64 without a colon separator", () => {
    expect(isAdminRequest(req(`Basic ${btoa("nocolon")}`))).toBe(false);
  });

  it("fails closed when env vars are unset", () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    expect(isAdminRequest(req(basic(USER, PASS)))).toBe(false);
  });
});

describe("adminUnauthorized", () => {
  it("returns 401 with a WWW-Authenticate challenge", () => {
    const res = adminUnauthorized();
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toContain("Basic realm=");
  });
});
