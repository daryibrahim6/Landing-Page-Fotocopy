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

## 2026-09-12 (malam) — Upstash Blob integration + live Upstash verification

**Perubahan:**
- File upload berpindah dari Vercel Blob (public URL) ke **Upstash Blob private bucket** (`@upstash/blob`, `UPSTASH_BLOB_TOKEN`). Order menyimpan `blob:<key>`; admin membaca file via `GET /api/admin/files?key=…` → redirect signed URL 5 menit. `@vercel/blob` dihapus dari dependency.
- Fix serde bug `order-storage.ts` (CF-A-34): `get`/`mget` Upstash auto-deserialize — `JSON.parse` ganda dihapus; `set` mengirim object.
- Fix client-bundle leak (PD-A-07): `PRODUCTION_STATUSES`/`ProductionStatus` pindah ke `src/types/index.ts`; OrderTable tidak lagi menarik `order-storage` ke bundle browser.
- Fix `constants.ts`: `??` → `||` pada env fallback (string kosong `""` sekarang kena default — WA link tidak rusak).

**Verifikasi live (Upstash nyata, bukan mock):** upload → `blob:orders/…` ✓ · create-token → order di Redis ✓ · admin list + success page ✓ · `/api/admin/files` → 307 signed URL R2 (exp 300s) → file terunduh ✓ · unauth files/export → 401 ✓ · CSV export berisi order nyata ✓. Vitest 152/152, tsc/eslint clean.

**Impact cross-flow:** checkout-flow (upload contract berubah: `blob:` key, bukan URL publik), production-dashboard (file link → signed redirect; bundle client bersih).

**Keamanan:** bucket tetap private; token `UPSTASH_BLOB_TOKEN` server-only (BUKAN `NEXT_PUBLIC_`). Token Redis+Blob yang dipaste di chat = ter-expose → WAJIB di-rotate di dashboard Upstash setelah verifikasi.
