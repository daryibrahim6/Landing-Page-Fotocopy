# Audit — checkout-flow

**Tier:** Core | **Prefix ID:** `CF`
**Scope IN:** `src/app/checkout/*` (page + success), `CheckoutForm`, `/api/midtrans/create-token`, `/api/midtrans/webhook`, `/api/upload`, `src/lib/order-storage.ts`, `src/lib/pricing.ts`, `src/lib/midtrans.ts`, `src/lib/schemas.ts`, `src/lib/redis.ts` (shared client), `src/lib/notification.ts`, `src/lib/wa.ts`, `src/data/products.ts` (shared read: harga/opsi), `src/types/index.ts` (order/midtrans types). ~~`/api/orders/[orderId]`~~ dihapus di Tahap 2 (CF-A-18).
**Scope OUT:** konten landing page, simulator canvas, dashboard admin
**Last audit:** 2026-09-08 (gabungan) → di-split ke file ini 2026-09-12 → **re-audit v2 (Tahap 0+1) 2026-09-12.**

---

## Scope (Tahap 0 — frozen 2026-09-12)

### User story & business rules kritis
- Customer memilih produk di landing → masuk `/checkout?product=<id>` → isi spesifikasi (ukuran/bahan/finishing/jumlah), data diri, opsi pengambilan, opsional upload file desain → pilih "Bayar Sekarang" (Midtrans Snap) atau "Order via WhatsApp" → order tercatat `pending` → webhook Midtrans update status (`paid`/`cancelled`/`expired`) → customer diarahkan ke `/checkout/success?orderId=<id>` → admin menghubungi via WA.
- **Roles:** customer (publik, anonymous). Admin = manusia di WhatsApp (bukan sistem role).
- **Output yang wajib benar:** `gross_amount` yang ditagihkan Midtrans = harga server-side; status order tidak boleh dimanipulasi pihak luar; order `paid` tidak boleh regresi; PII customer tidak bocor ke pihak ketiga.

### Boundary IN
- Pages: `/checkout`, `/checkout/success`
- API: `POST /api/midtrans/create-token`, `POST /api/midtrans/webhook`, `POST /api/upload` (~~`GET /api/orders/[orderId]`~~ — dihapus Tahap 2)
- Lib: `order-storage`, `pricing`, `midtrans`, `schemas`, `notification`, `wa`
- Trigger: Snap callbacks (onSuccess/onPending/onError/onClose), Midtrans HTTP notification, file upload

### Boundary OUT
- Struktur/konten landing (`landing-page-flow`), detail WA template copy (`whatsapp-notification-flow`), simulator (`design-simulator-flow`), admin dashboard (`production-dashboard-flow`, backlog).
- **Dicatat eksplisit:** harga final & ongkir dikonfirmasi manual oleh admin via WA — `pricing.total` adalah *estimasi*, bukan harga final. Ini disengaja (MVP) dan memitigasi sebagian risiko CF-A-11, tapi TIDAK menghilangkannya (lihat temuan).

### Risiko & prioritas
- **Paling berisiko:** integritas amount pembayaran (money path) dan autentisitas webhook → inilah yang wajib strict.
- **Vitest wajib:** pricing recalculation server-side, webhook signature + transition guard, schema edge cases.
- **E2E wajib (nanti):** happy path create-token → snap → success page; webhook paid; expired; upload >10MB ditolak.

---

## Temuan (carry-over dari full-project-audit-2026-09-08 + verifikasi 12 Sep)

| ID | Sev | Temuan | Status | Bukti resolusi |
|---|---|---|---|---|
| CF-A-01 (ex PMT-A-001) | P0 | Tidak ada order storage — webhook cuma log | ✅ FIXED | `src/lib/order-storage.ts` — Upstash Redis + in-memory fallback; `updateOrderStatus` dipanggil webhook |
| CF-A-02 (ex PMT-A-002) | P0 | Webhook tidak kirim WA notif admin | ✅ FIXED | `src/lib/notification.ts` — `notifyAdminNewOrder`/`notifyAdminPaidOrder` dipanggil di `webhook/route.ts` |
| CF-A-03 (ex PMT-A-003) | P1 | Tidak ada file upload di checkout | ✅ FIXED | `/api/upload` (Upstash Blob private bucket; admin baca via `/api/admin/files` signed redirect) + input file di `CheckoutForm.tsx` (PDF/PNG/JPG/WEBP, max 10MB) |
| CF-A-04 (ex PMT-A-004) | P1 | Kalkulasi harga cuma `priceFrom * quantity` | ✅ FIXED | `src/lib/pricing.ts` — SIZE_MULTIPLIERS + MATERIAL_MULTIPLIERS |
| CF-A-05 (ex PMT-A-005) | P1 | Hanya 3/12 produk bisa checkout | ✅ FIXED | 11/12 produk `isCheckoutEnabled: true` di `src/data/products.ts` |
| CF-A-06 (ex PMT-A-006) | P2 | Checkout tidak ada validasi input | ✅ FIXED | Validasi inline di `CheckoutForm.tsx` (errors object, `text-red-500`) |
| CF-A-07 (ex PMT-A-007) | P2 | snap.js tidak di-load via `next/script` | ✅ FIXED | `src/app/layout.tsx` — Script `midtrans-snap` global |
| CF-A-08 (ex BLU-A-002) | P0 | Tidak ada flow upload design → preview | ✅ FIXED | Upload inline di checkout (preview = file name + URL tersimpan) |
| CF-A-09 (ex BLU-A-004) | P2 | Order number tidak standar | ✅ FIXED | `generateOrderId()` → `BSP-[ts]-[rand]` di `src/lib/midtrans.ts` |

## Temuan Baru (verifikasi 12 Sep 2026)

