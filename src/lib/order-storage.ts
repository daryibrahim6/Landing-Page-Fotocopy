import { redis } from "@/lib/redis";

// Order storage abstraction.
// Uses Upstash Redis if env vars are set, otherwise falls back to in-memory Map.
// This allows local dev without external DB and production with persistence.

if (!redis) {
  console.warn(
    "[order-storage] UPSTASH_REDIS_* not set — orders stored in-memory (non-persistent, per-instance). " +
      "In production, order writes are refused; set env vars.",
  );
}

// TTL applies only while an order is `pending`: abandoned checkouts auto-clean
// when the Midtrans expire webhook never arrives (e.g. simulation orders).
// Terminal orders (paid/cancelled/expired) are written WITHOUT TTL — they are
// business records and must persist for rekap/reporting.
const PENDING_ORDER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Terminal statuses: once reached, webhook notifications must not regress the order.
// paid/expired/cancelled are final; only "pending" may transition.
const TERMINAL_STATUSES = new Set<StoredOrder["payment"]["status"]>([
  "paid",
  "cancelled",
  "expired",
]);

// Production pipeline status — deliberately separate from payment.status so the
// admin workflow never collides with the Midtrans webhook state machine.
// Missing `production` on legacy orders = "baru".
export const PRODUCTION_STATUSES = ["baru", "diproses", "selesai", "diambil"] as const;
export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number];

// Sorted-set index of order ids scored by createdAt — enables newest-first
// paginated listing in Redis mode. (Memory mode scans the Map instead.)
const ORDER_INDEX_KEY = "order:index";

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
  production?: {
    status: ProductionStatus;
    updatedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const memoryStore = new Map<string, StoredOrder>();

// True when orders persist (Upstash). The admin dashboard surfaces a warning
// when this is false so an in-memory deployment never looks "empty but fine".
export function isPersistentStorage(): boolean {
  return redis !== null;
}

export async function saveOrder(order: StoredOrder): Promise<void> {
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      // Fail loud: in-memory orders are per-instance on serverless — a webhook
      // hitting another instance would never find them. Better to error the
      // checkout (client falls back to WA) than to silently lose paid orders.
      throw new Error("[order-storage] UPSTASH_REDIS_* not configured — refusing order write in production");
    }
    memoryStore.set(order.id, order);
    return;
  }
  const pendingTtl =
    order.payment.status === "pending" ? { ex: PENDING_ORDER_TTL_SECONDS } : undefined;
  await redis.set(`order:${order.id}`, JSON.stringify(order), pendingTtl);
  await redis.set(`order:midtrans:${order.payment.midtransOrderId}`, order.id, pendingTtl);
  await redis.zadd(ORDER_INDEX_KEY, {
    score: Date.parse(order.createdAt),
    member: order.id,
  });
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

export interface ListOrdersResult {
  orders: StoredOrder[];
  /** Pass back as `cursor` for the next page; null when the list is exhausted. */
  nextCursor: number | null;
}

// Newest-first paginated listing for the admin dashboard.
// ponytail: offset cursor is O(page) — fine at MVP order volume; switch to a
// score-based cursor if the index ever grows large enough for pages to overlap.
export async function listOrders(limit = 20, cursor = 0): Promise<ListOrdersResult> {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
  const offset = Math.max(0, Math.floor(cursor));

  let page: StoredOrder[];
  let total: number;
  if (redis) {
    const ids = await redis.zrange(ORDER_INDEX_KEY, offset, offset + safeLimit - 1, {
      rev: true,
    });
    total = await redis.zcard(ORDER_INDEX_KEY);
    const rows = ids.length ? await redis.mget<(string | null)[]>(ids.map((id) => `order:${id}`)) : [];
    page = rows.filter((r): r is string => typeof r === "string").map((r) => JSON.parse(r) as StoredOrder);
  } else {
    const all = [...memoryStore.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    total = all.length;
    page = all.slice(offset, offset + safeLimit);
  }

  const nextOffset = offset + page.length;
  return { orders: page, nextCursor: nextOffset < total ? nextOffset : null };
}

export async function updateProductionStatus(
  orderId: string,
  status: ProductionStatus,
): Promise<StoredOrder | null> {
  const order = await getOrder(orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  order.production = { status, updatedAt: now };
  order.updatedAt = now;
  await saveOrder(order);
  return order;
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
