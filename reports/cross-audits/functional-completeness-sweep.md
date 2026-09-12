# Functional Completeness Sweep (UX-0.5) — BisaPrint

- **Tanggal:** 12 September 2026
- **Scope:** Seluruh project — gap "seharusnya ada tapi tidak ada" yang tidak bisa ditangkap grep/walkthrough per-flow.
- **Role yang diaudit:** (1) **Customer/Pengunjung** — guest tanpa akun, channel utama WhatsApp; (2) **Admin/Owner** — Basic Auth, `/admin/orders`.
- **Metode:** Persona-Needs Matrix per rules `qa-qc-workflow-and-status-tracking.md` §Functional Completeness Audit + cross-reference ke code (setiap baris punya bukti file).
- **Grounding:** kompetitor print online (Xpress, OnlinePrint, Uprint, PrimaGraphia), Baymard checkout/e-commerce research, NN/g, Material Design.

---

## Persona-Needs Matrix — Customer/Pengunjung

| # | Need | Status | Priority | Bukti / Source |
|---|------|--------|----------|----------------|
| C1 | Lihat produk + estimasi harga sebelum komitmen | ✅ Ada | — | `ProductCard.tsx:86` "Mulai RpX/unit" |
| C2 | Filter katalog per kategori | ✅ Ada | — | `ProductCatalog.tsx` — 5 tab kategori |
| C3 | Search katalog (teks) | ❌ Missing | Low | Hanya 7 produk — Baymard: search baru kritis di katalog besar |
| C4 | Detail produk dedicated (PDP) | ⚠️ Partial | Low | Tidak ada PDP; spec picker = halaman checkout itu sendiri — pola toko UMKM dapat diterima |
| C5 | Bukti sosial (testimoni, portfolio) | ✅ Ada | — | `testimonials.ts`, `portfolio.ts` (foto placeholder — LP-A-09 ACK) |
| C6 | Form checkout lengkap (nama, kontak, pickup, catatan, upload) | ✅ Ada | — | `CheckoutForm.tsx` + Zod + `autoComplete`/`maxLength` |
| C7 | Harga transparan sebelum bayar | ⚠️ Partial | Medium | `calculatePrice` server-side; ongkir "kirim" tanpa estimasi — admin konfirmasi via WA |
| C8 | Instruksi pembayaran jelas setelah order | ⚠️ Partial | High | WA-only: tidak ada info rekening/nominal di-success — admin kirim via chat WA |
| C9 | Kode order + status setelah order | ❌ **Missing → CRITICAL** | **Critical** | `handleWaOnly` (`CheckoutForm.tsx:222`) bikin `BSP-XXXX` hanya di body pesan WA — **tidak pernah POST ke server** → tidak masuk `/admin/orders`, success page tidak bisa lookup, kalau popup WA diblokir order hilang total |
| C10 | Lacak order di kemudian hari | ❌ Missing | Medium | `/checkout/success?orderId=` ada tapi cuma berguna untuk order Midtrans; halaman tracking dedicated belum ada |
| C11 | Upload file + validasi format/ukuran | ✅ Ada | — | `api/upload` (max 10MB, PDF/PNG/JPG/WEBP) + preview |
| C12 | Error/empty/loading states | ✅ Ada | — | `error.tsx`, `loading.tsx`, `not-found.tsx`, inline `role="alert"` |
| C13 | WA CTA di semua titik keputusan | ✅ Ada | — | FAB, ProductCard, katalog, footer, header, checkout |
| C14 | FAQ menjawab objection umum | ⚠️ Partial | Medium | `faq.ts` 11 item cover satuan/WA/desain/lead-time/kirim/format/cek-file/ambil/bayar/konsultasi — **missing: garansi hasil salah & revisi** |
| C15 | Kontak alternatif (email, alamat, jam, maps) | ✅ Ada | — | `ContactSection.tsx` + `constants.ts` (maps embed) |
| C16 | Trust signals di checkout | ⚠️ Partial | Medium | Tidak ada reassurance "order dulu, bayar setelah konfirmasi" / security note di area submit |
| C17 | Garansi / kebijakan revisi tertulis | ❌ Missing | Medium | Tidak ada di FAQ/checkout — Baymard: return policy = trust driver |
| C18 | Privacy page / consent | ❌ Missing | Low | LP-A-23 DEFERRED — Pixel/GA fire tanpa opt-in |
| C19 | SEO (metadata, OG, JSON-LD, sitemap, robots) | ✅ Ada | — | `layout.tsx` LocalBusiness JSON-LD + og-image.webp; `sitemap.ts`, `robots.ts` |

