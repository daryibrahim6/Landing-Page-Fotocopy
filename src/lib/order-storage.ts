import { redis } from "@/lib/redis";

// Order storage abstraction.
// Uses Upstash Redis if env vars are set, otherwise falls back to in-memory Map.
// This allows local dev without external DB and production with persistence.

if (!redis) {
  console.warn(
    "[order-storage] UPSTASH_REDIS_* not set — orders stored in-memory (non-persistent, per-instance). Set env vars for production.",
  );
}

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days — covers production window, auto-cleans abandoned orders

// Terminal statuses: once reached, webhook notifications must not regress the order.
// paid/expired/cancelled are final; only "pending" may transition.
const TERMINAL_STATUSES = new Set<StoredOrder["payment"]["status"]>([
  "paid",
  "cancelled",
  "expired",
]);

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
    /** Set when a paid webhook carries a gross_amount that doesn't match pricing.total. */
    discrepancy?: string;
  };
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const memoryStore = new Map<string, StoredOrder>();

export async function saveOrder(order: StoredOrder): Promise<void> {
  if (redis) {
    await redis.set(`order:${order.id}`, JSON.stringify(order), { ex: ORDER_TTL_SECONDS });
    await redis.set(`order:midtrans:${order.payment.midtransOrderId}`, order.id, {
      ex: ORDER_TTL_SECONDS,
    });
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

  // Guard: never regress a terminal status (e.g. late "expire" after "settlement"
  // must not turn a paid order back into expired). Same-status writes are idempotent no-ops.
  if (order.payment.status === status) return order;
  if (TERMINAL_STATUSES.has(order.payment.status)) {
    console.warn(
      `[order-storage] Ignoring status regression ${order.payment.status} → ${status} for ${midtransOrderId}`,
    );
    return order;
  }

  order.payment.status = status;
  order.payment.paidAt = status === "paid" ? new Date().toISOString() : order.payment.paidAt;
  order.updatedAt = new Date().toISOString();
  await saveOrder(order);
  return order;
}
