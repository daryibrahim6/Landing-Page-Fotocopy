# Audit — production-dashboard-flow

**Tier:** Supporting | **Prefix ID:** `PD`
**Status:** Track A Tahap 0+1+2 selesai — **dashboard sudah dibangun** (Basic Auth MVP). Tahap 3 (Unit Test + Track Gate) menyusul.

**Implementasi (Tahap 2):** `/admin` → `/admin/orders` (server component + `OrderTable` client untuk status/paginasi). API: `GET /api/admin/orders` (paginated), `PATCH /api/admin/orders/[id]` (production status). Auth: Basic Auth via `src/lib/admin-auth.ts` — dicek di `src/proxy.ts` (Next 16: middleware→proxy) **dan** ulang di tiap route handler (defense in depth). Fail-closed: `ADMIN_USERNAME`/`ADMIN_PASSWORD` kosong → 401.

---

## Scope (Tahap 0 — Frozen, untuk build masa depan)

### User Story / Business Rules (target state)

- **Admin bisa:** login → lihat daftar order masuk → lihat detail (produk, customer, file URL, status bayar) → update status produksi.
- **Roles:** admin (satu role, shared credential MVP) vs anonymous visitor (tidak boleh akses).
- **Output yang wajib benar:**
  1. Route admin + API admin wajib ter-proteksi — bukan cuma redirect UI.
  2. List order menampilkan status real dari `order-storage` (bukan stale).
  3. Status transition konsisten dengan state machine webhook (pending→paid→expired/cancelled; paid tidak boleh regress).
  4. Data customer (nama, phone, file) hanya terlihat admin.

### Boundary IN (saat dibangun)

| Area | Target |
|---|---|
| Pages | `/admin/login`, `/admin/orders`, `/admin/orders/[id]` |
| API | `GET /api/admin/orders` (list+pagination), `GET /api/admin/orders/[id]`, `PATCH /api/admin/orders/[id]` (status produksi) |
| Auth | Middleware/guard admin — shared secret atau Basic Auth minimum |
| Shared | `order-storage.ts` (read path — list function belum ada) |

### Boundary OUT

| Area | Kenapa OUT |
|---|---|
| Order creation/payment/webhook | checkout-flow (sudah CLEAR) |
| Admin notification delivery | whatsapp-notification-flow (sudah CLEAR) |
| Upload file customer | `/api/upload` (checkout-flow) |

### Risiko & Prioritas

| Risiko | Skenario paling berisiko |
|---|---|
| **Unauthenticated admin route** | Matcher middleware `/admin/*` TIDAK match `/api/admin/*` (riset Securie: bug paling umum) → API bocor |
| Interim: zero order visibility | Kalau `ADMIN_NOTIFY_WEBHOOK_URL` kosong → admin tidak punya cara lihat order sama sekali |
| IDOR success page | `/checkout/success?orderId=X` expose nama/total ke siapapun yang punya ID |
| List endpoint tanpa pagination | Order 10x → load semua → lambat |

**Vitest vs E2E:** auth guard + list/status-transition logic → Vitest (route tests, pola `route.test.ts` sudah ada). Full admin journey → E2E (skipped).

---

## Temuan Track A (Tahap 1)

### Carry-over

| ID | Sev | Status |
|---|---|---|
| PD-A-01 tidak ada production dashboard | P0 | **FIXED** — `/admin/orders` + `/api/admin/orders` dibangun (Tahap 2) |

### Temuan Baru

---

#### PD-A-02 — `src/app/api/checkout/` direktori kosong (dead placeholder)

- **Severity:** P4
- **Skenario:** Direktori `src/app/api/checkout/` ada tapi tidak berisi file — residu refactor. Next.js mengabaikannya, tapi membingungkan pembaca struktur.
- **Bukti:** `find src/app/api -type f` — hanya `midtrans/create-token`, `midtrans/webhook`, `upload` yang punya file.
- **Risiko:** Cosmetic/docs drift.
- **Opsi:** (a) Hapus direktori. (b) Biarkan.
- **Rekomendasi Devin:** (a) — `git` tidak track dir kosong; kalau direktori ada di filesystem lokal saja, cukup hapus lokal.
- **Future gap tag:** none
- **Status:** FIXED — direktori `src/app/api/checkout/` dihapus (filesystem-local, git tidak pernah track).

