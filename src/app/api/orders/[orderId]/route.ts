import { NextResponse } from "next/server";
import { getOrder } from "@/lib/order-storage";
import { orderIdSchema } from "@/lib/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  if (!orderIdSchema.safeParse(orderId).success) {
    return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
  }

  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
