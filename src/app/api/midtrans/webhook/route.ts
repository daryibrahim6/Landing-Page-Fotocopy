import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOrderByMidtransOrderId, saveOrder, updateOrderStatus } from "@/lib/order-storage";
import { notifyAdminNewOrder, notifyAdminPaidOrder, logNotification } from "@/lib/notification";
import { midtransWebhookBodySchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const parsed = midtransWebhookBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const { order_id, transaction_status, status_code, gross_amount, signature_key, fraud_status } =
      parsed.data;

    // Fail closed: without the server key we cannot verify authenticity, so we
    // refuse to process the notification rather than trusting it blindly.
    const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
    if (!serverKey) {
      console.error("[Midtrans Webhook] MIDTRANS_SERVER_KEY not set — refusing notification");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const computed = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== computed) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Per Midtrans docs: a transaction is successful only when
    // status_code = 200, fraud_status = accept, transaction_status = settlement/capture.
    // "capture" with fraud_status "challenge" must NOT mark the order paid.
    let orderStatus: "pending" | "paid" | "cancelled" | "expired" | null = null;
    switch (transaction_status) {
      case "settlement":
        orderStatus = status_code === "200" ? "paid" : null;
        break;
      case "capture":
        orderStatus =
          status_code === "200" && fraud_status !== "challenge" && fraud_status !== "deny"
            ? "paid"
            : null;
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
      default:
        // Unknown statuses (refund, chargeback, partial_refund, authorize, ...)
        // are logged and acknowledged, but never mutate the order.
        console.log(`[Midtrans Webhook] Order ${order_id}: unknown status "${transaction_status}" ignored`);
        return NextResponse.json({ success: true, orderId: order_id, ignored: true });
    }

    if (orderStatus === null) {
      console.log(
        `[Midtrans Webhook] Order ${order_id}: ${transaction_status} (status_code=${status_code}, fraud=${fraud_status ?? "-"}) — not paid, no status change`,
      );
      return NextResponse.json({ success: true, orderId: order_id, ignored: true });
    }

    // Amount integrity: a settlement for a different amount than the stored order
    // must not mark it paid — flag a discrepancy and keep it pending for review.
    const existing = await getOrderByMidtransOrderId(order_id);
    if (existing && orderStatus === "paid") {
      const notified = Math.round(Number(gross_amount));
      const expected = Math.round(existing.pricing.total);
      if (Number.isFinite(notified) && notified !== expected) {
        console.warn(
          `[Midtrans Webhook] Amount mismatch for ${order_id}: expected ${expected}, got ${notified}`,
        );
        existing.payment.discrepancy = `webhook gross_amount ${gross_amount} != order total ${expected}`;
        existing.updatedAt = new Date().toISOString();
        await saveOrder(existing);
        return NextResponse.json({ success: true, orderId: order_id, discrepancy: true });
      }
    }

    // Capture BEFORE updateOrderStatus: the in-memory store returns live object
    // references, so `existing` is mutated by the update — must snapshot first.
    const prevStatus = existing?.payment.status;
    const order = await updateOrderStatus(order_id, orderStatus);

    // Notify only when the transition actually applied and changed state —
    // duplicate webhooks and blocked regressions must not spam admin.
    const applied =
      order && order.payment.status === orderStatus && prevStatus !== orderStatus;
    if (applied) {
      const notification = orderStatus === "paid" ? notifyAdminPaidOrder(order) : notifyAdminNewOrder(order);
      logNotification(notification);
    } else if (!order) {
      console.log(`[Midtrans Webhook] Order ${order_id}: ${transaction_status} → ${orderStatus}`);
    }

    return NextResponse.json({ success: true, orderId: order_id, status: orderStatus });
  } catch (error) {
    console.error("webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
