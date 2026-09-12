# STATUS — BisaPrint QA/QC & Flow Tracking

Single source of truth kondisi per flow. Detail temuan ada di `reports/audit/[flow].md`.
Vocabulary status mengikuti `.devin/rules/flow-registry-and-status.md`.

**Last updated:** 12 September 2026

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
| landing-page-flow | Core | Done (v2) | Done (v2) | Done | Done | N/A | Track B (opsional: component test jsdom) | Track C (opsional: polish) | CLEAR | 2026-09-12 | Track A v2 Tahap 0-3 lengkap: 16 temuan (14 FIXED, 1 ACK, 1 DEFERRED, 0 OPEN) + 100 unit tests (sitemap/robots/data-integrity/validation). Track Gate: E2E=Nanti, cross-flow checkout verified. |
| checkout-flow | Core | Done | Done (v2) | Done | Done | N/A | Track B (opsional: component test) | N/A | CLEAR | 2026-09-12 | Track A v2 lengkap (Tahap 0-3): 19 temuan FIXED + route-level unit tests (72 pass total). Track Gate: E2E=Nanti (money path, kandidat #1), Track C tidak perlu, cross-flow whatsapp-notification diverifikasi. |
| whatsapp-notification-flow | Core | Done (v2) | Done (v2) | Done | Done | N/A | Tidak | Tidak | CLEAR | 2026-09-12 | Track A v2 lengkap Tahap 0–3: 6 temuan FIXED. WA-A-04 → `ADMIN_NOTIFY_WEBHOOK_URL` (user approved). 111/111 tests, single-source guard WA-A-03. Non-blocking: env webhook kosong = log-only (isi untuk delivery real), E2E skipped. |
| design-simulator-flow | Core | Done (v2) | Done (v2) | Done | Done | N/A | Tidak | Track C (canvas UX opsional) | CLEAR | 2026-09-12 | Track A v2 lengkap Tahap 0–3: 9 FIXED + 1 ACK (DS-A-08 MVP limit). 118/118 tests (guard ≤0 + deterministic rotation + mm↔px). Non-blocking: estimasi harga indikatif (disclaimer), E2E skipped. |
| production-dashboard-flow | Supporting | Done (v2) | Done (v2) | Done | Done | N/A | Tidak | Track C (opsional: polish) | CLEAR | 2026-09-12 | Track A v2 lengkap Tahap 0–3: dashboard dibangun — `/admin/orders` (SSR + client pagination/status), `GET /api/admin/orders` + `PATCH /api/admin/orders/[id]` (Zod), Basic Auth `proxy.ts` + re-check per-handler (fail-closed `ADMIN_*`), `listOrders` + `production.status` terpisah dari webhook state machine. 5 temuan: 4 FIXED + 1 ACK. 143/143 tests (+26), live-verified 401, cross-flow checkout/webhook hijau. Non-blocking: isi `ADMIN_USERNAME`/`ADMIN_PASSWORD` + `ADMIN_NOTIFY_WEBHOOK_URL` untuk operasional; E2E Nanti; Basic Auth = MVP (upgrade session login kalau multi-user). |

**Kontrak coverage:** jumlah file di `reports/audit/*.md` = jumlah flow terdaftar. Saat ini 5 file = 5 flow (sudah di-split per-flow 12 Sep). Audit gabungan historis: `reports/archive/full-project-audit-2026-09-08.md`.

## Recently Completed

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
