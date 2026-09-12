# Audit — checkout-flow

**Tier:** Core | **Prefix ID:** `CF`
**Scope IN:** `src/app/checkout/*` (page + success), `CheckoutForm`, `/api/midtrans/create-token`, `/api/midtrans/webhook`, `/api/orders/[orderId]`, `/api/upload`, `src/lib/order-storage.ts`, `src/lib/pricing.ts`, `src/lib/midtrans.ts`, `src/lib/schemas.ts`, `src/data/products.ts` (shared read: harga/opsi)
**Scope OUT:** konten landing page, simulator canvas, dashboard admin
**Last audit:** 2026-09-08 (gabungan) → di-split ke file ini 2026-09-12. Re-audit v2 belum dijalankan.

## Temuan (carry-over dari full-project-audit-2026-09-08 + verifikasi 12 Sep)

| ID | Sev | Temuan | Status | Bukti resolusi |
|---|---|---|---|---|
| CF-A-01 (ex PMT-A-001) | P0 | Tidak ada order storage — webhook cuma log | ✅ FIXED | `src/lib/order-storage.ts` — Upstash Redis + in-memory fallback; `updateOrderStatus` dipanggil webhook |
| CF-A-02 (ex PMT-A-002) | P0 | Webhook tidak kirim WA notif admin | ✅ FIXED | `src/lib/notification.ts` — `notifyAdminNewOrder`/`notifyAdminPaidOrder` dipanggil di `webhook/route.ts` |
| CF-A-03 (ex PMT-A-003) | P1 | Tidak ada file upload di checkout | ✅ FIXED | `/api/upload` (Vercel Blob) + input file di `CheckoutForm.tsx` (PDF/PNG/JPG/WEBP, max 10MB) |
| CF-A-04 (ex PMT-A-004) | P1 | Kalkulasi harga cuma `priceFrom * quantity` | ✅ FIXED | `src/lib/pricing.ts` — SIZE_MULTIPLIERS + MATERIAL_MULTIPLIERS |
| CF-A-05 (ex PMT-A-005) | P1 | Hanya 3/12 produk bisa checkout | ✅ FIXED | 11/12 produk `isCheckoutEnabled: true` di `src/data/products.ts` |
| CF-A-06 (ex PMT-A-006) | P2 | Checkout tidak ada validasi input | ✅ FIXED | Validasi inline di `CheckoutForm.tsx` (errors object, `text-red-500`) |
| CF-A-07 (ex PMT-A-007) | P2 | snap.js tidak di-load via `next/script` | ✅ FIXED | `src/app/layout.tsx` — Script `midtrans-snap` global |
| CF-A-08 (ex BLU-A-002) | P0 | Tidak ada flow upload design → preview | ✅ FIXED | Upload inline di checkout (preview = file name + URL tersimpan) |
| CF-A-09 (ex BLU-A-004) | P2 | Order number tidak standar | ✅ FIXED | `generateOrderId()` → `BSP-[ts]-[rand]` di `src/lib/midtrans.ts` |

## Temuan Baru (verifikasi 12 Sep 2026)

| ID | Sev | Temuan | Bukti | Status |
|---|---|---|---|---|
| CF-A-10 | P2 | **API routes tidak pakai Zod.** `create-token` hanya cek field required manual; tidak ada schema validation untuk shape/tipe body. Melanggar `feature-architecture.md` ("API routes WAJIB validasi input (Zod)"). | `src/app/api/midtrans/create-token/route.ts` line 8-13; `zod` tidak ada di `package.json` (diverifikasi 12 Sep) | ✅ FIXED (12 Sep) — `src/lib/schemas.ts` (createTokenBodySchema, midtransWebhookBodySchema, orderIdSchema) diterapkan di `create-token`, `webhook`, `orders/[orderId]`; `zod` terinstall; 9 schema tests di `schemas.test.ts`. `/api/upload` tetap manual — allowlist MIME + size check sudah strict; Zod tidak menambah value pada `File` object. |

## Catatan

- Webhook: signature SHA512 verified, status mapping `capture/settlement→paid`, idempotent via `updateOrderStatus`.
- Track B/C/E2E: belum dijalankan untuk flow ini.
