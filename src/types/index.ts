export interface Product {
  id: string;
  name: string;
  category: "digital-print" | "document" | "sablon" | "umkm";
  description: string;
  startingPrice: number;
  image: string;
  whatsappMessage: string;
  featured?: boolean;
}
