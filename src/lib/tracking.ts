declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }
  } catch {}

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", event, params);
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
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: transactionId,
        value,
        currency,
        items,
      });
    }
  } catch {}

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        value,
        currency,
        content_ids: items?.map((i) => i.id),
        content_type: "product",
      });
    }
  } catch {}
}
