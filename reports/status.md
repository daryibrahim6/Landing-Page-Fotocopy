# STATUS — BisaPrint QA/QC & Flow Tracking

Single source of truth kondisi per flow. Detail temuan ada di `reports/audit/[flow].md`.
Vocabulary status mengikuti `.devin/rules/flow-registry-and-status.md`.

**Last updated:** 12 September 2026

> **Milestone 7 (feedback owner) terkirim — commit `56733f0`:** etalase dipangkas ke 7 produk + card "Produk Lainnya", upload preview kini tile design ke semua cell, fix math imposition (gap antar-cell), harga per-lembar tier (placeholder — tunggu price list owner), AI draft via Pollinations (gratis, tanpa key), kode order BSP-XXXX di WA checkout. 157/157 tests, build hijau.

---

## Legenda

- **Scope** — Tahap 0: apakah boundary flow sudah dibekukan (IN/OUT, halaman/API kritis, business rules).
- **Audit / Fix / Vitest** — Track A.
- **E2E** — Playwright integration testing. `N/A` = spec belum ditulis (Playwright ter-setup, suite belum ada).
- **Track B / Track C** — Vitest deep dive / UI-UX walkthrough, opsional per Track Gate.
- **Final**: `AMAN` / `CLEAR` / `IN PROGRESS` / `ADA ISU` / `BELUM` / `BACKLOG` / `LEGACY` / `DISTRIBUTED (...)`.
- Klaim `AMAN`/`CLEAR` wajib didukung bukti di audit file — bukan label mentah.
- **`LEGACY`** = flow jalan & terverifikasi (tests/build/runtime hijau), tapi auditnya predates workflow v2 (re-audit Track A diperlukan untuk naik ke `CLEAR`/`AMAN`). Bukan berarti rusak — ini titik awal yang jujur.

---

## Flow Tracker

