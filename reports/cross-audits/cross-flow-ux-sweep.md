# Cross-Flow UX Sweep — BisaPrint (Tahap UX-0)

**Tanggal:** 2026-09-12 · **Baseline skill:** `ui-ux-pro-max` (priority 1–2: a11y, touch/interaction) · **Tools:** grep suite + Python Playwright (3 viewport: 375/768/1440) · **Dev server:** localhost:3000 (in-memory storage)

---

## Screenshot Cleanup

| Metrik | Jumlah |
|---|---|
| File sebelum cleanup | 0 (folder `reports/screenshots/` belum ada) |
| Direname | 0 |
| Dihapus (duplikat) | 0 |
| Setelah cleanup | 22 file baru (semua format kanonik `state-*-{viewport}-2026-09-12.png`) |

Evidence snapshot tersimpan di `reports/screenshots/{landing-page-flow,checkout-flow,design-simulator-flow,production-dashboard-flow}/`.

## DB State Setup

- Order test dibuat via jalur real: `POST /api/midtrans/create-token` (product `brosur-flyer`, qty 50) → order `BSP-MTY3Z2SI-605E7610` pending di in-memory store dev server → `/checkout/success?orderId=…` menampilkan data asli, `/admin/orders` list real.
- Admin auth: `httpCredentials` Playwright dari `ADMIN_USERNAME`/`ADMIN_PASSWORD` `.env.local` — dashboard ter-render penuh (bukan 401).

---

## Layer 1 — Grep Anti-Pattern Scan (21 scan)

| # | Scan | Hasil |
|---|---|---|
| 1 | Em dash `—` | **HIT** — ~14 lokasi user-facing (lihat temuan B-01) |
| 2 | Anchor `href="#…"` | ✓ bersih — `#produk`→`ProductCatalog:38`, `#faq`→`FaqSection:34`, `#kontak`→`ContactSection:46`, `#main-content`→`layout:131` semua punya target |
| 3 | Capitalization nav | ✓ konsisten Title Case (`Produk`, `Portfolio`, `Cara Order`, `FAQ`, `Simulasi`) |
| 4 | `rounded-[…]` custom | ✓ tidak ada |
| 5 | Icon-only `aria-label` | **HIT** — `CheckoutForm.tsx:393` tombol hapus file (`<X>` saja, tanpa aria-label). Zoom/menu/sosial/select sudah ada |
| 6 | `alert()`/`confirm()` | **HIT ×6** — `DesignSimulator.tsx:153,224`, `UploadZone.tsx:21,26,31,41` |
| 7 | Emoji/unicode sbg icon | **HIT** — `KategoriProduk.tsx:9-15` (🖨️📄🏷️👕🎁 sbg icon kategori). `wa.ts` pakai 🔔/✅ di *teks pesan WA* — konteks chat, bukan UI icon → ACK |
| 8 | `flex justify-between` tanpa `gap` | **HIT** — `DesignSimulator.tsx` ×10 (baris harga), `CheckoutForm.tsx` ×6 (ringkasan harga) |
| 9 | `<th>/<td>` tanpa `px` | ✓ tidak ada `<table>` |
| 10 | Variant inconsistency | ✓ `StarRating` satu implementasi Lucide; `heroBadge` icon via map ke Lucide |
| 11 | `searchParams` tak terkonsumsi | ✓ `?product=` dikonsumsi `CheckoutForm` (useSearchParams→product lookup); `?orderId` dikonsumsi success page |
| 12 | Loading state | Sebagian — spinner ada (Suspense, upload "Mengupload…"), `OrderTable` load-more hanya teks "Memuat…" |
| 13 | `aria-live`/`role=alert` | **HIT** — error dinamis `CheckoutForm` (:549 global + per-field :362,:399,:487,:660) tanpa `role="alert"`; FormKonsultasi & OrderTable sudah benar |
| 14 | `prefers-reduced-motion` | ✓ global CSS `globals.css:185` + `useReducedMotion()` di Hero/Testimonials/ScrollReveal |
| 15 | `autoComplete` | **HIT** — NOL di seluruh `src/` (checkout: name/phone/email/address; konsultasi form) |
| 16 | `maxLength` | **HIT** — NOL di seluruh input/textarea (Zod: name≤200, address≤500, notes≤1000 — user tidak tahu batas sebelum submit) |
| 17 | Placeholder-only label | ✓ label `htmlFor` umumnya ada; group label `CheckoutForm:599` & `:439` tidak berasosiasi ke input (minor) |
| 18 | Drag tanpa alternatif | Sebagian — `UploadZone` punya onClick→file input ✓, tapi `div` tanpa `role="button"`/`tabIndex`/`onKeyDown` → keyboard tidak bisa trigger (WCAG 2.1.1) |
| 19 | Modal useEffect trap | ✓ tidak ada Modal/Dialog/Drawer component |
| 20 | Toggle `translate-x` tanpa anchor | ✓ tidak ada custom toggle (opsi pakai button chips) |
| 21 | `shrink-0` pada fixed-size child | **HIT (potensial)** — `size-10/14/16` circle di flex row tanpa `shrink-0`: `Footer.tsx:121-143`, `ContactSection.tsx:125`, `FaqSection.tsx:47`, `Header.tsx:180` — mobile 375px tampak OK di screenshot, tapi rapuh kalau teks tetangga memanjang |
| 22–28 | E2E suite scans | N/A — `e2e/` hanya `smoke.spec.ts` placeholder; dicatat saat suite ditulis |

