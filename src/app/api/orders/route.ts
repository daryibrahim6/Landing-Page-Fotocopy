import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { saveOrder } from "@/lib/order-storage";
import { buildStoredOrder, generateOrderId } from "@/lib/orders";
import { notifyAdminNewOrder, dispatchAdminNotification } from "@/lib/notification";
import { createTokenBodySchema } from "@/lib/schemas";

// Order via WhatsApp (checkout WA-only). Record tetap dibuat server-side
// supaya kode BSP-XXXX punya jejak di /admin/orders — admin mencocokkan
// mutasi transfer manual dengan kode ini. Pembayaran terjadi di luar sistem
// (chat WA), jadi payment.status tetap "pending" sampai admin konfirmasi.
// Rate limit identik create-token: blokir order-spam.
const ratelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 m") })
  : null;

export async function POST(request: Request) {
  try {
    if (ratelimit) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "anonymous";
      const { success } = await ratelimit.limit(`orders:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Coba lagi nanti." },
          { status: 429 },
        );
      }
    }

    const parsed = createTokenBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Server-side recompute identik dengan jalur Midtrans (buildStoredOrder).
    const orderId = generateOrderId();
    const built = buildStoredOrder(parsed.data, orderId, "whatsapp");
    if ("error" in built) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }

    await saveOrder(built.order);
    await dispatchAdminNotification(() => notifyAdminNewOrder(built.order));

    return NextResponse.json({ orderId });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
