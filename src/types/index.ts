export type ProductCategory =
  | "digital-printing"
  | "print-dokumen"
  | "stiker-label"
  | "dtf-apparel"
  | "produk-custom";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  priceFrom: number;
  unit: string;
  sizes: string[];
  materials: string[];
  finishings: string[];
  estimasi: string;
  fileSpecs: string;
  images: string[];
  isCheckoutEnabled: boolean;
  whatsappTemplate: string;
}



