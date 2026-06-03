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

export function isMidtransConfigured(): boolean {
  return getMidtransServerKey().length > 0 && getMidtransClientKey().length > 0;
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BSP-${timestamp}-${random}`.toUpperCase();
}
