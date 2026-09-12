import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { getMidtransBaseUrl, getMidtransServerKey } from "@/lib/midtrans";
import { buildStoredOrder, generateOrderId } from "@/lib/orders";
import { saveOrder } from "@/lib/order-storage";
import { notifyAdminNewOrder, dispatchAdminNotification } from "@/lib/notification";
import { createTokenBodySchema } from "@/lib/schemas";

// Rate limit token creation per IP when Redis is configured (same policy as
// /api/upload): blocks order-spam that would mint junk Midtrans transactions.
// Local dev without UPSTASH_* falls through unlimited.
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
      const { success } = await ratelimit.limit(`create-token:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Coba lagi nanti, atau order via WhatsApp." },
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
    // Server-side recompute: product/specs divalidasi ke katalog + harga
    // dihitung ulang di buildStoredOrder — input harga client tidak dipercaya.
    const orderId = generateOrderId();
    const built = buildStoredOrder(parsed.data, orderId, "midtrans");
    if ("error" in built) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    const { order } = built;
    const serverKey = getMidtransServerKey();
    const baseUrl = getMidtransBaseUrl();
    const unitPrice = Math.round(order.pricing.total / parsed.data.quantity);

    await saveOrder(order);
    await dispatchAdminNotification(() => notifyAdminNewOrder(order));

    if (!serverKey) {
      return NextResponse.json({
        token: null,
        redirectUrl: null,
        orderId,
        simulation: true,
        message: "Midtrans belum dikonfigurasi. Gunakan WhatsApp untuk melanjutkan.",
      });
    }

    const auth = Buffer.from(`${serverKey}:`).toString("base64");

    const response = await fetch(`${baseUrl}/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: order.pricing.total,
        },
        item_details: [
          {
            id: order.productId,
            price: unitPrice,
            quantity: parsed.data.quantity,
            name: order.productName,
          },
        ],
        customer_details: {
          first_name: order.customer.name,
          phone: order.customer.phone,
          ...(order.customer.email ? { email: order.customer.email } : {}),
        },
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/checkout/success?orderId=${orderId}`,
        },
        expiry: { unit: "hour", duration: 24 },
      }),
    });

    const result = await response.json();

    if (result.status_code === "201" || result.redirect_url) {
      return NextResponse.json({
        token: result.token,
        redirectUrl: result.redirect_url,
        orderId,
      });
    }

    return NextResponse.json({ error: "Midtrans error", details: result }, { status: 500 });
  } catch (error) {
    console.error("create-token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