| ID | Sev | Temuan | Bukti | Status |
|---|---|---|---|---|
| CF-A-10 | P2 | **API routes tidak pakai Zod.** `create-token` hanya cek field required manual; tidak ada schema validation untuk shape/tipe body. Melanggar `feature-architecture.md` ("API routes WAJIB validasi input (Zod)"). | `src/app/api/midtrans/create-token/route.ts` line 8-13; `zod` tidak ada di `package.json` (diverifikasi 12 Sep) | ✅ FIXED (12 Sep) — `src/lib/schemas.ts` (createTokenBodySchema, midtransWebhookBodySchema, orderIdSchema) diterapkan di `create-token`, `webhook`, `orders/[orderId]`; `zod` terinstall; 9 schema tests di `schemas.test.ts`. `/api/upload` tetap manual — allowlist MIME + size check sudah strict; Zod tidak menambah value pada `File` object. |

## Temuan Re-Audit v2 (2026-09-12)

> Ditulis saat Track A Tahap 1. Analisis-only — belum ada fix. Review/approve dulu sebelum Tahap 2.

### CF-A-11 — P0 — Harga ditagihkan ke Midtrans dipercaya mentah dari client
- **Skenario:** `create-token` meneruskan `grossAmount` dan `items[].price` dari body request langsung ke `gross_amount` Midtrans dan ke `order.pricing` — tanpa re-kalkulasi server-side. User tamper request (`grossAmount: 1000`) → bayar Rp1.000 → webhook `settlement` → order jadi `paid`. Harga "estimasi" yang dikonfirmasi admin via WA memitigasi *sebagian*, tapi status `paid` + record harga salah tetap terjadi, dan admin bisa kira order sudah lunas padahal customer bayar kurang.
- **Bukti:** `src/app/api/midtrans/create-token/route.ts` L18 (`grossAmount` dari body), L46-48 (`pricing.total = grossAmount`), L81 (`gross_amount: grossAmount`), L83-88 (`item.price` diteruskan). `CheckoutForm.tsx` L149/L158 kirim harga dari client. `pricing.ts` sudah punya `calculatePrice` + `products` — server BISA recompute tapi tidak dipakai di route.
- **Risiko:** kehilangan uang langsung; record order salah; status `paid` palsu-valid.
- **Opsi A — Server recompute penuh:** client kirim `productId` + `size`/`material`/`finishing`/`quantity` saja; route panggil `calculatePrice()` dan abaikan amount dari client. Paling benar (OWASP: "never accept totals from client"). Effort kecil — semua dependency sudah ada.
- **Opsi B — Validasi silang:** tetap terima `grossAmount` dari client tapi bandingkan dengan `calculatePrice()` server-side; tolak kalau beda >toleransi. Sama amannya, tapi menjaga kontrak client yang tidak perlu ada.
- **Rekomendasi Devin:** Opsi A — hapus `grossAmount`/`price` dari schema, derive semua dari product+specs. Simpler contract, mustahil tamper.
- **Kalau rekomendasi salah:** kalau `calculatePrice` tidak cover semua kombinasi (misal opsi Custom butuh harga manual admin), order legit bisa tertolak — mitigasi: fallback multiplier 1 + flag `needsManualQuote` di order, admin konfirmasi via WA (flow yang sudah ada).
- **Future gap tag:** security | **Status:** FIXED (Tahap 2, 12 Sep) — server recompute via `calculatePrice`; schema baru menerima `productId+size+material+finishing+quantity` saja, field amount client di-strip oleh Zod (`schemas.test.ts` verifikasi `grossAmount`/`items` tidak pernah masuk kontrak).

### CF-A-12 — P1 — Tombol "Bayar Sekarang" tidak pernah render — seluruh jalur Snap unreachable
- **Skenario:** `CheckoutForm` (client component) memanggil `isMidtransConfigured()` yang mengecek `MIDTRANS_SERVER_KEY` — env non-`NEXT_PUBLIC_` → di bundle client selalu `undefined` → fungsi selalu `false` → yang render selalu tombol "Order via WhatsApp". Jalur Snap/token/success page = dead code dari sisi UI, walaupun env Midtrans terisi penuh.
- **Bukti:** `src/lib/midtrans.ts` L8-18 (`getMidtransServerKey` baca `process.env.MIDTRANS_SERVER_KEY`); `CheckoutForm.tsx` L521 (`isMidtransConfigured() ? Bayar : WA`). Next.js hanya inline `NEXT_PUBLIC_*` ke client bundle.
- **Risiko:** fitur pembayaran inti diam-diam mati; kelihatan "jalan" karena fallback WA berfungsi — false negative paling berbahaya.
- **Opsi A — Flag public eksplisit:** tambah `NEXT_PUBLIC_MIDTRANS_ENABLED=true`; `isMidtransConfigured()` cek flag itu + client key saja. Paling sederhana.
- **Opsi B — Server-driven:** `/checkout` jadi Server Component yang pass prop `midtransEnabled` ke form. Lebih "benar" tapi ubah struktur page.
- **Rekomendasi Devin:** Opsi A — satu env var, zero refactor, explicit.
- **Future gap tag:** infra | **Status:** FIXED (Tahap 2, 12 Sep) — `isMidtransConfigured()` kini cek `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` saja (client-safe); server key tetap server-only via simulation fallback.

