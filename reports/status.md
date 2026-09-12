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
- **Final**: `AMAN` / `CLEAR` / `IN PROGRESS` / `ADA ISU` / `BELUM` / `BACKLOG` / `DISTRIBUTED (...)`.
- Klaim `AMAN`/`CLEAR` wajib didukung bukti di audit file — bukan label mentah.

---

## Flow Tracker

| Flow | Tier | Scope | Audit | Fix | Vitest | E2E | Track B | Track C | Final | Last Update | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| landing-page-flow | Core | Done | Done | Done | Done | N/A | N/A | Done | CLEAR | 2026-09-08 | UI/UX overhaul: logo, navbar, hero, product images, layout. |
| checkout-flow | Core | Done | Done | Done | Done | N/A | N/A | Done | CLEAR | 2026-09-08 | 12 product SVGs, all products enabled, layout widened. |
| whatsapp-notification-flow | Core | Done | Done | Done | Done | N/A | N/A | Done | CLEAR | 2026-09-08 | Notification helper + unit tests (`src/lib/notification.test.ts`, `wa.test.ts`). |
| design-simulator-flow | Core | Done | Done | Done | Done | N/A | N/A | Done | CLEAR | 2026-09-08 | Build, lint, test clean (`paper-sizes.test.ts`). |
| production-dashboard-flow | Supporting | Done | Done | Belum | Belum | N/A | N/A | N/A | BACKLOG | 2026-09-08 | v2 — belum dibangun. |

**Kontrak coverage:** jumlah file di `reports/audit/*.md` = jumlah flow yang wajib tercover dalam rencana re-audit. Saat ini audit terdokumentasi lewat `reports/audit/full-project-audit.md` (audit gabungan); pecah per-flow saat re-audit v2 dimulai.

## Recently Completed

- **12 Sep 2026** — Migrasi workflow infra dari project lain: rules `.devin/` di-sync, `reports/` di-rebuild untuk flow BisaPrint, Playwright config terpasang (spec belum ada), konten referensi project lama diarsipkan ke `_archive/`.
- Full project audit di `reports/audit/full-project-audit.md`.

## Open Items

1. **Payment flow Wave 1** — order storage, WA admin notif, file upload, pricing matrix, form validation, Snap.js load.
2. **UI/UX Hybrid cleanup** — font display tweak, logo fallback, remove decorative assets, product images.
3. **Enable checkout** untuk lebih banyak produk.
4. **E2E Playwright** — infra ter-setup (`@playwright/test`, `playwright.config.ts`, `e2e/smoke.spec.ts`, chromium terinstall). Spec per-flow ditulis di sesi E2E tersendiri — **belum pernah di-run**.
5. **Production dashboard** — backlog v2.
