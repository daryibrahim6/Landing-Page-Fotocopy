export type ProductCategory =
  | "digital-printing"
  | "print-dokumen"
  | "stiker-label"
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

// Production pipeline status — lives here (not in lib/order-storage) because
// client components (OrderTable) need the constant without pulling the whole
// server-only storage module (redis client) into the browser bundle.
export const PRODUCTION_STATUSES = ["baru", "diproses", "selesai", "diambil", "batal"] as const;
export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number];



