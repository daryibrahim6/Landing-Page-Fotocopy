import { z } from "zod";

// Zod schemas untuk input validasi API routes (feature-architecture rule:
// "API routes WAJIB validasi input (Zod)").

// Normalisasi nomor WA ke format internasional (62...): "0812x" -> "62812x", "812x" -> "62812x".
export const phoneSchema = z
  .string()
  .regex(/^[0-9]{9,15}$/, "No. WhatsApp tidak valid")
  .transform((p) => (p.startsWith("0") ? `62${p.slice(1)}` : p.startsWith("8") ? `62${p}` : p));

// Create-token: client sends WHAT they want (product + specs + qty); the server
// recomputes pricing — client-supplied amounts are never trusted (OWASP: never
// accept totals/prices from the client).
export const createTokenBodySchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  material: z.string().min(1),
  finishing: z.string().min(1),
  quantity: z.number().int().min(1).max(9999),
  fileUrl: z.string().max(2000).optional(),
  customerDetails: z.object({
    name: z.string().min(1).max(200),
    phone: phoneSchema,
    email: z.string().email().optional().or(z.literal("")),
  }),
  customerExtra: z
    .object({
      pickup: z.enum(["ambil", "kirim"]).optional(),
      address: z.string().max(500).optional(),
      notes: z.string().max(1000).optional(),
    })
    .optional(),
});

export const midtransWebhookBodySchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.string().min(1),
  status_code: z.string().min(1),
  gross_amount: z.string().min(1),
  signature_key: z.string().optional(),
  fraud_status: z.string().optional(),
  payment_type: z.string().optional(),
});

export const orderIdSchema = z
  .string()
  .regex(/^BSP-[A-Z0-9-]+$/i, "Invalid order ID format");
