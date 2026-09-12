import { z } from "zod";

// Zod schemas untuk input validasi API routes (feature-architecture rule:
// "API routes WAJIB validasi input (Zod)").

export const midtransItemSchema = z.object({
  id: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  name: z.string().min(1),
});

export const createTokenBodySchema = z.object({
  items: z.array(midtransItemSchema).min(1),
  customerDetails: z.object({
    name: z.string().min(1),
    phone: z.string().min(8),
    email: z.string().email().optional(),
  }),
  grossAmount: z.number().positive(),
  specs: z.record(z.string(), z.string()).optional(),
  customerExtra: z
    .object({
      pickup: z.enum(["ambil", "kirim"]).optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

export const midtransWebhookBodySchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.string().min(1),
  status_code: z.string().min(1),
  gross_amount: z.string().min(1),
  signature_key: z.string().optional(),
});

export const orderIdSchema = z
  .string()
  .regex(/^BSP-[A-Z0-9-]+$/i, "Invalid order ID format");
