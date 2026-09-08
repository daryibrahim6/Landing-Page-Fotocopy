import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
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

    // If BLOB_READ_WRITE_TOKEN is set, upload to Vercel Blob.
    // Otherwise, return a data URL for local dev/MVP demo.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`orders/${Date.now()}-${file.name}`, file, { access: "public" });
      return NextResponse.json({ url: blob.url, name: file.name, size: file.size });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return NextResponse.json({ url: dataUrl, name: file.name, size: file.size, note: "Local data URL. Set BLOB_READ_WRITE_TOKEN for persistent storage." });
  } catch (error) {
    console.error("upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