### CF-A-13 — P1 — Verifikasi signature webhook fail-open kalau `MIDTRANS_SERVER_KEY` kosong
- **Skenario:** `if (serverKey) { verify }` — kalau env lupa diset di production, SIAPAPUN bisa POST `{order_id, transaction_status:"settlement", status_code:"200", gross_amount:"x"}` → order jadi `paid`. Fail-open di boundary finansial.
- **Bukti:** `src/app/api/midtrans/webhook/route.ts` L16-27.
- **Risiko:** forged webhook → order paid palsu saat misconfig — persis saat sistem paling rentan (deployment baru).
- **Opsi A — Fail closed:** kalau `serverKey` kosong → return 500/503 + log error keras ("webhook disabled: no server key"). Benar untuk endpoint yang wajib auth.
- **Opsi B — Dev bypass eksplisit:** allow skip hanya kalau `NODE_ENV !== "production"`. Praktis untuk dev tapi menambah kondisional env-sensitive.
- **Rekomendasi Devin:** Opsi A — webhook tanpa secret tidak boleh melakukan apa-apa. Dev bisa set dummy key lokal.
- **Future gap tag:** security | **Status:** FIXED (Tahap 2, 12 Sep) — webhook fail-closed: tanpa `MIDTRANS_SERVER_KEY` return 500, notifikasi ditolak.

### CF-A-14 — P1 — Webhook abaikan `fraud_status` dan `status_code`
- **Skenario:** mapping hanya lihat `transaction_status`. Per docs Midtrans, transaksi sukses = `status_code 200` + `fraud_status accept` + `transaction_status settlement/capture`. `capture` dengan `fraud_status: "challenge"` (fraud review) → sekarang langsung ditandai `paid`.
- **Bukti:** `webhook/route.ts` L14 (hanya destructure 5 field), L29-45 (mapping); `schemas.ts` L31-37 (`fraud_status` tidak ada di schema).
- **Risiko:** transaksi ter-flag fraud tercatat `paid` → admin proses order yang harusnya review.
- **Solusi:** extend schema (`status_code`, `fraud_status` optional), gate `capture` → `paid` hanya kalau `fraud_status !== "challenge"` (atau `accept`); log/abaikan sisanya. Solusi tunggal, jelas.
- **Future gap tag:** security | **Status:** FIXED (Tahap 2, 12 Sep) — `paid` hanya jika `status_code==="200"` dan `fraud_status` bukan `challenge`/`deny`; capture+challenge → ignored (no status change).

### CF-A-15 — P1 — Transisi status order tidak monoton (paid bisa regresi)
- **Skenario:** `updateOrderStatus` menimpa status apa pun dengan status baru. Midtrans bisa kirim notifikasi telat/out-of-order — `expire` yang datang setelah `settlement` akan mengubah order `paid` → `expired`. Read-modify-write non-atomik juga membuka race dua webhook bersamaan.
- **Bukti:** `src/lib/order-storage.ts` L73-84 — tidak ada guard transisi; `webhook/route.ts` L47.
- **Risiko:** customer sudah bayar, order tercatat `expired`/`pending` → admin tidak proses order yang sudah lunas. Ini bug Kelas Blind Spot #2 (race) + #3 (time-based) — bug nyata, bukan cuma gap test.
- **Opsi A — Guard transisi:** `paid` terminal; `expired/cancelled` tidak boleh balik `pending`; tolak write yang regresi (log warning). Kecil, di satu fungsi.
- **Opsi B — Reconcile via Status API:** sebelum update, panggil Midtrans GET status untuk otoritas terkini. Lebih akurat tapi menambah network call + complexity.
- **Rekomendasi Devin:** Opsi A sekarang; Opsi B nanti kalau ada kasus dispute nyata.
- **Future gap tag:** concurrency | **Status:** FIXED (Tahap 2, 12 Sep) — `updateOrderStatus` punya terminal-status guard (`paid`/`cancelled`/`expired` tidak bisa regresi; same-status idempotent). Ditest: `order-storage.test.ts` "blocks a late expire from regressing a paid order".

### CF-A-16 — P2 — Snap `onClose` tidak di-handle — tombol stuck disabled selamanya
- **Skenario:** `snap.pay` hanya daftarkan `onSuccess/onPending/onError`. Kalau user tutup popup Snap (klik X) tanpa bayar, `onClose` tidak ada → `submitting` tetap `true` → tombol "Bayar Sekarang" spinner/disabled permanen sampai reload. Per docs Snap, `onClose` adalah callback resmi untuk kasus ini.
- **Bukti:** `CheckoutForm.tsx` L187-202.
- **Risiko:** user yang ragu/tutup popup tidak bisa retry — conversion drop.
- **Solusi:** tambah `onClose: () => setSubmitting(false)` + pesan ringan ("Popup ditutup — klik Bayar lagi kalau masih mau lanjut"). Tunggal, jelas.
- **Future gap tag:** none | **Status:** FIXED (Tahap 2, 12 Sep) — `onClose` added: `setSubmitting(false)` + pesan retry "Popup pembayaran ditutup. Klik 'Bayar Sekarang' untuk mencoba lagi."

### CF-A-17 — P2 — Response error API diperlakukan seperti sukses
- **Skenario:** kalau `create-token` return 400/500 (`{error}` tanpa `token`), kode jatuh ke `else` → buka WA + `setSubmitted(true)` → user lihat "Pesanan Diterima" padahal order mungkin tidak tersimpan (400 = sebelum `saveOrder`) atau orphan pending (Midtrans 500 = setelah save). Pesan sukses untuk kegagalan = dishonest UI.
- **Bukti:** `CheckoutForm.tsx` L174-208 — tidak ada cek `res.ok` / `data.error`.
- **Risiko:** user yakin order masuk padahal tidak; order pending yatim di storage.
- **Solusi:** cek `res.ok` + `data.error` dulu → tampilkan error inline (pola `text-red-500` yang sudah ada) + WA sebagai *opsi* fallback, bukan auto-success. Tunggal, jelas.
- **Future gap tag:** none | **Status:** FIXED (Tahap 2, 12 Sep) — cek `!res.ok || data.error` → inline error, tidak pernah set `submitted` pada failure.

