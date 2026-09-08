import { products } from "@/data/products";

export interface PricingResult {
  subtotal: number;
  total: number;
  breakdown: string;
}

const SIZE_MULTIPLIERS: Record<string, number> = {
  A4: 1,
  A5: 0.7,
  A6: 0.55,
  A3: 1.8,
  A2: 3.5,
  Custom: 1.2,
  Standard: 1,
};

const MATERIAL_MULTIPLIERS: Record<string, number> = {
  "HVS 80gsm": 1,
  "HVS 100gsm": 1.1,
  "Art Paper 120gsm": 1.3,
  "Art Paper 150gsm": 1.5,
  "Art Carton 210gsm": 1.8,
  "Art Carton 260gsm": 2.1,
  "Art Carton 250gsm": 2,
  "Art Carton 300gsm": 2.4,
  "Linen": 2.2,
  "Concorde": 2,
  "Samson Kraft": 1.6,
  "Stiker Chromo": 1.8,
  "Stiker Vinyl Matte": 2.2,
  "Stiker Vinyl Glossy": 2.2,
  "Stiker HVS": 1.2,
  "Stiker Silver Matte": 2.5,
  "Stiker Gold": 2.5,
  "DTF Print": 1,
  "Polyflex": 1.1,
};

const FINISHING_MULTIPLIERS: Record<string, number> = {
  "Tanpa finishing": 1,
  Glossy: 1.1,
  Matte: 1.1,
  Laminasi: 1.25,
  "Jilid spiral": 1.15,
  "Jilid softcover": 1.35,
  "Jilid hard cover": 1.8,
  "Spot UV": 1.3,
  Foil: 1.4,
  Emboss: 1.4,
  "Mata itik": 1.2,
  "Pole pocket": 1.15,
  "Lis aluminium": 1.5,
  "Press + Cutting": 1,
};

export function calculatePrice(productId: string, size: string, material: string, finishing: string, quantity: number): PricingResult {
  const product = products.find((p) => p.id === productId);
  if (!product) return { subtotal: 0, total: 0, breakdown: "" };

  const base = product.priceFrom;
  const sizeMultiplier = SIZE_MULTIPLIERS[size] ?? 1;
  const materialMultiplier = MATERIAL_MULTIPLIERS[material] ?? 1;
  const finishingMultiplier = FINISHING_MULTIPLIERS[finishing] ?? 1;

  // Unit price = base * multipliers, rounded to nearest 100
  const unitPrice = Math.ceil(base * sizeMultiplier * materialMultiplier * finishingMultiplier / 100) * 100;
  const subtotal = unitPrice * quantity;

  return {
    subtotal,
    total: subtotal,
    breakdown: `${formatRupiah(unitPrice)} x ${quantity} ${product.unit}`,
  };
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}
