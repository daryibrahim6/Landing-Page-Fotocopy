# Review Change Report — Cross-Flow

Ringkasan perubahan yang menyentuh lebih dari satu flow. Update setiap ada perubahan lintas-flow.

---

## 2026-09-12 — Ops hardening (order retention, prod guard, export)

**Shared file:** `src/lib/order-storage.ts` — dipakai `checkout-flow` (create-token, webhook, success page) dan `production-dashboard-flow` (list, PATCH status, export).

| Perubahan | Dampak ke flow | Bukti/test |
|---|---|---|
| TTL 30d kini hanya untuk `payment.status === "pending"`; terminal tanpa TTL | checkout-flow (CF-A-32), production-dashboard (arsip permanen untuk export) | `order-storage.test.ts` hijau; logika Redis-side |
| `saveOrder` throw saat `NODE_ENV=production` && no Redis | checkout-flow (CF-A-24 upgraded — create-token 500 → WA fallback client), production-dashboard (banner in-memory via `isPersistentStorage()`) | 2 test baru di `order-storage.test.ts` |
| `isPersistentStorage()` export baru | production-dashboard (banner) | render di `admin/orders/page.tsx` |
| Rate limit `create-token` 10/10m per IP | checkout-flow (CF-A-33) | pola identik `api/upload`; tidak unit-test (Redis mock) |
| `GET /api/admin/orders/export` (CSV) + tombol | production-dashboard (PD-A-06) | `export/route.test.ts` 3 tests |

**Cross-check:** vitest 148/148 · tsc clean · tidak ada signature berubah pada API `order-storage` yang dipakai flow lain (tambahan: `isPersistentStorage` saja).
