// TODO: Confirm final WhatsApp number with the client before production launch.
export const WA_NUMBER = "628119198611";

export const WA_DEFAULT_MSG = encodeURIComponent(
  "Halo BisaPrint, saya ingin pesan...",
);

export function waUrl(message?: string): string {
  const text = message ? encodeURIComponent(message) : WA_DEFAULT_MSG;
  return `https://wa.me/${WA_NUMBER}?text=${text}`;
}

export function waUrlProduct(productName: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Halo BisaPrint, saya tertarik dengan ${productName}`,
  )}`;
}
