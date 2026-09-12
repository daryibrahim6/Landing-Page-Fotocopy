import { NextResponse } from "next/server";
import { isAdminRequest, adminUnauthorized } from "@/lib/admin-auth";
import { listOrders } from "@/lib/order-storage";
import { adminListQuerySchema } from "@/lib/schemas";

// GET /api/admin/orders?limit=20&cursor=0 — newest-first paginated order list.
// Auth: Basic Auth re-checked here (defense in depth on top of src/proxy.ts).
export async function GET(request: Request) {
  if (!isAdminRequest(request)) return adminUnauthorized();

  const searchParams = new URL(request.url).searchParams;
  const parsed = adminListQuerySchema.safeParse({
    limit: searchParams.get("limit") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  const result = await listOrders(parsed.data.limit, parsed.data.cursor);
  return NextResponse.json(result);
}
