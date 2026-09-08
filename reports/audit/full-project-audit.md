# Full Project Audit — Bisa Print

**Tanggal audit:** 8 September 2026
**Auditor:** Devin (Senior QA / Tech Lead mode)
**Scope:** Landing page UI/UX, checkout/payment flow, produk & pricing, notifikasi, blueprint alignment

---

## 0. Executive Summary

User meminta "pegang kendali total" dengan rombakan UI/UX, pembayaran, dan blueprint. Setelah audit, saya menemukan **konflik fundamental**:

- **PRD asli** meminta visual **Y2K Scrapbook / Playful** (pink/magenta + orange + Fredoka display font).
- **Iterasi sebelumnya** sudah merubah ke **clean Story Set / professional** (putih/abu, pink hanya CTA, dekorasi minimal).
- Sekarang user bilang UI kacau, logo belum transparan, font kaya anak2, dekorasi assets jangan dipake dulu.

Ini menandakan **design direction perlu dikunci ulang**. Jangan rombak sebelum arah visual dan prioritas flow disepakati.

---

## 1. Temuan Kritis — Payment/Checkout Flow

| ID | Severity | Temuan | Bukti | Risiko | Opsi | Rekomendasi |
|---|---|---|---|---|---|---|
| PMT-A-001 | **P0** | **Tidak ada order storage.** Setelah pembayaran, tidak ada database/state yang menyimpan order. Webhook cuma `console.log`. | `src/app/api/midtrans/webhook/route.ts` line 39-41 | Customer tidak punya bukti order persisten. Admin tidak bisa lihat history. Kalau Midtrans gagal callback, order hilang. | A. Simpan order ke file JSON di `/tmp` (Vercel, volatile). B. Simpan ke Vercel KV/Postgres (tambah dependency & biaya). C. Kirim WA notif saja sebagai source of truth. | **C untuk MVP**, lalu **B** saat scale. Order storage adalah must-have. |
| PMT-A-002 | **P0** | **Webhook tidak kirim WhatsApp ke admin/customer.** Webhook cuma log status, tidak memanggil `buildWAUrl`. | `src/app/api/midtrans/webhook/route.ts` | Admin tidak tahu ada pesanan baru. Customer tidak dapat konfirmasi pembayaran. | A. Webhook panggil `buildWAUrl` ke admin WA. B. Integrasi WA Business API (out of scope v1). | **A**. Tambahkan `buildWAUrl` untuk admin notifikasi. |
| PMT-A-003 | **P1** | **Tidak ada file upload di checkout.** PRD mensyaratkan upload design (max 10MB). | `src/components/checkout/CheckoutForm.tsx` tidak ada `<input type="file">` | Customer tidak bisa kirim file desain. | A. Vercel Blob upload (`BLOB_READ_WRITE_TOKEN`). B. Upload ke `/tmp` + attach URL ke WA message. C. Skip dulu, WA manual. | **B untuk MVP** — lebih murah dan cepat, walaupun file hilang setelah redeploy. |
| PMT-A-004 | **P1** | **Kalkulasi harga terlalu sederhana: `priceFrom * quantity`.** Tidak memperhitungkan material, size, finishing. | `src/components/checkout/CheckoutForm.tsx` line 61-64 | Harga checkout bisa jauh di bawah harga real. Misal: stiker chromo A5 vs A4, material vinyl vs chromo, finishing laminasi — semua harga sama. | A. Tambahkan `pricingMatrix` per produk di `src/lib/pricing.ts`. B. Hardcode multiplier per option di product data. C. Sementara label "harga estimasi, admin konfirmasi". | **B + C** — tetap checkout tapi user tahu ini estimasi, admin finalisasi via WA. |
| PMT-A-005 | **P1** | **Hanya 3 produk yang `isCheckoutEnabled: true`.** Sisanya 9 produg WA only. | `src/data/products.ts` line 50, 66, 82, 98, 114, 130, 162, 178, 194, 210, 226 | PRD MVP sebut 4 kategori produk bisa checkout. Saat ini yang bisa checkout terlalu sedikit. | A. Enable checkout untuk semua produg yang harga jelas (print dokumen, stiker, kartu nama). B. Tetap WA only untuk custom/apparel. | **A** untuk print dokumen dan stiker, **B** untuk custom/apparel. |
| PMT-A-006 | **P2** | **Checkout page tidak ada validasi input.** Email opsional bisa jadi placeholder fiktif. Phone tidak divalidasi. | `src/components/checkout/CheckoutForm.tsx` line 36-47 | Data customer tidak reliable. WA notif bisa gagal. | A. Tambah Zod validation + React Hook Form. B. Validasi HTML5 saja. | **A** untuk keandalan data. |
| PMT-A-007 | **P2** | **Snap.js tidak di-load dengan `next/script` di checkout page.** Bergantung pada `window.snap` muncul dari mana? | `src/app/checkout/page.tsx` tidak import Midtrans Script | Midtrans Snap popup bisa gagal. | A. Load `snap.js` di `layout.tsx` atau `checkout/page.tsx`. B. Dynamic import di `CheckoutForm`. | **A** — load global via `next/script` dengan `afterInteractive`. |

