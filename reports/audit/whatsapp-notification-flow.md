# Audit — whatsapp-notification-flow

**Tier:** Core | **Prefix ID:** `WA`
**Status:** Track A Tahap 2 selesai — **6 temuan** (6 FIXED, 0 OPEN).

**Tanggal re-audit:** sesi terbaru — audit formal v2 pertama (carry-over WA-A-01/02 diverifikasi ulang).
**Tanggal fix:** sesi terbaru — semua temuan difix, WA-A-04 diputuskan opsi A (webhook outbound env) oleh user delegation.

---

## Scope (Tahap 0 — Frozen)

### User Story / Business Rules

- **User bisa:** klik CTA WhatsApp di mana pun (hero, katalog, kartu produk, form konsultasi, header, footer, kontak, checkout fallback) → WhatsApp terbuka dengan pesan pre-fill terenkode ke nomor bisnis yang benar.
- **Admin (server-side):** saat order dibuat (`create-token`) dan saat pembayaran lunas (`webhook`), sistem membangun notifikasi admin berisi detail order.
- **Roles:** anonymous visitor (klik CTA); sistem (generate payload notifikasi); admin (penerima).
- **Output yang wajib benar:**
  1. Semua WA URL = `wa.me/<nomor>?text=<urlencoded>` — nomor digits-only internasional, pesan terenkode (per WhatsApp docs resmi).
  2. **Satu sumber nomor** — semua CTA ke nomor yang sama, env-overridable.
  3. Payload notifikasi admin membawa: orderId, produk+specs, nama, phone, total, catatan, link file.
  4. Kegagalan notifikasi TIDAK boleh menggagalkan request/order.
  5. Notifikasi tidak duplikat saat webhook replay / transisi diblokir.

### Boundary IN

| Area | File |
|---|---|
| URL builders | `src/lib/wa.ts` (`buildWAUrl`, `buildWAFormUrl`, `buildAdminWAUrl`, `templates`, `isConsultationFormComplete`) |
| Admin notify | `src/lib/notification.ts` (`notifyAdminNewOrder`, `notifyAdminPaidOrder`, `logNotification`) |
| Shared constants | `src/lib/constants.ts` (`WA_NUMBER`, `WA_DEFAULT_MSG`, `waUrl`) |
| CTA touchpoints | `WhatsAppButton`, `ProductCard`, `ProductCatalog` (chat admin), `FormKonsultasi`, `ContactSection`, `Footer`, `Header`, `CheckoutForm` (postCheckout/wa-only/general), success page |
| Emitters | `create-token/route.ts:82`, `webhook/route.ts:101` |

### Boundary OUT

| Area | Kenapa OUT |
|---|---|
| Order creation/payment logic | checkout-flow (audit sendiri — CLEAR) |
| UI rendering sections | landing-page-flow |
| Tracking events (`trackEvent`) | landing-page-flow LP-A-21 (sudah FIXED) |

### Risiko & Prioritas

| Risiko | Skenario paling berisiko |
|---|---|
| Konversi ke nomor salah | Dua sumber WA_NUMBER → CTA terbelah ke nomor berbeda jika env diset |
| Notifikasi tidak sampai | `logNotification` = stdout; admin tidak pernah menerima apa pun secara real-time |
| Request gagal karena notif | Exception di builder notif → 500 setelah order tersimpan |

**Vitest vs E2E:** URL builders + validators + template output → Vitest. Klik CTA → WA app (device-level) → E2E/out-of-band (skipped).

---

## Temuan Track A (Tahap 1)

### Carry-over (di-verifikasi ulang)

| ID | Sev | Status |
|---|---|---|
| WA-A-01 notif admin kurang detail | P2 | FIXED (template bawa orderId/produk/customer/phone/total/notes/file — `wa.ts:13`, `notification.ts:20-31`) |
| WA-A-02 WA URL builder | P2 | VERIFIED (`wa.me` + `encodeURIComponent`, conform format resmi WhatsApp) |

### Temuan Baru

---

#### WA-A-03 — Dua sumber kebenaran WA_NUMBER → CTA bisa ke nomor berbeda

