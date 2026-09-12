import { ADMIN_WA_NUMBER, buildAdminWAUrl } from "@/lib/wa";
import { formatRupiah } from "@/lib/utils";
import type { StoredOrder } from "@/lib/order-storage";

// Notification dispatcher for admin.
// WA cannot be sent from a server without a WhatsApp Business API / Twilio-like provider.
// This helper builds the WA click-to-chat URL and returns a structured notification
// that can be logged, emailed, or pushed to an admin dashboard.
// Delivery: ADMIN_NOTIFY_WEBHOOK_URL (optional) receives a POST with the payload —
// point it at n8n/Make/Telegram bot/Discord etc. for real-time admin alerts.

export interface AdminNotification {
  channel: "whatsapp";
  label: string;
  recipient: string;
  url: string;
  message: string;
  orderId: string;
  timestamp: string;
}

export function notifyAdminNewOrder(order: StoredOrder): AdminNotification {
  const total = formatRupiah(order.pricing.total);
  const message = buildAdminWAUrl(
    "adminNewOrder",
    order.id,
    order.productName,
    order.customer.name,
    order.customer.phone,
    total,
    order.customer.notes ?? "-",
    order.fileUrl ?? "-",
  );
  return {
    channel: "whatsapp",
    label: "Order Baru",
    recipient: ADMIN_WA_NUMBER,
    url: message,
    message: `Order baru #${order.id} - ${order.productName} - ${order.customer.name} - ${total}`,
    orderId: order.id,
    timestamp: new Date().toISOString(),
  };
}

export function notifyAdminPaidOrder(order: StoredOrder): AdminNotification {
  const total = formatRupiah(order.pricing.total);
  const message = buildAdminWAUrl(
    "adminPaidOrder",
    order.id,
    order.productName,
    order.customer.name,
    order.customer.phone,
    total,
  );
  return {
    channel: "whatsapp",
    label: "Pembayaran Berhasil",
    recipient: ADMIN_WA_NUMBER,
    url: message,
    message: `Pembayaran berhasil #${order.id} - ${order.productName} - ${order.customer.name} - ${total}`,
    orderId: order.id,
    timestamp: new Date().toISOString(),
  };
}

export function logNotification(notification: AdminNotification): void {
  console.log(`[Admin Notification] ${notification.label} | Order ${notification.orderId}`);
  console.log(`[Admin WhatsApp URL] ${notification.url}`);
}

// Dispatches an admin notification: always logs, and if ADMIN_NOTIFY_WEBHOOK_URL
// is set, POSTs the payload to it. Takes a lazy builder so a throw in the
// notification builder itself cannot fail the request — notification is a
// side effect and must never break order/payment handling (fire-and-guard).
export async function dispatchAdminNotification(
  build: () => AdminNotification,
): Promise<void> {
  try {
    const notification = build();
    logNotification(notification);

    const webhookUrl = process.env.ADMIN_NOTIFY_WEBHOOK_URL;
    if (!webhookUrl) return;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[Admin Notification] webhook responded ${res.status} for order ${notification.orderId}`);
    }
  } catch (error) {
    console.error("[Admin Notification] dispatch failed:", error);
  }
}