---

## 2. Temuan UI/UX & Visual

| ID | Severity | Temuan | Bukti | Risiko | Opsi | Rekomendasi |
|---|---|---|---|---|---|---|
| UI-A-001 | **P1** | **Konflik design direction.** PRD minta Y2K playful, tapi kode sudah clean professional. User sekarang bilang kacau dan font anak2. | `PRD_BisaPrint_Website.md` section 3 vs `src/app/globals.css` | Brand tidak konsisten, user bingung. | A. **Balik ke Y2K Playful** penuh (pink background, blob, sparkles, Fredoka, cards rotasi). B. **Clean Professional** tanpa dekorasi (Y2K hanya di logo/headline). C. **Hybrid:** playful accents tapi clean foundation. | Tanyakan user. **Sementara rekomendasi C**: Fredoka hanya untuk headline, Poppins untuk body, dekorasi minimal, background netral. |
| UI-A-002 | **P1** | **Fredoka display font membuat kesan anak2 untuk body/heading.** | `src/app/layout.tsx` line 15-20 | Tidak profesional untuk UMKM/kantor. | A. Ganti font display ke lebih mature: `Outfit`, `Sora`, `Nunito`. B. Tetap Fredoka tapi hanya untuk logo/CTA, Poppins untuk semua heading. | **B** — paling cepat dan aman. |
| UI-A-003 | **P1** | **Logo tidak tersedia dalam format SVG transparan.** Hanya `logo-bisaprint.webp` (mungkin putih background). | `public/assets/brand/` hanya ada 3 WebP | Logo bisa pecah di dark mode/header transparan. | A. Buat SVG dari source (Canva/AI file). B. Convert WebP ke PNG transparan. C. Pakai teks "Bisa Print" sebagai logo fallback. | **C** sementara, **A** ideal. |
| UI-A-004 | **P2** | **Banyak produk pakai gambar yang sama** (`cetak-dokumen.webp`, `custom-produk.webp`, `sablon.webp`, `cetak-promosi.webp`). | `src/data/products.ts` | Katalog terlihat monoton dan tidak credible. | A. Generate placeholder SVG per kategori. B. Foto asli produk. C. Pakai icon/illustrasi sementara. | **A + B** — placeholder SVG sementara, foto real diganti nanti. |
| UI-A-005 | **P2** | **Dekorasi assets terlalu banyak/membuat berantakan.** User bilang "dekorasi assets jangan dipake dulu". | `public/assets/decoratives/` 13 items | Visual overload. | A. Hapus semua dekorasi. B. Pilih 1-2 dekorasi subtle. | **A** dulu, tambahkan kembali setelah arah design jelas. |
| UI-A-006 | **P2** | **ProductCard belum pakai `next/link` untuk checkout.** Menggunakan `<a>` biasa. | `src/components/shared/ProductCard.tsx` line 104-106 | Client-side navigation terganggu, full reload. | Ganti ke `next/link` atau `useRouter` push. | Fix kecil, langsung. |
| UI-A-007 | **P3** | **WavyDivider warna `#FFEAF4` masih pink tint.** | `src/app/page.tsx` line 24, 26, 29, 38 | Bagi user yang mau clean, ini masih terasa pink. | Ganti ke white/slate/gray atau hapus divider. | Tergantung arah design. |

---

## 3. Temuan Blueprint / Flow Missing