---

#### PD-A-03 — Interim: visibilitas order admin bergantung pada 1 env webhook

- **Severity:** P2
- **Skenario:** Sebelum dashboard ada, satu-satunya jalur admin tahu order = notifikasi WA (`dispatchAdminNotification`). Kalau `ADMIN_NOTIFY_WEBHOOK_URL` tidak diisi → order hanya ada di Vercel function logs + storage. Single point of failure untuk awareness.
- **Bukti:** `src/lib/notification.ts` dispatch; tidak ada list-orders endpoint.
- **Risiko:** Order masuk tapi admin tidak sadar (mitigasi WA-A-04 perlu env diisi).
- **Opsi:**
  - (a) Isi `ADMIN_NOTIFY_WEBHOOK_URL` sekarang → mitigasi interim (murah, hari ini).
  - (b) Build dashboard → fix permanen.
- **Rekomendasi Devin:** (a) sekarang + (b) backlog — bukan mutually exclusive.
- **Future gap tag:** monitoring, infra
- **Status:** FIXED — opsi (b) dieksekusi: dashboard = jalur visibilitas permanen yang tidak bergantung env webhook. Catatan: notifikasi push proaktif tetap butuh `ADMIN_NOTIFY_WEBHOOK_URL` (tracked di whatsapp-notification-flow sebagai non-blocking ops).

---

#### PD-A-04 — Build contract: prereq yang wajib saat dashboard dibangun

- **Severity:** P2 (bukan bug — kontrak desain)
- **Skenario:** Saat flow dibangun, hal-hal ini WAJIB ada atau temuan baru muncul:
  1. **Auth guard** — middleware Basic Auth / shared-secret cookie. Riset (Securie + Next.js docs): matcher HARUS cover `/admin/:path*` **DAN** `/api/admin/:path*` — bug paling umum adalah `/admin` diproteksi tapi `/api/admin` tidak. Role check, bukan sekadar "ada session".
  2. **`listOrders()` di `order-storage.ts`** — belum ada; perlu pagination (Upstash SCAN/keys + cursor).
  3. **Status produksi** — field baru (`production.status`: `baru/diproses/selesai/diambil`) terpisah dari `payment.status`; jangan tabrakan state machine webhook.
  4. **fileUrl access** — URL Blob publik vs signed; pertimbangkan expiry.
- **Bukti:** `src/lib/order-storage.ts` — hanya `saveOrder`, `getOrder`, `getOrderByMidtransOrderId`, `updateOrderStatus`; tidak ada list.
- **Rekomendasi Devin:** Simpan sebagai contract; tiap item jadi temuan kalau dilanggar saat build.
- **Future gap tag:** security, scale
- **Status:** FIXED — kontrak terpenuhi saat build (Tahap 2):
  1. ✅ Proxy matcher `["/admin/:path*", "/api/admin/:path*"]` + re-check `isAdminRequest` di tiap handler → live-verified 401 untuk `/admin`, `/admin/orders`, `/api/admin/orders`.
  2. ✅ `listOrders(limit, cursor)` — Redis sorted-set `order:index` (score=createdAt) + in-memory fallback, clamp 1–100, offset cursor.
  3. ✅ `production.status` (`baru/diproses/selesai/diambil`) terpisah dari `payment.status`; `updateProductionStatus` tidak menyentuh state machine webhook.
  4. ✅ fileUrl dirender sebagai link `rel="noopener noreferrer"` — Blob public URL (accepted: URL unguessable, sama dengan pola PD-A-05).

---

#### PD-A-05 — Success page expose detail order by orderId (IDOR ringan)

- **Severity:** P4
- **Skenario:** `/checkout/success?orderId=BSP-…` menampilkan nama produk + total + status ke **siapapun yang punya ID** — tanpa auth. ID `BSP-<ts>-<rand>` unguessable sehingga risiko rendah, tapi customer phone/name tidak ditampilkan (sudah benar) — hanya produk/total/status.
- **Bukti:** `src/app/checkout/success/page.tsx:38-47`.
- **Risiko:** Rendah — ID unguessable, data yang tampil tidak sensitif.
- **Opsi:** (a) Biarkan (standar e-commerce). (b) Hanya tampil saat session baru checkout — kompleks, tidak worth.
- **Rekomendasi Devin:** (a) — catat saja sebagai accepted surface; revisit kalau dashboard expose data lebih.
- **Future gap tag:** security
- **Status:** ACK

