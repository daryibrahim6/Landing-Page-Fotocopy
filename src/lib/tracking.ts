export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  try {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", event, params);
    }
  } catch {}

  try {
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", event, params);
    }
  } catch {}
}

export function trackPurchase(
  transactionId: string,
  value: number,
  currency = "IDR",
  items?: { id: string; quantity: number; price: number }[],
) {
  if (typeof window === "undefined") return;

  try {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "purchase", {
        transaction_id: transactionId,
        value,
        currency,
        items,
      });
    }
  } catch {}

  try {
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "Purchase", {
        value,
        currency,
        content_ids: items?.map((i) => i.id),
        content_type: "product",
      });
    }
  } catch {}
}
