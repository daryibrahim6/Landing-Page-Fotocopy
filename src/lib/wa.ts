const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281299435019";
const ADMIN_WA_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || WA_NUMBER;

export type WATemplate = "general" | "fromProduct" | "postCheckout" | "adminNewOrder" | "adminPaidOrder";

export const templates: Record<string, string | ((...args: string[]) => string)> = {
  general:
    "Halo Admin Bisa Print, saya mau konsultasi order.\nNama:\nProduk:\nJumlah:\nUkuran:\nBahan:\nCatatan:",
  fromProduct: (productName: string) =>
    `Halo Admin Bisa Print, saya mau order.\nProduk: ${productName}\nJumlah:\nUkuran:\nBahan:\nCatatan:`,
  postCheckout: (orderId: string) =>
    `Halo Admin Bisa Print, saya sudah bayar order ${orderId}. Mohon konfirmasi dan cek file desain saya. Terima kasih!`,
  adminNewOrder: (orderId: string, product: string, customer: string, phone: string, total: string, notes = "-") =>
    `🔔 Order Baru #${orderId}\nProduk: ${product}\nCustomer: ${customer}\nWA: ${phone}\nTotal: ${total}\nCatatan: ${notes}\nSegera cek file desain di dashboard.`,
  adminPaidOrder: (orderId: string, product: string, customer: string, phone: string, total: string) =>
    `✅ Pembayaran Berhasil #${orderId}\nProduk: ${product}\nCustomer: ${customer}\nWA: ${phone}\nTotal: ${total}\nOrder siap diproses.`,
};

export function buildWAUrl(template: WATemplate, ...args: string[]): string {
  const tpl = templates[template];
  const text =
    typeof tpl === "function" ? (tpl as (...a: string[]) => string)(...args) : tpl;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildWAFormUrl(fields: {
  nama: string;
  produk: string;
  jumlah: string;
  ukuran: string;
  bahan: string;
  catatan: string;
}): string {
  const text = `Halo Admin Bisa Print, saya mau order.\nNama: ${fields.nama}\nProduk: ${fields.produk}\nJumlah: ${fields.jumlah}\nUkuran: ${fields.ukuran}\nBahan: ${fields.bahan}\nCatatan: ${fields.catatan}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildAdminWAUrl(template: "adminNewOrder" | "adminPaidOrder", ...args: string[]): string {
  const tpl = templates[template];
  const text = typeof tpl === "function" ? (tpl as (...a: string[]) => string)(...args) : tpl;
  return `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(text ?? "")}`;
}