- **Severity:** P2
- **Skenario:** `constants.ts:2` hardcode `WA_NUMBER = "6281299435019"` (abaikan env); `wa.ts:1` baca `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281299435019"`. CTA yang pakai `waUrl()`/`WA_NUMBER` (Footer, ContactSection, WhatsAppButton default) → hardcoded. CTA yang pakai `buildWAUrl`/`buildWAFormUrl` (ProductCard, ProductCatalog, CheckoutForm, FormKonsultasi) → env-driven. Kalau `NEXT_PUBLIC_WHATSAPP_NUMBER` diset ke nomor lain → **setengah CTA ke nomor A, setengah ke nomor B**. `.env.local.example` mendokumentasikan env ini → misconfig tinggal menunggu.
- **Bukti:** `src/lib/constants.ts:1-2` vs `src/lib/wa.ts:1-2`; callers `waUrl()`: `Footer.tsx`, `ContactSection.tsx`, `WhatsAppButton.tsx`; callers `buildWAUrl`: `CheckoutForm.tsx`, `ProductCard.tsx`, `ProductCatalog.tsx`.
- **Risiko:** Konversi terbelah diam-diam — lead masuk ke nomor salah, tidak ada error.
- **Opsi:**
  - (a) Satu sumber: `wa.ts` import `WA_NUMBER` dari `constants.ts`, dan `constants.ts` baca env — semua CTA konsisten env-driven.
  - (b) Hapus env support di wa.ts (selalu constants) — mundur, env-override hilang.
- **Rekomendasi Devin:** (a) — `constants.ts` jadi satu-satunya sumber + baca env; `wa.ts` dan `buildAdminWAUrl` (`ADMIN_WA_NUMBER` env → fallback `WA_NUMBER`) tetap di wa.ts tapi import nomor dari constants.
- **Future gap tag:** cross-flow, security (misconfig)
- **Status:** FIXED — `constants.ts` WA_NUMBER kini `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281299435019"`; `wa.ts` import dari constants (single source, env-overridable).

---

#### WA-A-04 — "Notifikasi" admin tidak pernah sampai ke admin (console.log saja)

- **Severity:** P1 (functional gap — flow bernama "notification" tidak menotifikasi siapapun secara real-time)
- **Skenario:** `notifyAdminNewOrder`/`notifyAdminPaidOrder` membangun URL click-to-chat lalu `logNotification` hanya `console.log` ke stdout server. URL `wa.me/<ADMIN>?text=…` tidak ada yang klik — admin tidak pernah tahu ada order baru/lunas kecuali mantau Vercel function logs manual.
- **Bukti:** `src/lib/notification.ts:64-67`; emitters `create-token/route.ts:82`, `webhook/route.ts:101`.
- **Risiko:** Order masuk/lunas tanpa admin sadar → respons lambat, customer kabur. Ini documented backlog (WA Business API), tapi gap-nya nyata.
- **Opsi:**
  - (a) Status quo + dokumentasi — admin cek dashboard/log manual. Gratis, tapi notif tetap tidak sampai.
  - (b) **`ADMIN_NOTIFY_WEBHOOK_URL`** env → POST payload `AdminNotification` via fetch fire-and-forget. Murah (~20 baris), nyambung ke n8n/Make/Telegram bot/Discord/Slack — delivery real tanpa kontrak WA API.
  - (c) Gateway WA unofficial (Fonnte/Wablas dsb) — riset: **ToS Meta dilanggar, risiko ban nomor + MITM (E2EE putus di server gateway)** — tidak direkomendasikan untuk data order.
  - (d) WA Business API via BSP resmi (Qiscus dsb) — proper tapi ~Rp750rb+/bln + template approval — berat untuk skala ini.
- **Rekomendasi Devin:** **(b)** — webhook outbound opsional = delivery nyata hari ini, zero dependency, upgradeable ke WA API nanti. (c) aktif tidak disarankan (risiko ban + keamanan). **Butuh keputusan user.**
- **Future gap tag:** monitoring, infra
- **Status:** FIXED — user memilih opsi (b). `dispatchAdminNotification(build)` baru di `notification.ts`: selalu log + POST payload ke `ADMIN_NOTIFY_WEBHOOK_URL` (opsional, timeout 5s) bila diset. Awaited tapi never-throws → aman untuk serverless dan tidak bisa gagalkan request. Call sites: `create-token/route.ts:82`, `webhook/route.ts:100`. Env didokumentasikan di `.env.local.example`.

---

#### WA-A-05 — `recipient` field bisa `""` sementara URL fallback ke nomor lain

