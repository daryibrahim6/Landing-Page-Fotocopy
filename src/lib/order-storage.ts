import { Redis } from "@upstash/redis";

// Order storage abstraction.
// Uses Upstash Redis if env vars are set, otherwise falls back to in-memory Map.
// This allows local dev without external DB and production with persistence.

export interface StoredOrder {
  id: string;
  productId: string;
  productName: string;
  specs: Record<string, string>;
  customer: {
    name: string;
    phone: string;
    email: string;
    pickup: "ambil" | "kirim";
    address?: string;
    notes?: string;
  };
  pricing: {
    subtotal: number;
    shippingEstimate?: number;
    total: number;
  };
  payment: {
    status: "pending" | "paid" | "cancelled" | "expired";
    midtransOrderId: string;
    paidAt?: string;
  };
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const memoryStore = new Map<string, StoredOrder>();

export async function saveOrder(order: StoredOrder): Promise<void> {
  if (redis) {
    await redis.set(`order:${order.id}`, JSON.stringify(order));
    await redis.set(`order:midtrans:${order.payment.midtransOrderId}`, order.id);
  } else {
    memoryStore.set(order.id, order);
  }
}

export async function getOrder(id: string): Promise<StoredOrder | null> {
  if (redis) {
    const data = await redis.get<string>(`order:${id}`);
    return data ? (JSON.parse(data) as StoredOrder) : null;
  }
  return memoryStore.get(id) ?? null;
}

export async function getOrderByMidtransOrderId(midtransOrderId: string): Promise<StoredOrder | null> {
  if (redis) {
    const orderId = await redis.get<string>(`order:midtrans:${midtransOrderId}`);
    return orderId ? getOrder(orderId) : null;
  }
  for (const order of memoryStore.values()) {
    if (order.payment.midtransOrderId === midtransOrderId) return order;
  }
  return null;
}

export async function updateOrderStatus(
  midtransOrderId: string,
  status: StoredOrder["payment"]["status"],
): Promise<StoredOrder | null> {
  const order = await getOrderByMidtransOrderId(midtransOrderId);
  if (!order) return null;
  order.payment.status = status;
  order.payment.paidAt = status === "paid" ? new Date().toISOString() : order.payment.paidAt;
  order.updatedAt = new Date().toISOString();
  await saveOrder(order);
  return order;
}
