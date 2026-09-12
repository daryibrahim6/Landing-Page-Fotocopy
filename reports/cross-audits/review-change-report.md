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

## 2026-09-12 — Milestone 7: batch feedback owner + visi pipeline v1

**Shared file:** `src/data/products.ts` (landing katalog, checkout `?product=`, FormKonsultasi dropdown, create-token validation) · `src/lib/paper-sizes.ts` (kalkulator + upload canvas + export PDF) · `src/lib/pricing.ts` (checkout total + simulator estimasi).

| Perubahan | Dampak ke flow | Bukti/test |
|---|---|---|
| Etalase 12→7 produk + card "Produk Lainnya"; kategori `dtf-apparel` dihapus dari union type | landing-page (grid+tabs+kategori), checkout (fixture `packaging` jadi isCheckoutEnabled=false), konsultasi (dropdown auto) | integrity.test 10/10; create-token test fixture diupdate |
| `calculateImposition`: gap hanya antar-cell (`floor((W+g)/(d+g))`) | design-simulator (kalkulator, upload canvas, export PDF semua pakai fungsi ini) — boundary size kini benar (305mm→1pcs, dulu 0) | paper-sizes.test.ts 15 tests incl. boundary baru |
| DesignCanvas: design upload tile ke semua cell (bukan ghost), cell-0 transformable | design-simulator upload mode — preview = imposisi real | visual verify screenshot `verify-upload-tiled-desktop.png` |
| Export PDF siap-cetak (gambar asli per cell + cutline + siku) | design-simulator — output langsung naik cetak | Playwright: download valid `%PDF-` 24KB |
| `STICKER_SHEET_TIERS` + `sheetUnitPrice`/`sheetTotalPrice` | design-simulator estimasi harga kini tier per-lembar; checkout `calculatePrice` tak berubah | pricing.test.ts +4 tier tests |
| AI draft (Pollinations, tanpa key) + kode order `BSP-XXXX` di WA checkout | design-simulator (panel Coba AI), checkout-flow + whatsapp-flow (pesan wa-only ada kode matching mutasi) | manual verify; error path `role=alert` |

**Cross-check:** vitest 157/157 · tsc clean · eslint clean · build hijau · live routes 200 · link `?product=` lama → fallback graceful.

## 2026-09-12 — UX-0.5 sweep + order persistence fix

**Shared file:** `src/lib/order-storage.ts` (StoredOrder.payment — field `method` + `midtransOrderId` optional) dipakai checkout-flow (create-token, webhook, success) + production-dashboard (list, PATCH, export). `src/lib/orders.ts` BARU — `generateOrderId` + `buildStoredOrder` shared oleh create-token dan `/api/orders`.

| Perubahan | Dampak ke flow | Bukti/test |
|---|---|---|
| `POST /api/orders` — order WA-only kini tersimpan (`method: "whatsapp"`) | checkout-flow (FC-01: BSP code tidak lagi yatim), production-dashboard (order WA terlihat + badge), whatsapp-flow (pesan membawa orderId server) | route.test.ts 4 tests; live: `BSP-MTYBZ09V-FA014BA3` FOUND di `/api/admin/orders`, success page 200 |
| `payment.method` + `midtransOrderId` optional | webhook lookup tidak terpengaruh (WA order tak punya midtransOrderId → tidak match webhook — benar) | order-storage.test.ts hijau |
| `PRODUCTION_STATUSES` + "batal" | production-dashboard (admin bisa tandai order gagal/phantom WA) | PATCH schema pakai enum shared |
| FAQ +2 (garansi, revisi) + trust line checkout | landing-page (trust), checkout-flow (reassurance pre-submit) | integrity.test hijau |
| AI panel: timeout 120s + retry×1 + referrer/private | design-simulator (error palsu saat antrean 30-60s berkurang) | manual: endpoint verified live 200 |

**Cross-check:** vitest 161/161 · tsc clean · eslint clean · live POST→dashboard→success verified.
