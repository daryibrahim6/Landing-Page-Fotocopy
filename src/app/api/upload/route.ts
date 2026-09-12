import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { blob } from "@/lib/blob";

// Rate limit uploads per IP when Redis is configured (production).
// Local dev without UPSTASH_* falls through unlimited.
const ratelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") })
  : null;

export async function POST(request: Request) {
  try {
    if (ratelimit) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "anonymous";
      const { success } = await ratelimit.limit(`upload:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: "Too many uploads. Coba lagi dalam 1 menit." },
          { status: 429 },
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF, PNG, JPG, WEBP allowed." }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    // Upstash Blob private bucket — store the object key (admin reads via
    // /api/admin/files signed redirect). Data-URL fallback for local dev.
    if (blob) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `orders/${Date.now()}-${safeName}`;
      await blob.put(key, file, { contentType: file.type });
      return NextResponse.json({ url: `blob:${key}`, name: file.name, size: file.size });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return NextResponse.json({ url: dataUrl, name: file.name, size: file.size, note: "Local data URL. Set UPSTASH_BLOB_TOKEN for persistent storage." });
  } catch (error) {
    console.error("upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
