import { NextResponse } from "next/server";
import { isAdminRequest, adminUnauthorized } from "@/lib/admin-auth";
import { blob } from "@/lib/blob";

// GET /api/admin/files?key=orders/xxx — mints a short-lived signed read URL for
// a private Upstash Blob object, then redirects. Keys are constrained to the
// orders/ prefix so this endpoint can never read arbitrary bucket objects.
export async function GET(request: Request) {
  if (!isAdminRequest(request)) return adminUnauthorized();
  if (!blob) {
    return NextResponse.json({ error: "Blob storage not configured" }, { status: 503 });
  }

  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!/^orders\/[a-zA-Z0-9._-]+$/.test(key)) {
    return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
  }

  try {
    const { url } = await blob.signedReadUrl(key);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
