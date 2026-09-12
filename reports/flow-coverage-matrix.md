# Flow Coverage Matrix — BisaPrint

Single source of truth mapping flow → batch audit → prioritas → next action.
Update setiap kali status flow berubah di `reports/status.md`, distributed flow
terverifikasi, atau cross-audit/page-audit selesai.

**Kontrak coverage:** jumlah file di `reports/audit/*.md` = flow yang wajib
masuk rencana re-audit. Saat ini 5 file = 5 flow (`landing-page-flow.md`,
`checkout-flow.md`, `whatsapp-notification-flow.md`, `design-simulator-flow.md`,
`production-dashboard-flow.md`). Audit gabungan historis di `reports/archive/`.

**Last updated:** 12 September 2026

---

## Matrix

| Flow | Tier | Batch (re-audit) | Prioritas | Status Final | Next Action |
|------|------|------------------|-----------|--------------|-------------|
| `landing-page-flow` | Core | Track A v2 selesai (2026-09-12) | P1 | CLEAR — 16 temuan (14 FIXED + ACK/DEFERRED) | E2E authoring opsional |
| `checkout-flow` | Core | Track A v2 selesai (2026-09-12) | P0 | CLEAR — 19 temuan + hardening (CF-A-32/33, CF-A-24 upgrade) FIXED | E2E authoring (opsional — money path, kandidat pertama) |
| `whatsapp-notification-flow` | Core | Track A v2 selesai (2026-09-12) | P1 | CLEAR — 6 temuan FIXED + single-source guard | Isi `ADMIN_NOTIFY_WEBHOOK_URL` untuk delivery real |
| `design-simulator-flow` | Core | Track A v2 selesai (2026-09-12) | P2 | CLEAR — 10 FIXED + 1 ACK (DS-A-08 MVP) | Track C opsional (canvas UX) |
| `production-dashboard-flow` | Supporting | Track A v2 selesai (2026-09-12) | P3 | CLEAR — dibangun + 6 temuan (5 FIXED + 1 ACK) + export CSV | Kredensial admin lokal sudah diisi; isi env `ADMIN_*` di produksi; E2E Basic Auth journey opsional |

## Catatan

- **Prioritas** = urutan eksekusi saat re-audit v2 / authoring E2E: checkout
  (money path) duluan, lalu landing + notif, lalu simulator.
- **Batch** belum di-assign — ditentukan saat rencana re-audit dibuat.
- E2E: Playwright infra ter-setup, spec belum ada → semua flow E2E = `N/A`.
- Distributed flow: tidak ada saat ini (5 flow semua atomik).