| Flow | Tier | Scope | Audit | Fix | Vitest | E2E | Track B | Track C | Final | Last Update | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| landing-page-flow | Core | Done (v2) | Done (v2) | Done | Done | N/A | Track B (opsional: component test jsdom) | Done (UX-0) | CLEAR | 2026-09-12 | Track A v2 Tahap 0-3 lengkap: 16 temuan (14 FIXED, 1 ACK, 1 DEFERRED, 0 OPEN) + 100 unit tests (sitemap/robots/data-integrity/validation). UX-0 sweep: landing findings FIXED (A-03 emoji→Lucide, B-03/04/07/09). Track Gate: E2E=Nanti. |
| checkout-flow | Core | Done | Done (v2) | Done | Done | N/A | Track B (opsional: component test) | Done (UX-0) | CLEAR | 2026-09-12 | Track A v2 lengkap (Tahap 0-3): 19 temuan FIXED + route-level unit tests. UX-0: A-02 aria-label, A-05 role=alert ×5, B-02/05/06/10 FIXED. Track Gate: E2E=Nanti (money path, kandidat #1). |
| whatsapp-notification-flow | Core | Done (v2) | Done (v2) | Done | Done | N/A | Tidak | Tidak | CLEAR | 2026-09-12 | Track A v2 lengkap Tahap 0–3: 6 temuan FIXED. WA-A-04 → `ADMIN_NOTIFY_WEBHOOK_URL` (user approved). 152/152 tests, single-source guard WA-A-03. Non-blocking: env webhook kosong = log-only (isi untuk delivery real), E2E skipped. |
| design-simulator-flow | Core | Done (v2) | Done (v2) | Done | Done | N/A | Tidak | Done (UX-0) | CLEAR | 2026-09-12 | Track A v2 lengkap Tahap 0–3: 9 FIXED + 1 ACK (DS-A-08 MVP limit). UX-0: A-01 alert→inline error, A-04 keyboard dropzone, A-07 single-diameter, B-01/02/03/07 FIXED. Non-blocking: estimasi harga indikatif (disclaimer), E2E skipped. |
| production-dashboard-flow | Supporting | Done (v2) | Done (v2) | Done | Done | N/A | Tidak | Done (UX-0) | CLEAR | 2026-09-12 | Track A v2 lengkap Tahap 0–3: dashboard dibangun — `/admin/orders` (SSR + client pagination/status), `GET /api/admin/orders` + `PATCH /api/admin/orders/[id]` (Zod), Basic Auth `proxy.ts` + re-check per-handler (fail-closed `ADMIN_*`), `listOrders` + `production.status` terpisah dari webhook state machine. UX-0: B-08 admin tanpa chrome marketing (route group `(public)`), B-11 skeleton load, A-06 FAB out of admin FIXED. 152/152 tests, live-verified 401. Non-blocking: E2E Nanti; Basic Auth = MVP (upgrade session login kalau multi-user). |

**Kontrak coverage:** jumlah file di `reports/audit/*.md` = jumlah flow terdaftar. Saat ini 5 file = 5 flow (sudah di-split per-flow 12 Sep). Audit gabungan historis: `reports/archive/full-project-audit-2026-09-08.md`.

**Functional Completeness Sweep (UX-0.5):** Done — `reports/cross-audits/functional-completeness-sweep.md` (12 Sep 2026). 15 gap (1 Critical + 3 High + 4 Medium + 7 Low). Fixed: FC-01 (order WA tidak tersimpan → `POST /api/orders` + `payment.method`), FC-02 (FAQ garansi/revisi), FC-03 (trust line checkout), FC-04 (status produksi "batal"). Menunggu data/keputusan owner: rekening bank (FC-07), tarif kirim (FC-05), auto-confirm budget (FC-15).

## Recently Completed

- **12 Sep 2026 (malam)** — **UX-0.5 Functional Completeness Sweep + fix batch:** audit persona Customer+Admin × 7 kategori → 15 gap. Fix dieksekusi: `POST /api/orders` (order WA-only kini tercatat — `payment.method: "whatsapp"`, badge "via WA" di dashboard, notif admin terpicu, success page bisa lookup), `buildStoredOrder`/`generateOrderId` dipindah ke `src/lib/orders.ts` (shared create-token + orders), status produksi "batal", FAQ +2 (garansi, revisi), trust line checkout, AI panel resilience (timeout 120s + retry + `referrer`/`private` params — root cause: antrean anonymous Pollinations 30-60s). 161/161 tests, tsc/eslint clean, live-verified.

- **12 Sep 2026 (malam)** — **UX-0 batch fix: 18/18 temuan dieksekusi** (7 A + 11 B). Route group `(public)/` untuk pisah admin dari chrome marketing; `alert()` → inline `role="alert"`; emoji → Lucide; dropzone keyboard-operable; single-diameter input; `min-h-11` touch targets; `autoComplete`/`maxLength`/`fieldset`+`legend` form semantics; focus ring kontras di CTA berwarna; skeleton OrderTable; em-dash → en-dash. 152/152 tests, tsc/eslint/build hijau, visual verify admin+simulator. Laporan: `reports/cross-audits/cross-flow-ux-sweep.md`.
- **12 Sep 2026 (sore)** — Ops hardening pass: order TTL hanya `pending` (terminal permanen — fix data-loss CF-A-32), `saveOrder` fail-fast di production tanpa Upstash (CF-A-24 upgraded), rate limit `create-token` 10/10m per IP (CF-A-33), export CSV `GET /api/admin/orders/export` + tombol admin (PD-A-06), banner in-memory di dashboard, `@vercel/kv` dihapus, env admin lokal diisi, docs sync (PROJECT/master-reference/milestones). 148/148 tests.
- **12 Sep 2026** — Migrasi workflow infra dari project lain: rules `.devin/` di-sync, `reports/` di-rebuild untuk flow BisaPrint, Playwright config terpasang (spec belum ada), konten referensi project lama diarsipkan ke `_archive/`. Audit di-split per-flow (5 file). **CF-A-10 FIXED**: Zod schemas di semua API routes (`src/lib/schemas.ts`). Coverage: `@vitest/coverage-v8` + config — `src/lib` 88.19% (46 tests pass).
- Audit per-flow di `reports/audit/` (5 file). Audit gabungan historis di `reports/archive/`.

## Open Items

1. **E2E Playwright** — infra ter-setup (`@playwright/test`, `playwright.config.ts`, `e2e/smoke.spec.ts`, chromium terinstall). Spec per-flow ditulis di sesi E2E tersendiri — **belum pernah di-run**.
2. **Pricing matrix depth** — multipliers ada (`src/lib/pricing.ts`), tapi belum per-produk granular untuk semua finishing; admin konfirmasi via WA tetap jalur final.
3. **WA Business API** — notifikasi otomatis ke customer (sekarang WA click-to-chat URL ke admin via `logNotification`).
4. **Design simulator ekspansi** — preflight/print layout untuk produk non-stiker (`DS-A-01`, RESOLVED-BY-DESIGN untuk MVP).
5. **Consent banner + privacy page** (LP-A-23, DEFERRED) — Pixel/GA fire tanpa opt-in; implement saat scale/mulai ads.
6. **Foto portfolio asli** (LP-A-09, ACK) — section tetap tampil dengan placeholder; user supply foto nanti.
7. **Env produksi** — `UPSTASH_REDIS_*`, `UPSTASH_BLOB_TOKEN`, `MIDTRANS_*`, `ADMIN_*` wajib diisi di environment deploy; lokal sudah ada kredensial admin dev + Upstash Redis/Blob nyata (terverifikasi live 12 Sep).
8. **Backup order → Google Sheets** (opsional) — `ADMIN_NOTIFY_WEBHOOK_URL` → n8n/Make → Sheets; env ada, butuh setup external.
9. **Migrasi DB relasional** (Supabase/dsb) — ditunda; re-evaluasi saat butuh order history multi-tahun / customer account / CMS produk.
