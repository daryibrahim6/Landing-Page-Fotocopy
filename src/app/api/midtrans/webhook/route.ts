import { NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus } from "@/lib/order-storage";
import { notifyAdminNewOrder, notifyAdminPaidOrder, logNotification } from "@/lib/notification";
import { midtransWebhookBodySchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const parsed = midtransWebhookBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const { order_id, transaction_status, status_code, gross_amount, signature_key } = parsed.data;

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

    let orderStatus: "pending" | "paid" | "cancelled" | "expired" = "pending";
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
        orderStatus = "cancelled";
        break;
      case "expire":
        orderStatus = "expired";
        break;
    }

    const order = await updateOrderStatus(order_id, orderStatus);

    if (order) {
      const notification = orderStatus === "paid" ? notifyAdminPaidOrder(order) : notifyAdminNewOrder(order);
      logNotification(notification);
    } else {
      console.log(`[Midtrans Webhook] Order ${order_id}: ${transaction_status} → ${orderStatus}`);
    }

    return NextResponse.json({ success: true, orderId: order_id, status: orderStatus });
  } catch (error) {
    console.error("webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