### CF-A-18 — P2 — `GET /api/orders/[orderId]` publik return PII order penuh, tidak dipakai app
- **Skenario:** endpoint return `StoredOrder` lengkap (nama, phone, alamat, total) ke siapapun dengan `orderId` valid — tanpa auth. `grep` tidak menemukan caller di `src/` — success page pakai `getOrder()` langsung (server-side), bukan endpoint ini. Dead endpoint yang expose PII.
- **Bukti:** `src/app/api/orders/[orderId]/route.ts` (return `order` utuh); tidak ada `fetch("/api/orders` di codebase.
- **Risiko:** IDOR — order ID `BSP-<base36 ts>-<6 random>` sebenarnya cukup unguessable (~36⁶), tapi endpoint publik tanpa konsumen = attack surface gratis.
- **Opsi A — Hapus route** (YAGNI; ponytail: deletion over addition). Kalau nanti butuh tracking page, buat ulang dengan desain auth.
- **Opsi B — Keep + minimalkan response:** return hanya `{id, productName, status, total}` (tanpa PII) untuk future order-tracking. Berguna kalau halaman tracking direncanakan.
- **Rekomendasi Devin:** Opsi A sekarang — tidak ada fitur yang pakai; re-add saat tracking dibutuhkan.
- **Future gap tag:** security | **Status:** FIXED (Tahap 2, 12 Sep) — route `GET /api/orders/[orderId]` dihapus (0 caller, expose PII). Re-add nanti dengan access token saat halaman tracking dibuat.

### CF-A-19 — P2 — `/api/upload` publik tanpa rate limit/auth
- **Skenario:** siapapun bisa POST file ≤10MB ke Blob storage berulang kali → cost/abuse, storage penuh file liar tidak terikat order.
- **Bukti:** `src/app/api/upload/route.ts` — tidak ada auth, rate limit, atau binding ke order/session.
- **Risiko:** abuse finansial (Blob storage+bandwidth), file orphan.
- **Opsi A — Rate limit IP** via Upstash Ratelimit (infra sudah ada untuk order storage). Kecil.
- **Opsi B — Signed upload flow:** request URL upload dulu (yang bisa di-rate-limit/di-audit), baru upload. Lebih proper tapi refactor.
- **Opsi C — Accept untuk MVP** + monitoring Vercel usage; dokumentasikan sebagai known-limitation.
- **Rekomendasi Devin:** Opsi A (rate limit) atau C + alert usage — tergantung traffic. Opsi B saat volume naik.
- **Future gap tag:** security/infra | **Status:** FIXED (Tahap 2, 12 Sep) — `@upstash/ratelimit` sliding window 10 req/menit per IP (aktif hanya saat Redis dikonfigurasi; dev lokal unlimited).

### CF-A-20 — P2 — Webhook tidak membandingkan `gross_amount` dengan total order tersimpan
- **Skenario:** notifikasi `settlement` dengan amount berbeda dari `order.pricing.total` tetap flip ke `paid`. Signature memang cover `gross_amount` (jadi tidak bisa dipalsukan tanpa key), tapi kombinasi dengan CF-A-11 (amount bisa tamper SAAT create) berarti underpaid transaction → settlement → paid tanpa alarm.
- **Bukti:** `webhook/route.ts` — `gross_amount` hanya dipakai untuk signature, tidak dibandingkan ke order.
- **Risiko:** pembayaran parsial/tampered lolos sebagai "lunas".
- **Solusi:** setelah `updateOrderStatus`, bandingkan `Number(gross_amount)` dengan `order.pricing.total`; mismatch → flag order (`payment.discrepancy`) + log warning + jangan auto-`paid`. Tunggal, jelas — dan jadi net safety untuk CF-A-11.
- **Future gap tag:** security | **Status:** FIXED (Tahap 2, 12 Sep) — webhook bandingkan `Math.round(gross_amount)` vs `order.pricing.total` sebelum `paid`; mismatch → `payment.discrepancy` flag + tetap pending.

### CF-A-21 — P3 — Email fabricate `customer-{phone}@bisaprint.com` dikirim ke Midtrans
- **Skenario:** customer tanpa email → CheckoutForm fabrikasi `customer-<phone>@bisaprint.com` → Midtrans kirim receipt ke alamat itu. Kalau domain `bisaprint.com` bukan milik BisaPrint, receipt (berisi data order) pergi ke pihak ketiga.
- **Bukti:** `CheckoutForm.tsx` L156.
- **Risiko:** receipt email nyasar + data order ke domain orang lain.
- **Solusi:** omit `email` saat kosong (schema sudah optional; Midtrans terima tanpa email), atau pakai domain yang dimiliki (`@bisaprint.id` dst) — verifikasi kepemilikan domain dulu.
- **Future gap tag:** security/privacy | **Status:** FIXED (Tahap 2, 12 Sep) — fabricate email dihapus; email hanya dikirim ke Midtrans kalau user isi (server juga omit field saat kosong).

### CF-A-22 — P3 — Validasi phone tidak konsisten client vs server
- **Skenario:** client `PHONE_REGEX` = 9–15 digit; schema server `min(8)`. Server lebih longgar → data phone aneh bisa masuk order; juga tidak ada normalisasi `08xx` → `62xx` (template WA admin menampilkan mentah).
- **Bukti:** `CheckoutForm.tsx` L27; `schemas.ts` L17.
- **Solusi:** selaraskan — schema `z.string().regex(/^[0-9]{9,15}$/)` + optional transform normalisasi ke `62…` untuk konsistensi notif.
- **Future gap tag:** none | **Status:** FIXED (Tahap 2, 12 Sep) — `phoneSchema` shared di `schemas.ts`: regex `^[0-9]{9,15}$` + normalisasi ke `62` prefix, dipakai server-side; client strip non-digit + regex sama.