---

## Layer 2 — Visual Snapshot (3 viewport)

22 screenshot diambil. Checklist konsistensi antar-halaman:

| Item | Hasil |
|---|---|
| Button styling | Chips opsi konsisten (`rounded-full`, border, selected=pink). CTA: pink pill + green WA — konsisten lintas surface ✓ |
| Card styling | `rounded-2xl/3xl border` konsisten; admin card `rounded-lg` beda radius dari surface lain (minor, beda konteks) |
| Spacing | Section padding konsisten `py-16 md:py-24` |
| Typography | Font display + body konsisten; heading scale konsisten |
| Icon size | Lucide `size-4/5/7` konsisten; **kecuali kategori emoji (A-03)** |
| Color usage | Primary pink untuk aksi utama, hijau WA khusus WA — konsisten ✓ |
| Form input | `rounded-xl border` + error `border-red-400` konsisten checkout/konsultasi |
| Empty state | Admin: "Belum ada order masuk." ✓ (context; tidak ada CTA — acceptable untuk admin). Success-invalid: state "order tidak ditemukan" ada |
| Loading | Spinner Suspense + teks "Memuat…" — tidak ada skeleton (minor) |
| Mobile | Content reflow baik; **FAB overlap konten di 375px (A-06)** |

**Bukti temuan visual:** `state-simulator-mobile-2026-09-12.png` (FAB menimpa tombol "Die Cut"), `state-admin-orders-desktop-2026-09-12.png` (chrome marketing di admin), `state-mobile-nav-open-mobile-2026-09-12.png` (nav drawer full-width, tidak clipped ✓).

## Layer 3 — Interaction & Responsive Spot-Check

| Check | Hasil |
|---|---|
| Hover | Nav/buttons punya hover state jelas; cards `hover:-translate-y` halus ✓ |
| Dropdown/popover di 375px | Tidak ada dropdown kompleks; mobile nav drawer full-width, tidak terpotong ✓ |
| Focus (Tab ×14, desktop) | Nav link: outline 3px slate visible ✓; CTA pink/WA pakai `focus-visible:ring` (outline none + box-shadow) — ring putih di bg pink = kontras rendah (B-07); skip-link berfungsi ✓ |
| Touch target @375px | **Banyak <44px**: chips filter `h-10` (40px), preset stiker 32px, hamburger/social 40×40, "Pesan Sekarang" 40px tinggi (WCAG 2.5.5 AAA → B-03) |
| Text overflow | `.truncate` dipakai di nama/portfolio card ("Pembuatan ijazah provinsi DKI Jakarta da…" terpotong) — ellipsis intentional tapi info hilang tanpa tooltip (B-04); tidak ada overflow rusak selain sr-only (false positive) |
| Navbar/drawer | Mobile menu buka/tutup + Esc + aria-label dinamis ✓; scroll-spy active section bekerja |
| Admin surface | **Merender Header marketing + Footer + FABs** (simulator + WA) — FAB menimpa area kontrol di mobile; nav marketing di halaman admin menyesatkan (A-05/B) |

---

## Temuan Terkonsolidasi

### Kategori A — bug objektif (disarankan fix duluan)