## Persona-Needs Matrix — Admin/Owner

| # | Need | Status | Priority | Bukti / Source |
|---|------|--------|----------|----------------|
| A1 | Lihat order masuk | ⚠️ **Incomplete → CRITICAL** | **Critical** | `/admin/orders` hanya menampilkan order yang lewat `create-token` (Midtrans path). Order WA-only (jalur utama sekarang!) **invisible** — akar sama dengan C9 |
| A2 | Ubah status produksi | ✅ Ada | — | PATCH `/api/admin/orders/[id]` + dropdown (baru→diproses→selesai→diambil) |
| A3 | Tandai order batal | ❌ Missing | Low | `PRODUCTION_STATUSES` tidak punya "batal"; `payment.status: cancelled` hanya dari webhook Midtrans |
| A4 | Export/rekap order | ✅ Ada | — | `GET /api/admin/orders/export` CSV |
| A5 | Akses file customer | ✅ Ada | — | `blob:` → `/api/admin/files` signed URL 5 menit |
| A6 | Notifikasi order baru | ⚠️ Partial | High | `notifyAdminNewOrder` hanya terpicu di create-token — order WA tidak pernah trigger (akar sama C9/A1) |
| A7 | Matching mutasi transfer ↔ order | ⚠️ Partial | High | Kode `BSP-XXXX` ada di WA message tapi tidak ada record di dashboard untuk dicocokkan (akar sama C9/A1) |
| A8 | Search/filter order di dashboard | ❌ Missing | Low | Volume kecil; pagination ada — tambah saat order >50/minggu |
| A9 | Revenue/analytics summary | ❌ Missing | Low | Backlog — bisa dari CSV export sementara |
| A10 | Settings/CMS produk | ❌ Missing | Low | By design — data statis `src/data/products.ts` + env; upgrade saat perlu self-service |
| A11 | Auth aman | ⚠️ Partial | Medium | Basic Auth = MVP (noted sejak awal); upgrade session login kalau multi-user |
| A12 | Backup order di luar Redis | ⚠️ Partial | Low | `ADMIN_NOTIFY_WEBHOOK_URL` → Sheets ready tapi env kosong + order WA tidak terkirim (akar sama) |

## Kategori Gap Baru Ditemukan (ditambah ke rules)

**Order Persistence & Lifecycle** — setiap order yang "dibuat" di client WAJIB punya record server-side sebelum user diarahkan keluar (WA/ pembayaran). Tanpa itu: dashboard bohong, kode order yatim, follow-up tidak mungkin. Referensi: order-management convention (Baymard), atomicity principle.

## Jawaban 7 Pertanyaan Senior UX Designer

**Customer:**
1. *Dari awal pasti saya sertakan:* katalog+harga, WA CTA, form+upload, kode order tersimpan, FAQ garansi, trust line checkout. Missing: kode order tersimpan (C9) — paling menyakitkan.
2. *Expect dari toko print online:* "order → dapat nomor → admin konfirmasi" — sekarang nomornya cuma numpang lewat di teks WA.
3. *(admin — lihat bawah)*
4. *Trust signals hilang:* tidak ada "bayar setelah konfirmasi" + garansi tertulis → ragu di titik submit.
5. *Settings yang wajar:* kirim ulang detail order (kalau WA ke-close) → terselesaikan via success page setelah fix.
6. *Friction tersembunyi:* user tidak tahu kode order-nya sendiri kecuali scroll pesan WA — success page harus tampilkan (terselesaikan via fix C9).
7. *Break di scale:* 50+ order WA/hari → admin scroll chat untuk matching = kacau. Fix C9 (dashboard record) = fondasi.