### CF-A-23 — P3 — Field `StoredOrder.fileUrl` tidak pernah diisi; notif admin nyebut "dashboard" yang belum ada
- **Skenario:** `CheckoutForm` kirim file URL di `specs.file` (string record), bukan `order.fileUrl` (field dedicated, selalu `undefined`). Dan template `adminNewOrder` bilang "Segera cek file desain di dashboard" — `production-dashboard-flow` masih backlog → admin tidak punya link file sama sekali di notif.
- **Bukti:** `order-storage.ts` L31 (field ada); `create-token/route.ts` L31-36 (specs pass-through, fileUrl tidak diset); `wa.ts` L14 (teks dashboard).
- **Solusi:** set `order.fileUrl = specs.file` (atau field dedicated di body) + masukkan URL file ke template WA admin, ganti teks "dashboard" sementara dashboard belum ada.
- **Future gap tag:** cross-flow | **Status:** FIXED (Tahap 2, 12 Sep) — `order.fileUrl` diisi dari `fileUrl` body (hanya URL http — data URL lokal didrop); template `adminNewOrder` tampilkan `File: <url>` bukan "cek dashboard".

### CF-A-24 — P3 — Fallback in-memory diam di production
- **Skenario:** kalau `UPSTASH_*` lupa diset di deploy production, order masuk ke `Map` per-instance serverless — webhook yang hit instance lain → `order not found` → status tidak pernah update, dan tidak ada error yang terlihat. Gagal diam-diam.
- **Bukti:** `order-storage.ts` L35-51 — fallback silent; tidak ada warning.
- **Solusi:** `console.warn` satu kali saat fallback aktif ("order storage = in-memory, non-persistent") — atau fail hard kalau `NODE_ENV === "production" && !redis`. Kecil.
- **Future gap tag:** infra | **Status:** FIXED (Tahap 2, 12 Sep) — `console.warn` di module load saat Redis env absent ("non-persistent, per-instance. Set env vars for production").

### CF-A-25 — P3 — `transaction_status` tak dikenal dipetakan ke `pending`
- **Skenario:** `refund`, `partial_refund`, `chargeback` (midtrans punya status ini) → switch default → `pending`. Refund seharusnya tidak menurunkan status ke pending.
- **Bukti:** `webhook/route.ts` L29-45 (default case → pending); schema `transaction_status: z.string()` menerima apa saja.
- **Solusi:** default → tidak update status, hanya log (`unknown status, ignored`). Tunggal.
- **Future gap tag:** none | **Status:** FIXED (Tahap 2, 12 Sep) — status tak dikenal (refund/chargeback/authorize/dst) → log + `ignored: true`, tidak menyentuh order.

### CF-A-26 — P3 — Order `pending` yatim menumpuk tanpa TTL/cleanup
- **Skenario:** setiap klik "Bayar" membuat order baru; user yang abandon → order `pending` di Redis selamanya (expire webhook Midtrans tiba 24 jam — baik) — tapi order `simulation`/gagal tidak pernah dapat notifikasi expire. Tanpa TTL, storage tumbuh tak terbatas.
- **Bukti:** `order-storage.ts` — `redis.set` tanpa TTL; tidak ada cleanup.
- **Solusi:** TTL `order:*` keys misal 30 hari (`redis.set(key, val, { ex: 2592000 })`) — cukup untuk window produksi, auto-cleanup. Tunggal.
- **Future gap tag:** scale | **Status:** FIXED (Tahap 2, 12 Sep) — `ORDER_TTL_SECONDS` = 30 hari di `redis.set` (order + midtrans index keys).

### CF-A-27 — P4 — Inkonsistensi multi-item & subtotal
- **Skenario:** schema izinkan `items[]` tapi order hanya rekam `items[0]` sebagai `productName`; `pricing.subtotal = grossAmount` (bukan `sum(price*qty)`). Form selalu kirim 1 item jadi tidak terlihat, tapi kontrak API misleading.
- **Bukti:** `create-token/route.ts` L24 (`items[0]`), L46 (`subtotal: grossAmount`).
- **Solusi:** kalau memang single-item → schema `items: z.array(...).length(1)` + dokumentasi; kalau multi-item direncanakan → rekam array. Keputusan produk kecil.
- **Future gap tag:** none | **Status:** FIXED (Tahap 2, 12 Sep) — kontrak diubah ke single-product (`productId`+specs+qty), items dibangun server-side; `subtotal`/`total` = hasil `calculatePrice` bukan dari client.

### CF-A-28 — P4 — `generateOrderId` pakai `Math.random`
- **Skenario:** order ID = `BSP-<base36 timestamp>-<6 char base36 random>` — ruang random ~2.1B per timestamp, timestamp bocor di ID itu sendiri. Secara praktis unguessable, tapi `crypto.randomBytes`/`randomUUID` adalah best practice untuk identifier yang dipakai lookup tanpa auth.
- **Bukti:** `src/lib/midtrans.ts` L20-23.
- **Solusi:** `crypto.getRandomValues`/`randomBytes(4).toString("hex")` untuk segmen random. Satu baris.
- **Future gap tag:** security | **Status:** FIXED (Tahap 2, 12 Sep) — `generateOrderId` pakai `crypto.randomUUID()` (CSPRNG, Node+browser-safe).

### CF-A-29 — P4 — Halaman success menampilkan status `pending` mentah & order tanpa format check
- **Skenario:** `?orderId=<apa saja>` → tampil "Pesanan Diterima" + ID mentah; order yang ada menampilkan `payment.status` sebagai teks Inggris ("pending") ke user Indonesia.
- **Bukti:** `success/page.tsx` L37 (`{order.payment.status}`), L40-44.
- **Solusi:** map status ke label Indonesia ("Menunggu Pembayaran" dst); optional validasi format orderId sebelum `getOrder`. Kosmetik.
- **Future gap tag:** none | **Status:** FIXED (Tahap 2, 12 Sep) — `STATUS_LABELS` map status→Bahasa Indonesia di success page; `orderIdSchema` guard sebelum `getOrder`.

