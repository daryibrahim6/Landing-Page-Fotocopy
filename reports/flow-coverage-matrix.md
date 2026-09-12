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
| `landing-page-flow` | Core | — | P1 | CLEAR (2026-09-08) | Re-audit v2 per-flow + E2E spec |
| `checkout-flow` | Core | — | P0 | CLEAR (2026-09-08) | Re-audit v2 + E2E spec (money path — prioritas tertinggi) |
| `whatsapp-notification-flow` | Core | — | P1 | CLEAR (2026-09-08) | Re-audit v2 + E2E spec |
| `design-simulator-flow` | Core | — | P2 | CLEAR (2026-09-08) | Re-audit v2 + E2E spec |
| `production-dashboard-flow` | Supporting | — | P3 | BACKLOG | Belum dibangun — bukan scope audit sampai v2 dibangun |

## Catatan

- **Prioritas** = urutan eksekusi saat re-audit v2 / authoring E2E: checkout
  (money path) duluan, lalu landing + notif, lalu simulator.
- **Batch** belum di-assign — ditentukan saat rencana re-audit dibuat.
- E2E: Playwright infra ter-setup, spec belum ada → semua flow E2E = `N/A`.
- Distributed flow: tidak ada saat ini (5 flow semua atomik).