**Admin:**
1. *Dari awal pasti saya sertakan:* semua order dalam satu dashboard — sekarang jalur utama (WA) tidak masuk.
2. *(customer — di atas)*
3. *Butuh kelola order:* record + status + file + kode — ada semua KECUALI untuk order WA.
4. *Trust signals:* admin butuh bukti order (record) bukan cuma chat — C9.
5. *Settings wajar:* tandai batal (A3) — untuk order WA yang customer-nya ghost.
6. *Friction tersembunyi:* export CSV tidak mencakup order WA → rekap salah.
7. *Break di scale:* Basic Auth shared-password tidak scalable multi-admin — Low, noted.

## Gap List — Prioritas

| ID | Gap | Role | Priority | Aksi |
|----|-----|------|----------|------|
| FC-01 | Order WA-only tidak pernah tersimpan (C9+A1+A6+A7+A12) — BSP code yatim | Customer+Admin | **Critical** | **FIX SEKARANG** (delegated): `POST /api/orders` + `payment.method` + redirect success + notif admin |
| FC-02 | FAQ: garansi hasil salah + revisi (C14/C17) | Customer | Medium | **FIX SEKARANG** (copy saja) |
| FC-03 | Trust line di checkout: "order dulu, bayar setelah konfirmasi admin" (C16) | Customer | Medium | **FIX SEKARANG** (copy saja) |
| FC-04 | Status produksi "batal" tidak ada (A3) | Admin | Low | **FIX SEKARANG** (additive enum) |
| FC-05 | Ongkir "kirim" tanpa estimasi (C7) | Customer | Medium | REPORT — perlu tarif kurir owner |
| FC-06 | Tracking page dedicated (C10) | Customer | Medium | REPORT — success URL sudah bookmark-able setelah FC-01; backlog |
| FC-07 | Info rekening bank di success page (C8) | Customer | High | REPORT — perlu nomor rekening owner (data bisnis) |
| FC-08 | Search katalog (C3) | Customer | Low | REPORT — tidak perlu untuk 7 produk |
| FC-09 | PDP dedicated (C4) | Customer | Low | REPORT — checkout page sudah merangkap |
| FC-10 | Admin search/filter order (A8) | Admin | Low | REPORT — defer sampai volume naik |
| FC-11 | Analytics/revenue dashboard (A9) | Admin | Low | REPORT — backlog |
| FC-12 | Settings/CMS produk (A10) | Admin | Low | REPORT — by design, backlog |
| FC-13 | Privacy page + consent banner (C18) | Customer | Low | REPORT — sudah DEFERRED (LP-A-23) |
| FC-14 | Session login admin (A11) | Admin | Low | REPORT — Basic Auth cukup untuk single-admin |
| FC-15 | Auto payment confirmation | Customer+Admin | High | REPORT — keputusan biaya (mutasi-checker ~Rp100-300rb/bln atau Midtrans), documented di milestones |

## Summary

- **Total gap:** 15 (Critical 1 · High 3 · Medium 4 · Low 7)
- **Per role:** Customer 9 · Admin 5 · Shared 1
- **Auto-fix sekarang (delegated):** FC-01, FC-02, FC-03, FC-04
- **Butuh keputusan/data owner:** FC-05 (tarif kurir), FC-07 (rekening), FC-15 (budget auto-confirm)
- **Backlog sadar:** FC-06, FC-08, FC-09, FC-10, FC-11, FC-12, FC-13, FC-14

## Catatan Data Model (wajib dilaporkan per rules)

FC-01 menyentuh `StoredOrder.payment`: tambah `method: "midtrans" | "whatsapp"` + `midtransOrderId` jadi optional. **Additive & backward-compatible** — order lama tanpa `method` tetap valid (dibaca sebagai midtrans). User mendelegasikan ("ikuti saran terbaik"); diimplementasikan dengan flag ini.