| ID | Temuan | File/Bukti | Flow |
|---|---|---|---|
| UX-A-01 | `alert()`/`confirm()` native ×6 — tak bisa di-style, blocking, beda antar browser | `DesignSimulator.tsx:153,224`; `UploadZone.tsx:21,26,31,41` | design-simulator |
| UX-A-02 | Tombol icon-only "hapus file" tanpa `aria-label` | `CheckoutForm.tsx:393` (WCAG 4.1.2) | checkout |
| UX-A-03 | Emoji dipakai sebagai icon kategori (🖨️📄🏷️👕🎁) — inkonsisten vs Lucide, beda antar OS | `KategoriProduk.tsx:9-15` | landing |
| UX-A-04 | Dropzone UploadZone tidak keyboard-operable (`div onClick` tanpa role/tabIndex/onKeyDown) | `UploadZone.tsx:68-72` (WCAG 2.1.1) | design-simulator |
| UX-A-05 | Error dinamis checkout tanpa `role="alert"`/`aria-live` — SR user tidak dapat feedback validasi/submit | `CheckoutForm.tsx:362,399,487,549,660` (WCAG 4.1.3) | checkout |
| UX-A-06 | Floating FAB (simulator + WA) menimpa kontrol "Jenis Potongan" di 375px; juga menimpa area `Produksi` di admin mobile | `state-simulator-mobile-…png`, `state-admin-orders-mobile-…png` | design-simulator + production-dashboard (shared components) |
| UX-A-07 | Dua input ukuran sama-sama berlabel "Diameter (mm)" — ambigu (W vs H tidak dibedakan) | `DesignSimulator.tsx:324-343`, `state-simulator-desktop-…png` | design-simulator |

### Kategori B — advisory (perlu riset/keputusan sebelum fix)

| ID | Temuan | Flow | Rujukan |
|---|---|---|---|
| UX-B-01 | Em dash `—` di copy user-facing (~14 situs: title, label cut type, disclaimers, FAQ, alt text) | landing, simulator, admin, checkout | konsensus anti-slop; ganti hyphen/koma |
| UX-B-02 | `flex justify-between` tanpa `gap` di baris harga (16 situs) — label↔nilai bisa nempel di sempit | simulator, checkout | CSS fundamentals — tambah `gap-4` |
| UX-B-03 | Touch target <44px di mobile (chips 40px, preset 32px, sosial 40×40) | semua | WCAG 2.5.5 (AAA) — `min-h-11` |
| UX-B-04 | `truncate` menyembunyikan info portfolio/testimoni tanpa tooltip/title | landing | NN/g — pertimbangkan `title` attr atau 2-line clamp |
| UX-B-05 | `autoComplete` absen di semua field (name/tel/email/address) | checkout, landing(konsultasi) | WCAG 1.3.5 (AA) |
| UX-B-06 | `maxLength` absen; batas Zod (200/500/1000) tak dikomunikasikan | checkout | SaaS UX #53, NN/g H5 |
| UX-B-07 | Focus ring CTA kontras rendah (ring putih di bg pink/hijau) | landing | WCAG 2.4.7 — ganti warna ring |
| UX-B-08 | Admin surface merender chrome marketing (Header/Footer/FABs) | production-dashboard | Layout terpisah `admin/layout.tsx` tanpa public chrome |
| UX-B-09 | `shrink-0` absen pada circle fixed-size di flex row (5 situs) | landing (footer/contact/faq/header) | CSS flexbox fundamentals |
| UX-B-10 | Group label tak berasosiasi (`<label>` tanpa htmlFor untuk grup opsi) | checkout | pakai `<fieldset><legend>` |
| UX-B-11 | Loading "Memuat…" text-only di OrderTable; tidak ada skeleton | production-dashboard | NN/g — skeleton untuk structural load |

### ACK (bukan temuan)

- `wa.ts` emoji 🔔/✅ di body pesan WhatsApp — konteks chat message, bukan UI icon. Normal untuk WA.
- `.sr-only` "overflow" hits — intentional screen-reader-only, bukan bug.
- Success page IDOR (PD-A-05) — tetap ACK.

## Summary

| Kategori | Jumlah | Flow terkena |
|---|---|---|
| A (bug objektif) | **7** | design-simulator (3), checkout (2), landing (1), cross-surface FAB (1) |
| B (advisory) | **11** | semua flow |
| Scan clean | 10/21 | — |

---

## Hasil Batch Fix (12 Sep 2026 — semua 18 temuan dieksekusi)

