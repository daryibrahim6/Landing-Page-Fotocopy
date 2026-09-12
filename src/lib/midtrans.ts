export function getMidtransBaseUrl(): string {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  return isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
}

export function getMidtransServerKey(): string {
  return process.env.MIDTRANS_SERVER_KEY ?? "";
}

export function getMidtransClientKey(): string {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

// Client-safe check: only the NEXT_PUBLIC_ client key is visible in the browser.
// Server key absence is handled server-side by the create-token simulation fallback.
export function isMidtransConfigured(): boolean {
  return getMidtransClientKey().length > 0;
}