- **Severity:** P3
- **Skenario:** `notification.ts:35,56` — `recipient: process.env.ADMIN_WHATSAPP_NUMBER ?? ""` → `""` kalau env kosong, padahal `buildAdminWAUrl` di wa.ts fallback `ADMIN_WA_NUMBER → WA_NUMBER`. Payload `recipient` dan URL tujuan tidak konsisten.
- **Bukti:** `src/lib/notification.ts:35,56`, `src/lib/wa.ts:2`.
- **Risiko:** Payload log/integrasi mendownstream salah — recipient kosong padahal URL valid.
- **Opsi:** (a) resolve recipient dari sumber yang sama dengan URL builder (export `ADMIN_WA_NUMBER` resolve). (b) Biarkan.
- **Rekomendasi Devin:** (a) — konsistensi payload.
- **Future gap tag:** none
- **Status:** FIXED — `wa.ts` kini export `ADMIN_WA_NUMBER` (env → fallback WA_NUMBER); `recipient` di kedua notify builder pakai itu → recipient selalu match nomor di URL.

---

#### WA-A-06 — CheckoutForm membangun URL WA via split-hack, bukan helper

- **Severity:** P4
- **Skenario:** `CheckoutForm.tsx:222` — `buildWAUrl("general").split("?text=")[0] + "?text=" + encodeURIComponent(msg)` — membangun URL dengan memotong hasil helper lain. Kalau format `buildWAUrl` berubah (mis. param tambahan), split menghasilkan URL rusak diam-diam. Juga bypass `templates` (pesan kustom inline).
- **Bukti:** `src/components/checkout/CheckoutForm.tsx:220-222`.
- **Risiko:** Fragile — perubahan helper = broken URL tanpa error.
- **Opsi:** (a) Tambah `waCustomUrl(message)` di `wa.ts` — satu helper untuk pesan kustom. (b) Biarkan.
- **Rekomendasi Devin:** (a) — 5 baris, hilangkan duplikasi encode logic.
- **Future gap tag:** none
- **Status:** FIXED — `waCustomUrl(message)` helper baru di `wa.ts`; `CheckoutForm.tsx:222` pakai helper, split-hack dihapus.

---

#### WA-A-07 — `templates` Record<string> loose → template invalid → teks "undefined" terkirim

- **Severity:** P4
- **Skenario:** `wa.ts:6` `Record<string, string | fn>` — `buildWAUrl(template)` dengan key tak dikenal (typo/cast) → `tpl` undefined → `text = undefined` → `encodeURIComponent(undefined)` → pesan literal `"undefined"` di URL WA. Tidak ada guard.
- **Bukti:** `src/lib/wa.ts:6,19-24`.
- **Risiko:** Pesan "undefined" terkirim ke admin — silently broken CTA.
- **Opsi:** (a) Type `templates: Record<WATemplate, ...>` + runtime guard `if (!tpl) return waUrl()`. (b) Biarkan (TS melindungi caller internal).
- **Rekomendasi Devin:** (a) — 2 baris guard, murah.
- **Future gap tag:** none
- **Status:** FIXED — `buildWAUrl` kini `encodeURIComponent(text ?? templates.general)` — template invalid jatuh ke general, tidak pernah emit "undefined". Regression test `wa.test.ts` (key bogus → general fallback).

---

#### WA-A-08 — Kegagalan notifikasi bisa menggagalkan request setelah order tersimpan

- **Severity:** P4
- **Skenario:** `create-token/route.ts:82` — `logNotification(notifyAdminNewOrder(order))` jalan di dalam try utama setelah `saveOrder`. Kalau builder notif throw (mis. data order aneh), response = 500 → customer kira order gagal → retry → **order duplikat tersimpan** padahal yang pertama sukses.
- **Bukti:** `src/app/api/midtrans/create-token/route.ts:81-82` (notify dalam try yang sama dengan response), `notification.ts` (tidak ada internal try).
- **Risiko:** Duplikat order + false-failure UX. Probabilitas rendah (console.log jarang throw) tapi prinsip: side-effect notifikasi tidak boleh bisa gagalkan request.
- **Opsi:** (a) Bungkus emit notif dalam try/catch sendiri (fire-and-forget). (b) Biarkan.
- **Rekomendasi Devin:** (a) — sesuai business rule scope ("kegagalan notifikasi tidak boleh gagalkan request").
- **Future gap tag:** infra
- **Status:** FIXED — `dispatchAdminNotification` menerima lazy builder `() => AdminNotification` di dalam try/catch → builder throw ATAU webhook fetch throw keduanya tertangkap, request tidak terpengaruh. Tested: builder-throw dan fetch-fail keduanya resolve tanpa melempar.

