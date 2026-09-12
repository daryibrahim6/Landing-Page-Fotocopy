import { NextResponse } from "next/server";
import { getMidtransBaseUrl, getMidtransServerKey, generateOrderId } from "@/lib/midtrans";
import { saveOrder, type StoredOrder } from "@/lib/order-storage";
import { notifyAdminNewOrder, dispatchAdminNotification } from "@/lib/notification";
import { createTokenBodySchema } from "@/lib/schemas";
import { calculatePrice } from "@/lib/pricing";
import { products } from "@/data/products";

export async function POST(request: Request) {
  try {
    const parsed = createTokenBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { productId, size, material, finishing, quantity, fileUrl, customerDetails, customerExtra } =
      parsed.data;

    // Server-side recompute: product and specs must exist in our catalog, and the
    // price is always derived server-side — client-supplied amounts are ignored.
    const product = products.find((p) => p.id === productId);
    if (
      !product ||
      !product.sizes.includes(size) ||
      !product.materials.includes(material) ||
      !product.finishings.includes(finishing)
    ) {
      return NextResponse.json({ error: "Unknown product or spec option" }, { status: 400 });
    }
    if (!product.isCheckoutEnabled) {
      return NextResponse.json(
        { error: "Produk ini belum tersedia untuk checkout online. Hubungi admin via WhatsApp." },
        { status: 400 },
      );
    }

    const pricing = calculatePrice(productId, size, material, finishing, quantity);
    if (pricing.total <= 0) {
      return NextResponse.json({ error: "Could not compute price" }, { status: 400 });
    }

    const orderId = generateOrderId();
    const serverKey = getMidtransServerKey();
    const baseUrl = getMidtransBaseUrl();
    const unitPrice = Math.round(pricing.total / quantity);

    const order: StoredOrder = {
      id: orderId,
      productId: product.id,
      productName: `${product.name} (${size} - ${material} - ${finishing})`,
      specs: {
        ukuran: size,
        bahan: material,
        finishing,
        jumlah: String(quantity),
      },
      customer: {
        name: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email || "",
        pickup: customerExtra?.pickup ?? "ambil",
        address: customerExtra?.address,
        notes: customerExtra?.notes,
      },
      pricing: {
        subtotal: pricing.total,
        total: pricing.total,
      },
      payment: {
        status: "pending",
        midtransOrderId: orderId,
      },
      // Only persist real URLs (Vercel Blob). Local-dev data: URLs are dropped.
      fileUrl: fileUrl?.startsWith("http") ? fileUrl : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
          gross_amount: pricing.total,
        },
        item_details: [
          {
            id: product.id,
            price: unitPrice,
            quantity,
            name: order.productName,
          },
        ],
        customer_details: {
          first_name: customerDetails.name,
          phone: customerDetails.phone,
          ...(customerDetails.email ? { email: customerDetails.email } : {}),
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