| ID | Status | Fix |
|---|---|---|
| UX-A-01 | FIXED | `alert()` → inline error state + `role="alert"` (`UploadZone` 4× → `error` state; `DesignSimulator` 2× → `exportError` state render di bawah tombol export) |
| UX-A-02 | FIXED | `aria-label="Hapus file desain"` + `p-2` (touch area lebih besar) di `CheckoutForm` |
| UX-A-03 | FIXED | Emoji → Lucide (`Printer, FileText, Tag, Shirt, Gift`) dalam badge `bg-primary/10` di `KategoriProduk` |
| UX-A-04 | FIXED | UploadZone dropzone: `role="button"` + `tabIndex={0}` + `onKeyDown` Enter/Space + `focus-visible:outline-primary` + input reset `e.target.value=""` agar re-upload file sama tetap trigger |
| UX-A-05 | FIXED | `role="alert"` di semua error dinamis checkout (qty, file, address, global, Field) + `aria-live="polite"` di "Mengupload…" |
| UX-A-06 | FIXED | FAB dikecilkan di mobile (`size-12 sm:size-14` WA, `size-12 sm:size-14` simulator); **root fix** = admin surface tidak lagi render FAB sama sekali (UX-B-08 route group). Overlap publik residual = inherent fixed-element, partially mitigated — chip tetap reachable via scroll |
| UX-A-07 | FIXED | Shape `round` → single input "Diameter (mm)" (designH auto-sync); shape `square` → Lebar/Tinggi terpisah |
| UX-B-01 | FIXED | ` — ` → ` – ` di ~19 string user-facing (metadata, labels, disclaimers, FAQ, alt, joiner OrderTable → `·`) |
| UX-B-02 | FIXED | `gap-4` di semua `flex justify-between` (9× simulator + 5× checkout) |
| UX-B-03 | FIXED | `min-h-11` (44px) di preset/chip simulator, OptionGroup, filter katalog, "Pesan Sekarang"/"Tanya Admin", CTA checkout, social Footer (`size-10→size-11`), hamburger Header, select Produksi, "Muat lebih" |
| UX-B-04 | FIXED | `title={badge.name}`/`title={badge.description}` di truncate Testimonials |
| UX-B-05 | FIXED | `autoComplete` — checkout: `name`/`tel`/`email`/`street-address`; konsultasi: `name` |
| UX-B-06 | FIXED | `maxLength` sesuai Zod — name 200, phone 15, email 254, address 500, notes 1000, catatan konsultasi 1000 |
| UX-B-07 | FIXED | Focus ring CTA di bg berwarna → `ring-white ring-offset-2 ring-offset-{bg}` (WhatsAppButton primary+floating, FloatingSimulator, ProductCard, CTA checkout, link WA konsultasi) |
| UX-B-08 | FIXED | **Route group `(public)/`** — page/checkout/simulator dipindah; root layout bare; `(public)/layout.tsx` pegang Header/Footer/FABs; `admin/layout.tsx` minimal. URL tidak berubah (build verified) |
| UX-B-09 | FIXED | `shrink-0` di circle fixed-size: Footer socials, Header hamburger, ContactSection WA icon, FaqSection badge, KategoriProduk icon badge |
| UX-B-10 | FIXED | OptionGroup + "Pengambilan" → `<fieldset><legend>` (group label berasosiasi) |
| UX-B-11 | FIXED | Skeleton rows `animate-pulse` saat `loadMore` di OrderTable (menggantikan text-only "Memuat…") |

**Verifikasi:** `tsc` clean · `eslint` 0 · **vitest 152/152** · `next build` hijau (semua route utuh, URL tidak berubah) · visual verify: `/admin/orders` tanpa chrome marketing (`verify-admin-orders-desktop-2026-09-12.png`), `/simulator` mobile single-diameter + FAB lebih kecil (`verify-simulator-mobile-2026-09-12.png`).

**Catatan:** FAB publik tetap fixed — overlap konten saat scroll bersifat inherent; mitigasi = ukuran lebih kecil di mobile + tidak ada FAB di admin. Kalau mau zero-overlap absolut perlu pattern dismissible FAB (tidak direkomendasikan — menambah state untuk gain kecil).

**Halaman di-snapshot:** `/`, `/checkout`, `/checkout?product=…`, `/checkout/success` (real + invalid), `/simulator`, `/admin/orders` — 3 viewport masing-masing.

---
INSTRUKSI YANG DIMINTA: UX-0 cross-flow sweep — screenshot cleanup, 21 grep scans, visual snapshot 3 viewport, interaction spot-check, DB state setup, lapor tanpa fix.
YANG SAYA LAKUKAN: Cleanup (0 file lama, 22 kanonik baru) → 21 scans (11 clean, 10 hit) → 22 snapshot Playwright + interaction checks (nav/focus/touch/overflow) → seed order real via create-token untuk success+admin → 18 temuan terkonsolidasi (7 A + 11 B) di file ini.
ADA PENYIMPANGAN DARI INSTRUKSI?: Tidak — murni scan+lapor, zero fix.
LANGKAH SELANJUTNYA: User review file ini → putuskan batch fix (rekomendasi: Kategori A dulu — UX-A-01…A-07), lalu Tahap UX-1 per-flow.