---

## Cross-Check 5+1 Kelas Blind Spot (wajib per audit)

| Kelas | Relevan? | Hasil |
|---|---|---|
| 1. Stale Reference | Parsial | Order hilang di webhook → handled (null → log). `fileUrl` di `specs` vs field — CF-A-23. Produk = static data, tidak bisa dihapus runtime. |
| 2. Concurrent/Race | Ya — **bug nyata** | CF-A-15 (status regresi + RMW non-atomik). |
| 3. Time-Based Transition | Ya | Midtrans `expiry 24h` → `expire` webhook ada. Gap test: tidak ada test yang simulasikan expiry/ordering — masuk skenario Tahap 3. |
| 4. Partial Failure multi-step | Ya | `saveOrder` OK → Midtrans gagal → orphan pending (dokumentasi OK); CF-A-17 (UI klaim sukses saat gagal). |
| 5. Cross-User Staleness | Minim | Belum ada dashboard — admin pakai WA manual; success page baca live per render. |
| 6. Visual/Layout Regression | Track C | Screenshot walkthrough/checkout di 3 viewport — belum dijalankan (Track C). |

## Security Checklist (wajib — flow payment/PII)

- **IDOR:** `/api/orders/[orderId]` → CF-A-18 (endpoint publik PII, no callers).
- **Financial input:** `grossAmount`/`items[].price` dari client → CF-A-11 (P0).
- **Webhook authenticity:** signature OK saat key ada; fail-open saat tidak → CF-A-13; `fraud_status`/`status_code` → CF-A-14.

## Riset Eksternal / Best-Practice Comparison

| Area | Current approach | Best practice (sumber) | Gap? | Rekomendasi |
|---|---|---|---|---|
| Payment amount | Client kirim `grossAmount`+`price`, server teruskan | OWASP Business Logic CS + 3rd-Party Payment Gateway CS: recompute total server-side, jangan pernah terima total dari client | Ya (CF-A-11) | Recompute via `calculatePrice` + `products` |
| Webhook auth | SHA512 signature verified — **tapi skip kalau key kosong** | Midtrans docs: always check signature + `status_code=200` + `fraud_status=accept` | Ya (CF-A-13/14/20) | Fail-closed + cek fraud/status code + compare gross_amount |
| Snap lifecycle | `onSuccess/onPending/onError` | Midtrans snap.js docs: `onClose` callback untuk popup ditutup | Ya (CF-A-16) | Tambah `onClose` → reset `submitting` |
| Order lookup API | Publik, PII penuh, no callers | OWASP BOLA/IDOR: endpoint objek butuh auth atau minimal response | Ya (CF-A-18) | Hapus (YAGNI) sampai tracking dibutuhkan |
| Upload endpoint | Publik, allowlist MIME+10MB | OWASP Unrestricted File Upload + rate limiting untuk resource publik | Ya (CF-A-19) | Rate limit IP / accept+monitor (MVP) |
| Order ID entropy | `Math.random` base36 | CWE-338: identifier unguessable pakai CSPRNG | Minor (CF-A-28) | `crypto.randomBytes` |
| Env gating client | `isMidtransConfigured` baca non-public env di client | Next.js docs: hanya `NEXT_PUBLIC_*` ke browser | Ya (CF-A-12) | **Diimplementasi:** cek `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` saja — flag env ekstra tidak perlu karena server-key absent sudah punya simulation fallback server-side |
| Storage fallback | Silent in-memory saat Upstash kosong | Twelve-factor: fail loud pada missing backing service di prod | Minor (CF-A-24) | Warn-once / fail prod |
| Notification admin | `console.log` URL WA | Produksi butuh channel real (WA Business API/email) — diketahui, backlog | Diketahui | Tetap — terdokumentasi di Open Items |
| Idempotency webhook | `order_id` key, update idempotent | Midtrans: notif bisa duplikat — idempotent OK | Tidak | Sudah sesuai docs |
| HTTPS endpoint | Vercel deploy = HTTPS | Midtrans wajib HTTPS + public URL | Tidak | OK |
| Checkout UX | Estimasi + disclaimer ongkir + WA fallback | Baymard: price transparency + error recovery | Minor (CF-A-17) | Error inline + WA sebagai opsi |

## Status Vocabulary Note

- Temuan carry-over CF-A-01..CF-A-10: FIXED/VERIFIED (bukti di tabel).
- Re-audit v2: **19 temuan FIXED** (P0×1, P1×4, P2×5, P3×6, P4×3) — Tahap 2 selesai 12 Sep.

## Tahap 2 — Fix Log (2026-09-12)

Keputusan user (all recommended): scope semua 19 · CF-A-11 server recompute · CF-A-18 hapus route · CF-A-19 rate limit IP.

