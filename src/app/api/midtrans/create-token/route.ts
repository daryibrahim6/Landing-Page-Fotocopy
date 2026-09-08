import { NextResponse } from "next/server";
import { getMidtransBaseUrl, getMidtransServerKey, generateOrderId } from "@/lib/midtrans";
import { saveOrder, type StoredOrder } from "@/lib/order-storage";
import type { MidtransCreateTokenBody, MidtransItem } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MidtransCreateTokenBody;
    const { items, customerDetails, grossAmount } = body;

    if (!items?.length || !customerDetails || !grossAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderId = generateOrderId();
    const serverKey = getMidtransServerKey();
    const baseUrl = getMidtransBaseUrl();

    const item = items[0];
    const extra = body.customerExtra;

    const order: StoredOrder = {
      id: orderId,
      productId: item.id,
      productName: item.name,
      specs: body.specs ?? {
        ukuran: "-",
        bahan: "-",
        finishing: "-",
        jumlah: String(item.quantity),
      },
      customer: {
        name: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email ?? "",
        pickup: extra?.pickup ?? "ambil",
        address: extra?.address,
        notes: extra?.notes,
      },
      pricing: {
        subtotal: grossAmount,
        total: grossAmount,
      },
      payment: {
        status: "pending",
        midtransOrderId: orderId,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveOrder(order);

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
          gross_amount: grossAmount,
        },
        item_details: items.map((item: MidtransItem) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
        })),
        customer_details: {
          first_name: customerDetails.name,
          phone: customerDetails.phone,
          email: customerDetails.email,
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
