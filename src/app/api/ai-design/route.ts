import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { redis } from "@/lib/redis";

// Draft AI designer untuk simulator. Provider chain (yang pertama berhasil menang):
// - OPENAI_API_KEY terisi → OpenAI Images API (gpt-image-1, berbayar per image,
//   kualitas/konsistensi terbaik — request dari client yang mau ChatGPT).
// - GEMINI_API_KEY terisi → Gemini image generation (free tier AI Studio —
//   client cukup bikin key gratis di aistudio.google.com, tanpa kartu).
// - Keduanya kosong → fallback Pollinations anonymous tier (gratis, tanpa key, bisa antre).
// Semua provider optional — app tidak pernah bergantung ke satu vendor.
// Prompt template di server (bukan client) supaya style die-cut konsisten.
const ratelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") })
  : null;

const schema = z.object({
  prompt: z.string().trim().min(3).max(300),
});

const STICKER_PREFIX =
  "die-cut sticker design, ";
const STICKER_SUFFIX =
  ", bold flat vector illustration style, clean sharp edges, centered on plain white background";

export async function POST(request: Request) {
  try {
    if (ratelimit) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "anonymous";
      const { success } = await ratelimit.limit(`ai-design:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: "Terlalu banyak request. Coba lagi dalam 1 menit." },
          { status: 429 },
        );
      }
    }

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Prompt tidak valid (3–300 karakter)." },
        { status: 400 },
      );
    }

    const stickerPrompt = `${STICKER_PREFIX}${parsed.data.prompt}${STICKER_SUFFIX}`;

    // OpenAI path — hanya jalan kalau key dikonfigurasi.
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
          prompt: stickerPrompt,
          size: "1024x1024",
          quality: "low", // draft/referensi — tier termurah (~$0.02/image)
          n: 1,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { data?: { b64_json?: string }[] };
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
          return NextResponse.json({
            image: `data:image/png;base64,${b64}`,
            provider: "openai",
          });
        }
      }
      // OpenAI error (quota, dll) → jatuh ke provider berikutnya.
    }

    // Gemini path — free tier AI Studio. Model bisa di-override via env karena
    // nama model image gen Gemini berubah-ubah antar preview/GA.
    if (process.env.GEMINI_API_KEY) {
      const model =
        process.env.GEMINI_IMAGE_MODEL ||
        "gemini-2.0-flash-preview-image-generation";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60_000);
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: stickerPrompt }] }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
            signal: controller.signal,
          },
        );
        if (res.ok) {
          const data = (await res.json()) as {
            candidates?: {
              content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
            }[];
          };
          const img = data.candidates?.[0]?.content?.parts?.find(
            (p) => p.inlineData?.data,
          );
          if (img?.inlineData) {
            return NextResponse.json({
              image: `data:${img.inlineData.mimeType ?? "image/png"};base64,${img.inlineData.data}`,
              provider: "gemini",
            });
          }
        }
      } catch {
        // abort/network → jatuh ke Pollinations
      } finally {
        clearTimeout(timer);
      }
    }

    // Pollinations fallback — gratis, ~1 req/15s + queue global. 2 attempt
    // dengan timeout supaya antrean panjang tidak menggantung.
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120_000);
      try {
        const url =
          `https://image.pollinations.ai/prompt/${encodeURIComponent(stickerPrompt)}` +
          `?width=1024&height=1024&model=flux&seed=${Math.floor(Math.random() * 1e6)}` +
          `&referrer=bisaprint&private=true`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) continue;
        const type = res.headers.get("content-type") ?? "";
        if (!type.startsWith("image/")) continue;
        const buf = await res.arrayBuffer();
        return NextResponse.json({
          image: `data:${type};base64,${Buffer.from(buf).toString("base64")}`,
          provider: "pollinations",
        });
      } catch {
        // abort/network → attempt berikutnya
      } finally {
        clearTimeout(timer);
      }
    }

    return NextResponse.json(
      { error: "AI lagi penuh antrean. Tunggu ±1 menit lalu coba lagi ya." },
      { status: 503 },
    );
  } catch (error) {
    console.error("ai-design error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
