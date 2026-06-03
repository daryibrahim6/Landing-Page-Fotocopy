import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { order_id, transaction_status, status_code, gross_amount, signature_key } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";

    if (serverKey) {
      const computed = crypto
        .createHash("sha512")
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest("hex");

      if (signature_key !== computed) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    let orderStatus = "pending";
    switch (transaction_status) {
      case "capture":
      case "settlement":
        orderStatus = "paid";
        break;
      case "pending":
        orderStatus = "pending";
        break;
      case "deny":
      case "cancel":
      case "expire":
        orderStatus = "cancelled";
        break;
    }

    console.log(`[Midtrans Webhook] Order ${order_id}: ${transaction_status} → ${orderStatus}`);

    return NextResponse.json({ success: true, orderId: order_id, status: orderStatus });
  } catch (error) {
    console.error("webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
