import { buildAdminWAUrl } from "@/lib/wa";
import { formatRupiah } from "@/lib/utils";
import type { StoredOrder } from "@/lib/order-storage";

// Notification dispatcher for admin.
// WA cannot be sent from a server without a WhatsApp Business API / Twilio-like provider.
// This helper builds the WA click-to-chat URL and returns a structured notification
// that can be logged, emailed, or pushed to an admin dashboard.

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
  );
  return {
    channel: "whatsapp",
    label: "Order Baru",
    recipient: process.env.ADMIN_WHATSAPP_NUMBER ?? "",
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
    recipient: process.env.ADMIN_WHATSAPP_NUMBER ?? "",
    url: message,
    message: `Pembayaran berhasil #${order.id} - ${order.productName} - ${order.customer.name} - ${total}`,
    orderId: order.id,
    timestamp: new Date().toISOString(),
  };
}

export function logNotification(notification: AdminNotification): void {
  // Logs to stdout; replace with email/SMS/push provider integration in production.
  console.log(`[Admin Notification] ${notification.label} | Order ${notification.orderId}`);
  console.log(`[Admin WhatsApp URL] ${notification.url}`);
}
