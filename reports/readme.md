# Struktur Folder `reports/`

Single source of truth untuk status, audit, test, dan dokumentasi pendukung project BisaPrint.

## Root (governance docs, di-track)

- `readme.md` — file ini. Penjelasan struktur folder.
- `status.md` — status akhir semua flow (Scope, Audit, Fix, Vitest, E2E, Track B/C, Final).
- `master-reference.md` — index rules, flow, file patokan, dan link ke panduan.

## Subfolder

| Folder | Isi |
|---|---|
| `workflow/` | Panduan eksekusi: `execution-guide.md`, `execution-guide-e2e-playbook.md`, `execution-guide-track-b.md`, `execution-guide-track-c.md`, `execution-guide-appendix-maintenance.md`, `qa-quick-reference.md`. |
| `audit/` | Audit & gap analysis per flow (`audit/{flow-name}-flow.md`). Flow BisaPrint: `landing-page-flow`, `checkout-flow`, `whatsapp-notification-flow`, `design-simulator-flow`, `production-dashboard-flow` (backlog). |
| `cross-audits/` | Audit lintas-flow / cross-cutting (UX sweep, functional completeness, vitest quality sweep, review-change-report). |
| `page-audits/` | Audit UI/UX per halaman/surface spesifik. |
| `test-scenarios/` | Skenario E2E / Vitest per flow. |
| `test-results/` | Hasil eksekusi test per flow. |
| `coverage/` | Laporan pure-logic coverage per flow. |
| `screenshots/` | Evidence UI/UX walkthrough (gitignored, jangan commit). |
| `mutation/` | Output mutation testing (gitignored, jangan commit). |
| `archive/` | Riwayat lama / artifact flow yang sudah tidak aktif. |

## Cara Mulai

Kalau baru mulai QA: `readme.md` → `master-reference.md` → `workflow/execution-guide.md`.

## Catatan `.gitignore`

- File `.md` di root dan subfolder **WAJIB di-track** karena dokumen project.
- `screenshots/`, `mutation/`, dan output generated lainnya **di-gitignore**.
