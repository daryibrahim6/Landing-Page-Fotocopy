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
| landing-page-flow | Core | Done (v2) | Done (v2) | Done | Done | N/A | Track B (opsional: component test) | Track C (opsional: polish) | CLEAR | 2026-09-12 | Track A v2 Tahap 0-2: 16 temuan — 14 FIXED, LP-A-09 ACK (portfolio tetap tampil, foto asli nanti), LP-A-23 DEFERRED (consent). Nav dead-link, footer 404, kategori↔filter, hero LCP, sitemap/robots, marquee pause, snap scoping — semua ditutup. 76 tests pass, build hijau. |
| checkout-flow | Core | Done | Done (v2) | Done | Done | N/A | Track B (opsional: component test) | N/A | CLEAR | 2026-09-12 | Track A v2 lengkap (Tahap 0-3): 19 temuan FIXED + route-level unit tests (72 pass total). Track Gate: E2E=Nanti (money path, kandidat #1), Track C tidak perlu, cross-flow whatsapp-notification diverifikasi. |
| whatsapp-notification-flow | Core | Done | Done | Done | Done | N/A | N/A | Done | LEGACY | 2026-09-08 | Notification helper + unit tests (`notification.test.ts`, `wa.test.ts`). Re-audit v2 pending. |
| design-simulator-flow | Core | Done | Done | Done | Done | N/A | N/A | Done | LEGACY | 2026-09-08 | Build, lint, test clean (`paper-sizes.test.ts`). Re-audit v2 pending. |
| production-dashboard-flow | Supporting | Done | Done | Belum | Belum | N/A | N/A | N/A | BACKLOG | 2026-09-08 | v2 — belum dibangun. |

**Kontrak coverage:** jumlah file di `reports/audit/*.md` = jumlah flow terdaftar. Saat ini 5 file = 5 flow (sudah di-split per-flow 12 Sep). Audit gabungan historis: `reports/archive/full-project-audit-2026-09-08.md`.

## Recently Completed

- **12 Sep 2026** — Migrasi workflow infra dari project lain: rules `.devin/` di-sync, `reports/` di-rebuild untuk flow BisaPrint, Playwright config terpasang (spec belum ada), konten referensi project lama diarsipkan ke `_archive/`. Audit di-split per-flow (5 file). **CF-A-10 FIXED**: Zod schemas di semua API routes (`src/lib/schemas.ts`). Coverage: `@vitest/coverage-v8` + config — `src/lib` 88.19% (46 tests pass).
- Audit per-flow di `reports/audit/` (5 file). Audit gabungan historis di `reports/archive/`.

## Open Items

1. **E2E Playwright** — infra ter-setup (`@playwright/test`, `playwright.config.ts`, `e2e/smoke.spec.ts`, chromium terinstall). Spec per-flow ditulis di sesi E2E tersendiri — **belum pernah di-run**.
2. **Production dashboard** — backlog v2 (`PD-A-01`).
3. **Pricing matrix depth** — multipliers ada (`src/lib/pricing.ts`), tapi belum per-produk granular untuk semua finishing; admin konfirmasi via WA tetap jalur final.
4. **WA Business API** — notifikasi otomatis ke customer (sekarang WA click-to-chat URL ke admin via `logNotification`).
5. **Design simulator ekspansi** — preflight/print layout untuk produk non-stiker (`DS-A-01`, RESOLVED-BY-DESIGN untuk MVP).
6. **Consent banner + privacy page** (LP-A-23, DEFERRED) — Pixel/GA fire tanpa opt-in; implement saat scale/mulai ads.
7. **Foto portfolio asli** (LP-A-09, ACK) — section tetap tampil dengan placeholder; user supply foto nanti.
