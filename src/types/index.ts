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

export interface CheckoutItem {
  productId: string;
  productName: string;
  materialId: string;
  materialName: string;
  sizeId: string;
  sizeName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  items: CheckoutItem[];
  notes: string;
  totalAmount: number;
}

export interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransCustomerDetails {
  name: string;
  phone: string;
  email?: string;
}

export interface MidtransCreateTokenBody {
  items: MidtransItem[];
  customerDetails: MidtransCustomerDetails;
  grossAmount: number;
}