---

## Riset Eksternal (Tahap 1 — wajib)

| Area | Current approach | Best practice (sumber) | Gap? |
|---|---|---|---|
| Admin route protection | Belum ada | Middleware Basic Auth/shared-secret; matcher cover page **dan** `/api/admin/*` (Securie: matcher `/admin` ≠ `/api/admin` = bug paling umum); role check bukan sekadar session ada (Next.js docs auth guide) | **Ya → PD-A-04 contract** |
| DB check di middleware | N/A | Jangan query DB di Edge middleware — optimistic cookie check saja, granular check di route handler (DEV/Nainik, Juanchi Next.js 16) | Contract item |
| List orders | Tidak ada `listOrders` | Pagination + cursor untuk list endpoint | **Ya → PD-A-04** |
| Admin visibility | WA notif + logs | Dedicated admin surface (dashboard) atau minimal outbound webhook ke tool monitoring | **Ya → PD-A-03** |

## 5 Kelas Blind Spot — cross-check (interim state)

| Kelas | Temuan |
|---|---|
| Stale Reference | PD-A-02 (dead dir) |
| Concurrent/Race | Status produksi vs webhook state machine → contract PD-A-04 #3 |
| Time-Based Transition | Order expired di storage tapi admin tidak lihat → PD-A-03 |
| Partial Failure | Notif gagal → order invisible → PD-A-03 |
| Cross-User Cache | List endpoint future: jangan cache antar admin request → contract |

## Test Coverage (catatan)

- Belum ada yang di-test (fitur belum ada).
- Saat build: auth guard tests (401/403/200), listOrders pagination, PATCH status produksi — pola `route.test.ts` yang sudah ada.

---

## Fix Log (Tahap 2)

| Gap | Fix |
|---|---|
| PD-A-01 | `/admin` → redirect `/admin/orders`; `src/app/admin/orders/page.tsx` (force-dynamic, SSR first page via `listOrders`); `src/components/admin/OrderTable.tsx` (status select → PATCH, optimistic update + rollback, "Muat lebih" cursor pagination) |
| PD-A-03 | Dashboard menghilangkan single-point-of-failure webhook env; push-alert tetap opsional |
| PD-A-04 | Auth: `src/lib/admin-auth.ts` (`isAdminRequest` Basic Auth, Edge-safe `atob`, fail-closed) dipakai `src/proxy.ts` + kedua route handler. Storage: `order:index` sorted set + `listOrders` + `updateProductionStatus`. API: `GET /api/admin/orders`, `PATCH /api/admin/orders/[id]` (Zod: `adminListQuerySchema`, `adminProductionPatchSchema`). Env: `ADMIN_USERNAME`/`ADMIN_PASSWORD` ditambah ke `.env.local.example` |

**Files:** `src/lib/admin-auth.ts`, `src/proxy.ts`, `src/lib/order-storage.ts` (+index/list/production), `src/lib/schemas.ts`, `src/app/api/admin/orders/route.ts`, `src/app/api/admin/orders/[id]/route.ts`, `src/app/admin/page.tsx`, `src/app/admin/orders/page.tsx`, `src/components/admin/OrderTable.tsx`, `.env.local.example`. Tests: `admin-auth.test.ts` (9), `order-storage.test.ts` (+6), `api/admin/orders` route tests (7).

**Verified:** `tsc` clean · `eslint` 0 · vitest 139/139 · `next build` hijau (`ƒ Proxy` registered, `/admin/orders` dynamic) · live curl: `/` 200, `/admin` 401 + `WWW-Authenticate`, `/admin/orders` 401, `/api/admin/orders` 401.

## Rekap

| Severity | Count | IDs |
|---|---|---|
| P0 | 1 | PD-A-01 (FIXED — dashboard built) |
| P2 | 2 | PD-A-03 (FIXED — visibility via dashboard; push-alert env tetap opsional), PD-A-04 (FIXED — contract fulfilled) |
| P4 | 2 | PD-A-02 (FIXED — dead dir dihapus), PD-A-05 (ACK — accepted surface) |
