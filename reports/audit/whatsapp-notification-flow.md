# Audit — whatsapp-notification-flow

**Tier:** Core | **Prefix ID:** `WA`
**Scope IN:** `src/lib/wa.ts` (URL builder), `src/lib/notification.ts` (admin notif), `WhatsAppButton`/`FormKonsultasi` (WA CTA), notifikasi dari webhook Midtrans
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