---

## Riset Eksternal (Tahap 1 — wajib)

| Area | Current approach | Best practice (sumber) | Gap? |
|---|---|---|---|
| wa.me URL format | `wa.me/<62digits>?text=<encodeURIComponent>` | Format resmi WhatsApp: digits-only international, `?text=` urlencoded (faq.whatsapp.com/5913398998672934) | **Conform** ✓ |
| Nomor CTA | 2 sumber (constants hardcode + wa.ts env) | Single source of truth untuk nomor bisnis | **Ya → WA-A-03** |
| Notifikasi server→admin | `console.log` click-to-chat URL | Opsi real: outbound webhook (n8n/Make/Telegram), official WA Business API via BSP; gateway unofficial (Fonnte/Wablas) = risiko ToS-ban + MITM | **Ya → WA-A-04** |
| Failure isolation | notify di dalam try utama | Side-effect notification harus fire-and-forget, tidak boleh gagalkan request | **Ya → WA-A-08** |
| Pesan custom | split-hack `?text=` | Helper `waCustomUrl` | **Ya → WA-A-06** |

## 5 Kelas Blind Spot — cross-check

| Kelas | Temuan |
|---|---|
| Stale Reference | **WA-A-03** (dua sumber nomor), WA-A-06 (fragile split) |
| Concurrent/Race | Tidak ada shared state antar user — stateless builders. N/A |
| Time-Based Transition | Dedup notifikasi webhook sudah di-handle checkout-flow (prevStatus snapshot). N/A di sini |
| Partial Failure multi-step | **WA-A-08** (notify bisa gagalkan request post-save), **WA-A-04** (delivery = silent fail by design) |
| Cross-User Cache/State | Env module-level di-bake saat build — expected; note saja |

## Test Coverage (catatan Tahap 1)

- `wa.test.ts` — buildWAUrl/buildWAFormUrl/isConsultationFormComplete ✓ (10 tests)
- `notification.test.ts` — notifyAdmin* payload ✓
- Gap: `buildAdminWAUrl` belum ditest langsung; WA-A-03 fix akan butuh test konsistensi nomor — Track B/Tahap 3.
- E2E: skipped per keputusan user.

---

## Rekap

| Severity | Count | IDs | Status |
|---|---|---|---|
| P1 | 1 | WA-A-04 | FIXED (opsi webhook env — user approved) |
| P2 | 1 | WA-A-03 | FIXED |
| P3 | 1 | WA-A-05 | FIXED |
| P4 | 3 | WA-A-06, WA-A-07, WA-A-08 | FIXED |

**Total: 6 FIXED, 0 OPEN.**

## Tahap 2 Fix Log

| File | Perubahan |
|---|---|
| `src/lib/constants.ts` | `WA_NUMBER` env-driven (`NEXT_PUBLIC_WHATSAPP_NUMBER` fallback) — single source |
| `src/lib/wa.ts` | Import `WA_NUMBER` dari constants · export `ADMIN_WA_NUMBER` · `waCustomUrl()` helper · guard template invalid → general |
| `src/lib/notification.ts` | `recipient` = `ADMIN_WA_NUMBER` resolved · `dispatchAdminNotification(build)` baru: log + optional `ADMIN_NOTIFY_WEBHOOK_URL` POST (5s timeout), never-throws |
| `src/app/api/midtrans/create-token/route.ts` | `logNotification(notify…)` → `await dispatchAdminNotification(() => notify…)` |
| `src/app/api/midtrans/webhook/route.ts` | Sama — notify lewat dispatch guarded |
| `src/components/checkout/CheckoutForm.tsx` | Split-hack → `waCustomUrl(msg)` |
| `.env.local.example` | + `ADMIN_NOTIFY_WEBHOOK_URL` |
| Tests | +7 (dispatch webhook POST/skip/never-throws, recipient match, waCustomUrl, template guard); webhook route tests diupdate mock `dispatchAdminNotification` |

**Verifikasi Tahap 2:** `tsc` clean · `eslint` 0 problems · `vitest` **107/107** (100→107) · webhook route tests disesuaikan (mock `dispatchAdminNotification`, assertion count sama).
