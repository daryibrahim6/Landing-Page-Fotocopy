import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  return NextResponse.json({
    orderId,
    status: "pending",
    message: "Order status endpoint ready. Integrate with database for production.",
  });
}
