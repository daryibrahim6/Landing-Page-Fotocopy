import { NextResponse } from "next/server";
import { isAdminRequest, adminUnauthorized } from "@/lib/admin-auth";
import { updateProductionStatus } from "@/lib/order-storage";
import { adminProductionPatchSchema } from "@/lib/schemas";

// PATCH /api/admin/orders/[id] — update production status only.
// Payment status is owned by the Midtrans webhook; never mutated here.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return adminUnauthorized();

  const { id } = await params;
  const parsed = adminProductionPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const order = await updateProductionStatus(id, parsed.data.productionStatus);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
