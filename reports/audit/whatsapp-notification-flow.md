# Audit — whatsapp-notification-flow

**Tier:** Core | **Prefix ID:** `WA`
**Scope IN:** `src/lib/wa.ts` (URL builder), `src/lib/constants.ts` (WA_NUMBER/waUrl — shared dengan landing), `src/lib/notification.ts` (admin notif), `src/components/shared/WhatsAppButton.tsx`, `src/components/sections/FormKonsultasi.tsx` (WA CTA), notifikasi dari webhook Midtrans
**Scope OUT:** rendering landing sections, checkout form logic
**Last audit:** 2026-09-08 (gabungan) → di-split ke file ini 2026-09-12. Re-audit v2 belum dijalankan.

## Temuan

| ID | Sev | Temuan | Status | Bukti resolusi |
|---|---|---|---|---|
| WA-A-01 (ex BLU-A-005) | P2 | Admin WA notif tidak berisi detail lengkap | ✅ FIXED | `src/lib/notification.ts` — template `notifyAdminNewOrder`/`notifyAdminPaidOrder` membawa detail order; tercover `notification.test.ts` |
| WA-A-02 | P2 | WA URL builder | ✅ VERIFIED | `src/lib/wa.ts` — `wa.me` URL dengan message encoded; tercover `wa.test.ts` (4 tests) |

## Catatan / Batasan Diketahui

- Notifikasi saat ini = generate WA click-to-chat URL + `logNotification` (bukan kirim otomatis). WA Business API = backlog.
- E2E: spec belum ada.

## Cross-flow touch (2026-09-12, dari checkout-flow Tahap 2)

- `templates.adminNewOrder` signature +1 arg `file` — pesan kini `File: <url>` (sebelumnya nyebut "cek dashboard" yang belum ada). Caller `notifyAdminNewOrder` di `notification.ts` pass `order.fileUrl ?? "-"`.
- Diverifikasi: `notification.test.ts` pass, build hijau.