| File | Perubahan |
|---|---|
| `src/lib/redis.ts` (baru) | Shared Upstash client — `null` saat env kosong |
| `src/lib/order-storage.ts` | Import shared redis; `ORDER_TTL_SECONDS` 30d; `TERMINAL_STATUSES` guard (paid/cancelled/expired tak bisa regresi; same-status no-op); `payment.discrepancy` field; warn-once saat fallback in-memory |
| `src/lib/midtrans.ts` | `isMidtransConfigured()` → cek `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` saja (client-safe); `generateOrderId` → `crypto.randomUUID()` |
| `src/lib/schemas.ts` | `createTokenBodySchema` kontrak baru (`productId`+specs+`quantity`, tanpa field harga); `phoneSchema` normalisasi `62`; webhook schema + `fraud_status`/`payment_type` |
| `src/types/index.ts` | `MidtransCreateTokenBody` diselaraskan ke kontrak baru |
| `api/midtrans/create-token/route.ts` | Server recompute via `calculatePrice` + validasi specs vs `products`; grossAmount/item server-built; `order.fileUrl` diisi (http-only); email di-omit saat kosong |
| `api/midtrans/webhook/route.ts` | Fail-closed tanpa server key (500); gate `status_code==="200"` + `fraud_status`; unknown status → ignored (tidak mutate); gross_amount vs total compare → `discrepancy` flag |
| `api/upload/route.ts` | `@upstash/ratelimit` sliding window 10/menit per IP (aktif hanya dengan Redis) |
| `api/orders/[orderId]/` | **Dihapus** (dead endpoint, expose PII) |
| `CheckoutForm.tsx` | Body baru; `!res.ok \|\| data.error` → inline error; `onClose` reset submitting; email tidak difabrikasi |
| `checkout/success/page.tsx` | `STATUS_LABELS` Indonesia; `orderIdSchema` guard |
| `src/lib/wa.ts` + `notification.ts` | Template `adminNewOrder` + arg `file` → `File: <url>` |
| Tests | `schemas.test.ts` ditulis ulang (12 tests); `order-storage.test.ts` baru (8 tests) — termasuk regression paid→expired |

**Re-check:** `tsc --noEmit` clean · `eslint` clean · `vitest` **53/53 pass** (46→53) · `npm run build` hijau — `/api/orders/[orderId]` hilang dari route table.

**Post-Tahap-2 polish (12 Sep):** webhook kini dedup notifikasi — notify hanya saat transisi applied dan berubah state (duplicate webhook / blocked regression tidak spam admin). Selama implementasi tertangkap bug aliasing: `getOrderByMidtransOrderId` mengembalikan referensi live di in-memory store sehingga `updateOrderStatus` me-mutate `existing` sebelum dicek — diperbaiki dengan snapshot `prevStatus` sebelum mutate (commit `f31f2b9`, +2 test).

### CF-A-30 — P3 — `isCheckoutEnabled` tidak ditegakkan di boundary (deep recheck 12 Sep)
- **Skenario:** `products.poster` diset `isCheckoutEnabled: false` dan `ProductCard` menyembunyikan CTA, tapi `/checkout?product=poster` tetap render form dan `create-token` tetap membuat order. Flag hanya di level katalog, bukan gate.
- **Bukti:** `create-token/route.ts` tidak cek `isCheckoutEnabled`; `CheckoutForm` tidak gate.
- **Solusi:** reject di `create-token` (400 + pesan WA fallback) + `CheckoutForm` early-state "belum tersedia" dengan CTA WA. Satu-satunya gate yang benar.
- **Future gap tag:** security | **Status:** FIXED (12 Sep) — test `rejects products with isCheckoutEnabled=false`.

### CF-A-31 — P3 — Transisi expire/cancel mengirim notif "Order Baru" (deep recheck 12 Sep)
- **Skenario:** webhook `expire` pada order pending → transisi applied → admin terima "🔔 Order Baru #X" padahal order kedaluwarsa. Label salah, bisa bikin admin proses order mati.
- **Bukti:** webhook memakai `notifyAdminNewOrder` untuk semua transisi non-paid.
- **Solusi:** notify hanya saat `paid` (order baru sudah dinotifikasi di `create-token`; expire/cancel cukup log server — belum ada template khusus). Tunggal.
- **Future gap tag:** none | **Status:** FIXED (12 Sep) — test `does not send a 'new order' notification for expire transitions`.

## Unit Test Coverage (Tahap 3, 2026-09-12)

| Logic/path | File test | Kasus yang di-cover |
|---|---|---|
| `calculatePrice` (pricing engine) | `pricing.test.ts` | unknown product → 0 · multiplier size/material/finishing · integer total |
| `createTokenBodySchema` / `phoneSchema` / webhook schema / `orderIdSchema` | `schemas.test.ts` | valid accept · phone normalisasi `62` · field harga client di-strip · reject nama kosong/phone invalid/qty 0 & 99999/pickup enum salah · reject missing webhook fields · orderId malformed |
| `POST create-token` (route) | `create-token/route.test.ts` | 400 invalid body · 400 unknown product/spec · **total selalu `calculatePrice` hasil — client `grossAmount`/`items` diabaikan (P0 regression guard)** · phone tersimpan normalized + `fileUrl` http-only · fetch ke Midtrans membawa `gross_amount` server-computed (fetch di-mock & diverifikasi) |
| `POST webhook` (route) | `webhook/route.test.ts` | settlement valid → paid (+paidAt) · signature forged → 403 · **tanpa server key → 500 fail-closed** · `capture`+`fraud_status=challenge` → diabaikan · `gross_amount` mismatch → `discrepancy` flag, tetap pending · status tak dikenal (`refund`) → ignored, no mutation · **late `expire` setelah `settlement` tidak me-regresi order paid** · duplicate settlement → notif sekali saja · blocked regression → tidak notif |
| `updateOrderStatus` monotonic guard | `order-storage.test.ts` | pending→paid ok · paid→expired blocked · cancelled→paid blocked · same-status idempotent (paidAt stabil) · unknown id → null |
| `POST /api/upload` (route) | `upload/route.test.ts` | no file → 400 · MIME non-allowlist → 400 · >10MB → 400 · valid PNG → 200 data URL (lokal tanpa blob token). Rate limit tidak di-unit-test (butuh Redis mock) — perilaku diverifikasi manual di code |
| `isMidtransConfigured` / `getMidtransBaseUrl` / `generateOrderId` | `midtrans.test.ts` | sandbox/prod URL · false saat tanpa key · **true dengan client-key saja (CF-A-12 regression guard)** · format BSP + 100 id unik |
| `buildWAUrl`/`buildWAFormUrl`/`buildAdminWAUrl` + notif | `wa.test.ts`, `notification.test.ts` | template URL benar · arg orderId/produk masuk · admin notification URL terbentuk |
| `formatRupiah`/`cn`, `waUrl`/`WA_NUMBER`, tracking | `utils.test.ts`, `constants.test.ts`, `tracking.test.ts` | format IDR, class merge · wa.me URL + encoding · SSR no-op + arg gtag/fbq |
| Imposition (`paper-sizes`) | `paper-sizes.test.ts` | layout square/round, gap kiss/die cut, oversized→0, rotasi, sheet count |