| ID | Severity | Temuan | Bukti | Risiko | Opsi | Rekomendasi |
|---|---|---|---|---|---|---|
| BLU-A-001 | **P0** | **Tidak ada production dashboard.** Order masuk produksi hanya console log. | `reports/status.md` line 18-19 | Admin tidak punya UI untuk melihat order. | A. Dashboard sederhana di `/admin/orders` (read-only dari storage). B. WA notif saja. | **B untuk MVP**, **A** untuk v2. |
| BLU-A-002 | **P0** | **Tidak ada user flow Generate/Upload Design → Preview → Approve.** | Tidak ada halaman/form design upload & preview | User tidak bisa upload dan preview desain sebelum checkout. | A. Tambah step design upload di checkout. B. Pisah halaman `/design/[productId]`. | **A** — inline di checkout. |
| BLU-A-003 | **P1** | **Automatic Preflight & Automatic Print Layout belum ada.** | Hanya `DesignSimulator.tsx` untuk stiker A3. | File customer tidak di-preflight otomatis. | A. Expand Design Simulator untuk semua produk. B. Sederhanakan: preview thumbnail + warning file. | **B** dulu, **A** nanti. |
| BLU-A-004 | **P2** | **Order Number Generated belum terintegrasi dengan Midtrans order_id.** | `src/lib/midtrans.ts` line 20-24 | Order number tidak konsisten. | Gunakan format `BSP-[timestamp]-[random]` untuk semua channel. | Standarisasi. |
| BLU-A-005 | **P2** | **Admin WA notifikasi tidak berisi detail lengkap.** | Webhook tidak kirim WA | Admin tidak dapat no pesanan, informasi order, alamat, data diri. | Buat template WA di `src/lib/wa.ts`. | Implementasikan di webhook. |

---

## 4. Prioritas & Roadmap

### Wave 1 — Fix Fundamentals (P0 + P1 payment)
1. Standarisasi order number.
2. Tambah order storage (minimal Vercel KV atau file fallback).
3. Implementasi WA admin notifikasi dari webhook.
4. Load Midtrans Snap.js properly.
5. Validasi checkout form (Zod).
6. Upload file design di checkout.

### Wave 2 — Pricing & Product
1. Pricing matrix per material/size/finishing.
2. Enable checkout untuk produk print dokumen & stiker.
3. Real product images / placeholders.

### Wave 3 — UI Direction Lock
1. Putuskan: Y2K Playful vs Clean Professional vs Hybrid.
2. Ganti logo transparan/SVG.
3. Font display swap (Fredoka → lebih mature atau restricted usage).
4. Bersihkan dekorasi assets.

### Wave 4 — Production Dashboard (v2)
1. `/admin/orders` read-only.
2. WA notif customer.

---

## 5. Trade-off Keputusan Desain

### Opsi A: Y2K Playful Penuh (sesuai PRD asli)
- **Pro:** Konsisten dengan brand awal, beda dari kompetitor, cocok untuk personal/event.
- **Contra:** User sekarang bilang kacau/anak2, bisa mengurangi credibility untuk kantor/UMKM, banyak rework.

### Opsi B: Clean Professional (current direction)
- **Pro:** Cepat, build sudah stabil, credible untuk bisnis.
- **Contra:** Boring, kurang "Bisa Print personality", melenceng dari PRD.

### Opsi C: Hybrid (Rekomendasi Devin)
- **Pro:** Dapat credibility clean + playful accents, lebih sustainable.
- **Contra:** Butuh keputusan detail "seberapa playful".

---

## 6. Langsung Actionable Jika User Setuju

1. **Tentukan arah visual** (A/B/C).
2. **Fix P0 payment** dulu — order storage + WA notif.
3. **Lock font & logo** — logo SVG transparan, Fredoka hanya headline.
4. **Bersihkan dekorasi** sementara.
5. **Pricing matrix** untuk checkout realistis.

---

## 7. Butuh Keputusan User

- [ ] Design direction: **A / B / C**?
- [ ] Apakah mau saya langsung mulai Wave 1 (payment fix) terlebih dahulu?
- [ ] Apakah logo SVG asli tersedia, atau saya buat fallback text logo?
- [ ] Apakah Midtrans keys & WA notif admin number siap dimasukkan ke `.env`?
- [ ] Apakah mau saya matikan dekorasi assets dulu (hapus dari public/page)?
