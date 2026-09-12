// Domain order: generate ID + bangun StoredOrder dari payload checkout.
// Dipakai oleh /api/midtrans/create-token (method "midtrans") dan
// /api/orders (method "whatsapp" — checkout WA-only tetap tercatat supaya
// kode BSP-XXXX bisa dicocokkan admin dengan mutasi transfer manual).
import type { z } from "zod";
import type { createTokenBodySchema } from "@/lib/schemas";
import type { StoredOrder } from "@/lib/order-storage";
import { products } from "@/data/products";
import { calculatePrice } from "@/lib/pricing";

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `BSP-${timestamp}-${random}`.toUpperCase();
}

type CheckoutInput = z.infer<typeof createTokenBodySchema>;

// Server-side builder: product + specs WAJIB ada di katalog dan harga selalu
// dihitung ulang — input harga dari client tidak pernah dipercaya (OWASP).
export function buildStoredOrder(
  data: CheckoutInput,
  orderId: string,
  method: NonNullable<StoredOrder["payment"]["method"]>,
): { order: StoredOrder } | { error: string } {
  const { productId, size, material, finishing, quantity, fileUrl, customerDetails, customerExtra } =
    data;

  const product = products.find((p) => p.id === productId);
  if (
    !product ||
    !product.sizes.includes(size) ||
    !product.materials.includes(material) ||
    !product.finishings.includes(finishing)
  ) {
    return { error: "Unknown product or spec option" };
  }
  if (!product.isCheckoutEnabled) {
    return { error: "Produk ini belum tersedia untuk checkout online. Hubungi admin via WhatsApp." };
  }

  const pricing = calculatePrice(productId, size, material, finishing, quantity);
  if (pricing.total <= 0) {
    return { error: "Could not compute price" };
  }

  return {
    order: {
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
        method,
        midtransOrderId: method === "midtrans" ? orderId : undefined,
      },
      // Only persist real file references: blob: keys (Upstash Blob —
      // resolved via /api/admin/files) or legacy http(s) URLs. Local-dev
      // data: URLs are dropped.
      fileUrl:
        fileUrl && (fileUrl.startsWith("http") || fileUrl.startsWith("blob:"))
          ? fileUrl
          : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