**Sengaja tidak di-unit-test (alasan eksplisit):**
- `CheckoutForm` UI interactions (state/react) — butuh jsdom+RTL; behavior kritisnya (error handling, onClose, body baru) adalah glue tipis ke route yang kini ter-test. Kandidat Track B kalau mau component test.
- Rate limiter upload — butuh Redis mock; logic-nya 6 baris conditional.
- `snap.pay` callbacks — wrapper vendor; verifikasi manual/visual.
- `logNotification` — `console.log` wrapper trivial.

## Track Gate (Tahap 3)

| Pertanyaan | Keputusan |
|---|---|
| User-facing dan butuh E2E? | **Nanti** — money path = kandidat E2E #1, tapi sengaja diskip per keputusan user (E2E sesi tersendiri) |
| Test terlihat shallow/lemah? | **Tidak** — route-level tests ada untuk money path; assertion verify state & side-effect (fetch body, stored order), bukan sekadar exercise |
| Temuan UI/UX belum fix? | **Tidak** — CF-A-29 (status label) FIXED di Tahap 2; sisa UX review = Track C terpisah |
| Fix berdampak ke flow lain? | **Ya → cross-flow: `whatsapp-notification-flow`** — signature `adminNewOrder` +1 arg (`file`), diverifikasi: `notification.test.ts` pass + build hijau. Tidak ada consumer lain (grep `buildAdminWAUrl` hanya `notification.ts`). |

---

## Hardening Pass (2026-09-12 sore — post-CLEAR ops review)

### CF-A-32 — P1 — TTL 30 hari menghapus order terminal (data loss bisnis)

- **Skenario:** `ORDER_TTL_SECONDS = 30d` dipasang di **semua** write `saveOrder` (order + midtrans index key). Order `paid`/`cancelled`/`expired` ikut terhapus 30 hari setelah write terakhir → tidak ada arsip order, rekap bulanan, atau bukti dispute. CF-A-26 menambahkan TTL untuk auto-clean order `pending` yang di-abandon — benar untuk pending, salah untuk terminal.
- **Bukti:** `order-storage.ts` — `redis.set(..., { ex: ORDER_TTL_SECONDS })` unconditional.
- **Risiko:** rekam bisnis hilang by-design; admin tidak bisa rekap order >30 hari.
- **Solusi diterapkan:** TTL hanya saat `payment.status === "pending"`; write status terminal tanpa `ex` → permanen. `order:index` (zset) memang tidak pernah di-TTL.
- **Status:** FIXED (12 Sep sore).

### CF-A-33 — P2 — `create-token` tanpa rate limit

- **Skenario:** siapapun bisa POST berulang → minta transaksi Midtrans + order pending + notif admin tanpa batas. `/api/upload` sudah di-rate-limit (CF-A-19), endpoint uangnya belum.
- **Bukti:** `create-token/route.ts` — tidak ada guard.
- **Solusi diterapkan:** `Ratelimit.slidingWindow(10, "10 m")` per IP saat Redis dikonfigurasi (pola sama dengan upload); 429 + pesan WA fallback.
- **Status:** FIXED (12 Sep sore). Rate limit tidak di-unit-test (butuh Redis mock) — perilaku diverifikasi manual di code, sama seperti upload.

### CF-A-24 — upgraded (P3 → guard penuh)

- Status lama: warn-once saja. **Sekarang:** `saveOrder` throw saat `NODE_ENV === "production" && !redis` — order tidak bisa "sukses tapi hilang"; CheckoutForm menangkap error → pesan inline + WA fallback tetap jalan. Read paths (`getOrder`, `listOrders`) tetap graceful (null/empty). Banner peringatan in-memory ditambahkan di `/admin/orders`.
- **Status:** FIXED upgraded (12 Sep sore) — test `refuses writes when Redis is unconfigured in production` + `still writes to memory store outside production`.

### CF-A-34 — P1 — `getOrder`/`listOrders` crash di Redis nyata (serde ganda)

- **Skenario:** `redis.get`/`mget` di `@upstash/redis` **auto-deserialize** nilai JSON — mengembalikan object, bukan string. Kode lama `JSON.parse(data)` melempar `SyntaxError: "[object Object]" is not valid JSON` → halaman success error; `listOrders` memfilter hasil object sebagai non-string → daftar admin kosong.
- **Bukti:** live verification 12 Sep — order nyata di Upstash membuat `/checkout/success?orderId=…` crash dengan digest error; dev log menunjukkan stack di `order-storage.ts:104`.
- **Kenapa lolos test:** bug laten — path Redis tidak pernah dieksekusi sebelum env `UPSTASH_REDIS_*` diisi (semua test/dev jalan di memory fallback).
- **Solusi diterapkan:** serahkan serde ke client — `set` mengirim object (bukan `JSON.stringify`), `get<StoredOrder>`/`mget<(StoredOrder|null)[]>` membaca object langsung. Format wire di Redis identik (JSON string).
- **Status:** FIXED (12 Sep malam) — diverifikasi live: success page 200, admin list menampilkan order, CSV export berisi order nyata.
