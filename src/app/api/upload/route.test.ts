import { describe, it, expect, vi } from "vitest";

vi.hoisted(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.UPSTASH_BLOB_TOKEN;
});

import { POST } from "./route";

function postFile(file: File | null) {
  const fd = new FormData();
  if (file) fd.append("file", file);
  return POST(
    new Request("http://localhost/api/upload", { method: "POST", body: fd }),
  );
}

describe("POST /api/upload", () => {
  it("rejects requests without a file", async () => {
    expect((await postFile(null)).status).toBe(400);
  });

  it("rejects disallowed MIME types", async () => {
    const file = new File(["echo hi"], "run.sh", { type: "application/x-sh" });
    const res = await postFile(file);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid file type");
  });

  it("rejects files over 10MB", async () => {
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.png", { type: "image/png" });
    const res = await postFile(big);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("too large");
  });

  it("accepts a valid PNG and returns a local data URL without blob token", async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], "a.png", { type: "image/png" });
    const res = await postFile(file);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^data:image\/png;base64,/);
    expect(body.name).toBe("a.png");
  });
});
