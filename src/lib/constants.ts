export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bisaprint.com";
export const WA_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281299435019";
export const IG_URL = "https://instagram.com/bisaprintshop";
export const SHOPEE_URL = "https://shopee.co.id/bisaprintshop";
export const EMAIL_URL = "mailto:bisadigitalprint@gmail.com";
export const MAPS_EMBED_URL = "https://www.google.com/maps?q=BisaPrint+Jl.+Dalang+I+No.45+Pengasinan+Rawalumbu+Kota+Bekasi&output=embed";

export const WA_DEFAULT_MSG = encodeURIComponent(
  "Halo Admin Bisa Print, saya mau konsultasi order.\nNama:\nProduk:\nJumlah:\nUkuran:\nBahan:\nCatatan:",
);

export function waUrl(message?: string): string {
  const text = message ? encodeURIComponent(message) : WA_DEFAULT_MSG;
  return `https://wa.me/${WA_NUMBER}?text=${text}`;
}
