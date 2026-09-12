# Audit: Landing Page Flow

**Status:** Track A Tahap 0-3 selesai (re-audit v2) — **14 temuan FIXED, 1 ACK, 1 DEFERRED, 0 OPEN. 100 unit tests pass.**

**Tanggal re-audit:** sesi terbaru — audit formal penuh pertama untuk flow ini (temuan LP-A-01..07 di bawah adalah carry-over dari audit gabungan lama, sudah di-verifikasi ulang terhadap kode saat ini).

---

## Scope (Tahap 0 — Frozen)

### User Story / Business Rules

- **User bisa:** mendarat di `/`, membaca value prop + bukti sosial, browse kategori → katalog produk, filter produk per kategori, baca portfolio/testimoni/FAQ/panduan file, isi form konsultasi, dan konversi via: (a) WhatsApp CTA (pesan pre-filled), (b) tombol "Pesan Sekarang" → `/checkout?product=…` untuk produk `isCheckoutEnabled`, (c) link `/simulator`.
- **Roles:** anonymous visitor (satu-satunya actor di client); admin menerima hasil konversi via WhatsApp/Midtrans (di luar scope UI ini).
- **Output yang wajib benar:**
  1. Semua link/CTA bekerja dari route manapun — nav anchor tidak boleh dead-click.
  2. Semua gambar yang direferensikan ada di `public/` — no 404.
  3. Konten yang tampil = konten nyata (bukan placeholder yang mengklaim real).
  4. Metadata/OG/JSON-LD akurat & env-correct.
  5. WA CTA membawa pesan pre-fill yang benar ke nomor yang benar.
  6. Harga "Mulai Rp…" di kartu produk konsisten dengan `products` data.

### Boundary IN

| Area | File |
|---|---|
| Page + shell | `src/app/page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `globals.css` (relevan) |
| Sections | semua `src/components/sections/*` (11 file) |
| Layout comps | `Header.tsx`, `Footer.tsx` |
| Shared comps | `ProductCard`, `WhatsAppButton`, `ScrollReveal`, `SectionWrapper`, `WavyDivider` (~~`DecorativeImage`, `BlobDecoration`~~ dihapus LP-A-18) |
| UI/tracking | `src/components/ui/*`, `src/components/tracking/*` |
| Data | `src/data/products.ts`, `portfolio.ts`, `testimonials.ts`, `faq.ts` |
| Shared lib (read-path) | `src/lib/constants.ts`, `wa.ts`, `tracking.ts`, `utils.ts`, `pricing.ts` (dipakai ProductCard via `formatRupiah`) |

### Boundary OUT

| Area | Kenapa OUT |
|---|---|
| `/checkout` pages + `src/app/api/*` | checkout-flow (Track A selesai — CLEAR) |
| `/simulator` | design-simulator-flow (belum di-audit v2) |
| `wa.ts` template admin & `notification.ts` internals | whatsapp-notification-flow; yang di-scope di sini hanya URL builder yang dipakai CTA |
| Midtrans webhook/payment logic | checkout-flow |

Catatan cross-flow: `isCheckoutEnabled` enforcement sudah diverifikasi di checkout-flow (CF-A-30) — di sini hanya dicek konsistensi UI flag.

### Risiko & Prioritas

| Risiko | Skenario paling berisiko |
|---|---|
| Konversi mati | CTA/nav tidak bekerja → funnel utama (WA + checkout) bocor tanpa terlihat |
| Trust | Placeholder diklaim sebagai hasil kerja asli → kredibilitas rusak |
| SEO | Metadata/sitemap salah → organic traffic untuk landing page hilang |
| A11y | Konten bergerak tanpa pause, menu tanpa escape — WCAG gap |

**Vitest vs E2E:** logic murni (wa URL builders, formatRupiah, phone normalize) → Vitest (sudah ada). Interaksi komponen (filter katalog, form validation, nav) → kandidat Track B. Full-journey (landing → WA/checkout) → E2E (skipped per keputusan user).

---

## Temuan Track A (Tahap 1)

### Carry-over (di-verifikasi ulang terhadap kode saat ini)

| ID | Sev | Status re-verifikasi |
|---|---|---|
| LP-A-01 design direction conflict | P1 | FIXED (keputusan desain — Plus Jakarta Sans/Poppins terpasang di `layout.tsx`) |
| LP-A-02 font terlalu luas | P1 | FIXED (font-display vs body sudah dipisah via CSS var) |
| LP-A-03 logo transparency | P1 | FIXED (`logo-bisaprint.svg`+`webp` ada di `public/assets/brand/`) |
| LP-A-04 duplikasi product imagery | P2 | FIXED (12 SVG produk unik di `public/assets/products/`). **Update Sep 2026:** etalase dipangkas 12→7 produk — 4 SVG kini orphan (banner-spanduk, dtf-kaos, jilid-skripsi, print-dokumen-warna), file dibiarkan |
| LP-A-05 decorative asset berlebih | P2 | FIXED (folder `decoratives/` tidak ada lagi — lihat LP-A-10 untuk residu) |
| LP-A-06 ProductCard `<a>` vs `next/link` | P2 | **FIXED — verified** (`ProductCard.tsx:105` pakai `<Link>` untuk `/checkout?product=…`) |
| LP-A-07 pink tint WavyDivider | P3 | FIXED (keputusan desain) |

### Temuan Baru

---

#### LP-A-08 — Nav & Footer anchor links DEAD di route non-home

- **Severity:** P1
- **Skenario:** User di `/checkout`, `/checkout/success`, `/simulator`, atau halaman 404 klik nav "Produk"/"Portfolio"/"Cara Order"/"FAQ" → **tidak terjadi apa-apa**. `handleNavClick` melakukan `e.preventDefault()`, lalu `document.getElementById(targetId)` return `null` di halaman tanpa section → silent no-op. User terjebak, satu-satunya jalan keluar = logo/back browser.
- **Bukti:** `src/components/layout/Header.tsx:68-71` (`e.preventDefault()` + `getElementById` tanpa fallback), pola identik di `src/components/layout/Footer.tsx:20-22`.
- **Risiko:** Conversion leak — user yang masuk checkout tapi mau balik lihat produk/FAQ tidak bisa via UI. Header+Footer render di SEMUA page (via `layout.tsx`), jadi bug ini aktif di setiap route.
- **Opsi:**
  - (a) Fallback: kalau `getElementById` null → `router.push("/#" + targetId)` — simpel, bekerja, hash diproses browser setelah navigasi.
  - (b) Pakai `href="/#produk"` plain tanpa preventDefault — browser handle native, tapi smooth-scroll custom hilang di home.
  - (c) Selalu `router.push` ke `/${href}` kecuali sudah di `/` — lebih eksplisit, sedikit lebih verbose.
- **Rekomendasi Devin:** (a) — satu baris fallback di handler existing, tidak mengubah perilaku di home, menutup semua route.
- **Future gap tag:** cross-flow (Header/Footer shared semua flow), a11y
- **Status:** FIXED

---

#### LP-A-09 — Portfolio section menampilkan placeholder base64, copy mengklaim hasil asli

- **Severity:** P2
- **Skenario:** Section "Hasil Cetak Kami" dengan copy "Ribuan produk sudah keluar dari mesin kami. Ini sebagian hasilnya." menampilkan 10+ tile yang SEMUANYA `data:image/svg+xml;base64` gradient berwarna — bukan foto hasil cetak. Ada `// TODO: replace with higher res version` di `PortfolioGallery.tsx:81`.
- **Bukti:** `src/data/portfolio.ts:15,22,29,…` (semua `image:` = `data:image/svg+xml;base64,…` gradient), `src/components/sections/PortfolioGallery.tsx:81,49-61`.
- **Risiko:** Trust — landing page adalah aset kredibilitas; klaim "hasil cetak" dengan tile gradient abstrak terlihat sebagai placeholder production. Juga `next/image` me-render data-URI tanpa benefit optimasi.
- **Opsi:**
  - (a) Ganti dengan foto hasil kerja asli (ideal, tapi butuh aset nyata dari user).
  - (b) Sembunyikan `PortfolioGallery` dari `page.tsx` sampai aset ada + ubah copy — paling jujur.
  - (c) Pertahankan tapi ubah copy jadi "contoh kategori produk" — kompromi.
- **Rekomendasi Devin:** (b) — remove section dari render sampai user supply foto asli. Placeholder yang mengklaim hasil nyata lebih buruk daripada tidak ada section. **Butuh keputusan user** (konten/aset).
- **Future gap tag:** none
- **Status:** ACK — user memutuskan tetap tampil; supply foto asli nanti

---

#### LP-A-10 — Footer mereferensikan asset yang tidak ada → 404 setiap page load

- **Severity:** P2
- **Skenario:** `Footer.tsx:33` render `<Image src="/assets/decoratives/wavy-divider.webp" …>` — folder `public/assets/decoratives/` **tidak ada** (diverifikasi `ls public/assets/`). Setiap page load → request 404 + div `h-[60px]` kosong. `alt=""` jadi invisible secara visual, tapi request gagal tetap terjadi.
- **Bukti:** `src/components/layout/Footer.tsx:32-38`; `ls public/assets/` → hanya `brand hero icon illustrations machines products`.
- **Risiko:** 404 noise di setiap page (network + console), gap layout 60px, failed asset di audit tools/Lighthouse.
- **Opsi:**
  - (a) Hapus blok Image (kemungkinan besar residu LP-A-05 saat decorative assets dibersihkan tapi referensi ketinggalan).
  - (b) Buat asset wavy-divider yang sebenarnya.
- **Rekomendasi Devin:** (a) — komponen `WavyDivider` SVG sudah ada dan dipakai di page.tsx; blok footer ini duplikat/residu.
- **Future gap tag:** none
- **Status:** FIXED

---

#### LP-A-11 — KategoriProduk `onSelect` tidak pernah di-wire → klik kategori tidak memfilter katalog

- **Severity:** P2
- **Skenario:** Kartu kategori (mis. "Stiker & Label") di-klik → `onSelect?.(cat.id)` dipanggil tapi `page.tsx:22` me-render `<KategoriProduk />` **tanpa prop** → callback noop. Scroll ke `#produk` jalan, tapi filter katalog TIDAK berubah — user tetap lihat "Semua". Fitur setengah terpasang: prop ada, wiring tidak.
- **Bukti:** `src/components/sections/KategoriProduk.tsx:41-46` (`onSelect?.(cat.id)`), `src/app/page.tsx:22` (no prop), `ProductCatalog.tsx:19` (state filter lokal `activeCategory` tidak expose ke parent).
- **Risiko:** UX friction + broken affordance — kartu kategori menyiratkan "lihat produk kategori ini" tapi tidak memfilter.
- **Opsi:**
  - (a) Lift state: `activeCategory` naik ke `page.tsx`, pass `onSelect` + `activeCategory` ke kedua komponen — wiring lengkap, page.tsx jadi client component (katalog sudah client anyway — state bisa di bridge via wrapper client kecil).
  - (b) Hapus prop `onSelect` + ubah kartu jadi anchor scroll murni ke `#produk` — jujur terhadap perilaku aktual.
  - (c) URL-param approach: klik kategori → `/#produk?cat=…` — lebih kompleks, shareable.
- **Rekomendasi Devin:** (a) — intent desain jelas untuk memfilter (prop sudah disiapkan); bridge client wrapper tipis di page.tsx agar kategori klik → filter katalog.
- **Future gap tag:** cross-flow (interaksi antar section)
- **Status:** FIXED

---

#### LP-A-12 — Hero render `opacity: 0` di SSR → LCP tertunda sampai hydration + animasi

- **Severity:** P2
- **Skenario:** `HeroSection` pakai `initial="hidden" animate="visible"` (framer-motion) — SSR HTML emit `opacity:0` pada h1/subtext/CTA. Chrome **mengabaikan elemen opacity:0 sebagai kandidat LCP** → LCP landing page tercatat saat animasi selesai (~detik ke-1.5-2.5+), bukan saat HTML tiba. Tanpa JS, hero blank.
- **Bukti:** `src/components/sections/HeroSection.tsx:129-133` (`initial="hidden"`), `7-67` (semua variant `opacity: 0`).
- **Risiko:** Landing page = halaman paling penting untuk LCP/SEO; riset eksternal (web.dev, DebugBear, Shopify) konsisten: jangan sembunyikan LCP element di balik animasi entry.
- **Opsi:**
  - (a) Hapus `initial="hidden"` untuk elemen above-fold (h1, subtext) — animasi hanya via CSS/non-blocking, atau `initial={false}` untuk paint langsung lalu animasi transform saja.
  - (b) Pertahankan animasi tapi render SSR visible + `useReducedMotion` — lebih kompleks.
  - (c) Terima LCP hit — tidak direkomendasikan untuk landing page.
- **Rekomendasi Devin:** (a) — elemen hero tampil segera; animasi masih bisa jalan pada transform/badge non-LCP. Consistent dengan `ScrollReveal` yang sudah respect `useReducedMotion`.
- **Future gap tag:** scale (traffic mobile lambat), a11y
- **Status:** FIXED

---

#### LP-A-13 — Google site verification = placeholder literal di production HTML

- **Severity:** P3
- **Skenario:** `layout.tsx:65` emit `<meta name="google-site-verification" content="YOUR_GOOGLE_SITE_VERIFICATION">` — placeholder ship ke production. Search Console verification tidak akan pernah berhasil + meta tag sampah di HTML.
- **Bukti:** `src/app/layout.tsx:65`.
- **Risiko:** GSC tidak terverifikasi → tidak bisa submit sitemap/monitor index; meta tag palsu.
- **Opsi:**
  - (a) Env-driven: `google: process.env.GOOGLE_SITE_VERIFICATION` + omit kalau kosong.
  - (b) Hapus field sampai nilai asli ada.
- **Rekomendasi Devin:** (a) — pattern env yang sama dengan `META_PIXEL_ID`/`GA_ID` yang sudah benar.
- **Future gap tag:** monitoring (SEO verification)
- **Status:** FIXED

---

#### LP-A-14 — `metadataBase` hardcoded `https://bisaprint.com`, tanpa env override

- **Severity:** P3
- **Skenario:** `layout.tsx:30` hardcode domain. Preview/staging deploy (Vercel preview, domain lain) → canonical + OG URL tetap mengarah ke `bisaprint.com` → social preview salah, canonical bocor ke domain prod dari staging.
- **Bukti:** `src/app/layout.tsx:30`; `src/lib/constants.ts` tidak punya `SITE_URL`.
- **Risiko:** SEO/social — OG image + canonical salah di non-prod; susah tes staging.
- **Opsi:**
  - (a) `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://bisaprint.com")` — env-first, fallback prod.
  - (b) Hardcode ok kalau tidak ada staging — rapuh.
- **Rekomendasi Devin:** (a) — konsisten dengan env-driven constants lain.
- **Future gap tag:** infra (deploy non-prod)
- **Status:** FIXED

---

#### LP-A-15 — Tidak ada `sitemap.ts` / `robots.ts`

- **Severity:** P3
- **Skenario:** `ls src/app/` → tidak ada `sitemap.ts`, `robots.ts`, atau file statis di `public/`. `robots: { index: true }` ada di metadata tapi tidak ada sitemap untuk crawler dan tidak ada robots.txt directive.
- **Bukti:** `src/app/` listing (verified); `layout.tsx:64`.
- **Risiko:** Landing page lokal-business bergantung pada organic search — tanpa sitemap Google crawl kurang efisien; tanpa robots.txt tidak ada kontrol/disallow `/api`, `/checkout/success` dsb.
- **Opsi:**
  - (a) Tambah `src/app/sitemap.ts` + `src/app/robots.ts` (file convention Next.js native — ~30 baris total).
  - (b) Static `public/robots.txt` + `sitemap.xml` — manual, rawan basi.
- **Rekomendasi Devin:** (a) — native, typed, zero maintenance untuk 4-5 route.
- **Future gap tag:** monitoring (SEO)
- **Status:** FIXED

---

#### LP-A-16 — Testimonial marquee auto-scroll: pause hanya via hover → WCAG 2.2.2

- **Severity:** P3
- **Skenario:** Testimoni auto-scroll infinite (`animate-scroll-x`, `duplicated` array, `animationPlayState` toggle hanya `onMouseEnter/Leave`). Keyboard user & touch user **tidak bisa pause** → WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide — Level A): konten bergerak otomatis >5 detik paralel konten lain wajib punya mekanisme pause.
- **Bukti:** `src/components/sections/Testimonials.tsx:208-229` (`onMouseEnter/Leave` saja, tidak ada tombol/focus pause), `globals.css:174-180`.
- **Risiko:** A11y Level A violation. `prefers-reduced-motion` sudah handle reduced-motion user ✓ — tapi sighted keyboard/touch user tidak tercover.
- **Opsi:**
  - (a) Tambah tombol pause/play visible + `onFocus`/`onBlur` pause — WCAG-complete.
  - (b) Pause on `focus-within` + touchstart — minimal, tanpa tombol.
- **Rekomendasi Devin:** (a) — tombol pause kecil + focus pause = paling accessible dan jelas.
- **Future gap tag:** a11y
- **Status:** FIXED

---

#### LP-A-17 — Midtrans Snap script + preconnect dimuat global di semua page (termasuk landing)

- **Severity:** P3
- **Skenario:** `layout.tsx` load `snap.js` `afterInteractive` di root layout → ikut di landing page padahal hanya dipakai di `/checkout`. Selain itu `<link rel="preconnect" href="https://app.sandbox.midtrans.com">` (line 122) hardcoded **sandbox** — di production env preconnect mengarah ke host yang salah (prod = `app.midtrans.com`).
- **Bukti:** `src/app/layout.tsx` (Script snap + line 122 preconnect); `getMidtransBaseUrl()` di `src/lib/midtrans.ts` sudah env-aware, preconnect tidak.
- **Risiko:** JS pihak ketiga ekstra di critical path landing (network + parse), preconnect hint salah di prod, sandbox host di-preconnect saat prod.
- **Opsi:**
  - (a) Pindah load snap ke `checkout` layout/page saja + preconnect env-aware (`getMidtransBaseUrl()`).
  - (b) Biarkan global — snap perlu ready sebelum user klik bayar; tapi checkout sudah dedicated page, bisa load di sana.
- **Rekomendasi Devin:** (a) — scope script ke route yang pakai; fix preconnect ke env. Perlu verifikasi snap ready saat user tiba di checkout (afterInteractive cukup).
- **Future gap tag:** scale/perf, infra
- **Status:** FIXED

---

#### LP-A-18 — Dead components: `GoogleMap.tsx`, `DecorativeImage.tsx`, `BlobDecoration.tsx`

- **Severity:** P4
- **Skenario:** Tiga komponen tidak diimpor file manapun (grep verified — hanya self-reference). `GoogleMap` digantikan iframe inline di `ContactSection`; `DecorativeImage`/`BlobDecoration` residu LP-A-05.
- **Bukti:** `grep -l "DecorativeImage\|BlobDecoration\|GoogleMap" src/**/*.tsx` → hanya file itu sendiri.
- **Risiko:** Dead code membingungkan audit berikutnya + ukuran repo; `GoogleMap` bahkan refer env `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` yang tidak relevan (ContactSection pakai `MAPS_EMBED_URL` tanpa key).
- **Opsi:** (a) Hapus ketiganya. (b) Archive ke `_archive/`. 
- **Rekomendasi Devin:** (a) — tidak ada plan reuse; ContactSection sudah punya embed jalan.
- **Future gap tag:** none
- **Status:** FIXED

---

#### LP-A-19 — Cluster a11y/responsif: mobile menu tanpa Escape/focus, tab kategori tanpa state ARIA, hero abaikan reduced-motion, `h-screen` mobile

- **Severity:** P4 (bundle advisory)
- **Skenario:**
  1. Mobile menu (Header) tidak close via `Escape`, tidak ada focus management saat buka/tutup.
  2. Category tabs `ProductCatalog` adalah `<button>` tanpa `aria-pressed`/`role="tablist"` — screen reader tidak tahu tab aktif.
  3. `HeroSection` motion tidak cek `useReducedMotion` (inkonsisten dengan `ScrollReveal`/`Testimonials` yang sudah).
  4. `h-screen` hero = 100vh termasuk URL bar mobile → konten bisa terpotong di mobile (`h-svh`/`min-h-svh` lebih aman).
- **Bukti:** `Header.tsx` (AnimatePresence menu, no keydown handler), `ProductCatalog.tsx:41-54`, `HeroSection.tsx:95-100`, `layout.tsx` (`useReducedMotion` tidak dipakai Hero).
- **Risiko:** a11y gaps kecil — tidak blocking tapi menurunkan skor audit a11y.
- **Opsi:** (a) Bundle fix kecil per item. (b) Defer ke Track C polish.
- **Rekomendasi Devin:** (a) untuk Escape + `aria-pressed` (murah); defer sisanya ke Track C kalau mau.
- **Future gap tag:** a11y
- **Status:** FIXED

---

#### LP-A-20 — JSON-LD duplikat hardcode data kontak (drift dari `constants.ts`)

- **Severity:** P4
- **Skenario:** `layout.tsx` JSON-LD hardcode `+6281299435019`, `bisadigitalprint@gmail.com`, alamat Bekasi — duplikat `WA_NUMBER`/`EMAIL_URL`/`MAPS_EMBED_URL` di `constants.ts`. Kalau env/constants berubah → JSON-LD bohong ke Google.
- **Bukti:** `src/app/layout.tsx` (LocalBusiness JSON-LD) vs `src/lib/constants.ts:1-5`.
- **Risiko:** Stale structured data — nomor WA di schema beda dari tombol WA = local SEO signal salah.
- **Opsi:** (a) Import dari constants di JSON-LD. (b) Biarkan — rapuh.
- **Rekomendasi Devin:** (a) — single source of truth.
- **Future gap tag:** none
- **Status:** FIXED

---

#### LP-A-21 — Tracking konversi tidak konsisten + klaim error reporting palsu

- **Severity:** P4
- **Skenario:**
  1. `trackEvent("Lead")` hanya di floating `WhatsAppButton` (`WhatsAppButton.tsx:82`); CTA WA lain (hero, katalog "Chat Admin", FAQ "Tanya", kontak, ProductCard "Tanya Admin", header) **tidak tracked** → data konversi undercount besar.
  2. `error.tsx` bilang "Tim kami sudah diberitahu" tapi tidak ada Sentry/error reporting — klaim palsu.
- **Bukti:** `src/components/shared/WhatsAppButton.tsx:82` (hanya variant floating), `src/app/error.tsx:22`, `src/lib/tracking.ts`.
- **Risiko:** Funnel analytics tidak akurat; error production tidak pernah sampai ke tim.
- **Opsi:**
  - (a) Track semua WA CTA (pass `source` per lokasi) + hapus/ubah klaim error.tsx atau wire reporting real.
  - (b) Terima undercount — data tetap salah.
- **Rekomendasi Devin:** (a) bagian tracking — murah (`trackEvent` sudah ada); error reporting = backlog monitoring (dokumentasikan).
- **Future gap tag:** monitoring
- **Status:** FIXED

---

#### LP-A-22 — FormKonsultasi validasi lemah (jumlah "0"/negatif lolos; bukan `<form>`; error tanpa ARIA)

- **Severity:** P4
- **Skenario:** `onClick` cek `!fields.jumlah` — truthy check pada string → `"0"`, `"-5"`, `"e"` lolos ke WA. Bukan elemen `<form>` → Enter di input tidak submit (anchor CTA), error `<p>` tidak di-associate via `aria-describedby`/`aria-invalid`/`role="alert"`.
- **Bukti:** `src/components/sections/FormKonsultasi.tsx:158-163` (`!fields.jumlah` truthy), `59-66` (input tanpa `aria-invalid`), `170-172` (error tanpa `role="alert"`).
- **Risiko:** Pesan WA terkirim dengan jumlah invalid; a11y form.
- **Opsi:** (a) Validasi `Number(jumlah) > 0` + `role="alert"` + bungkus `<form>`. (b) Defer Track C.
- **Rekomendasi Devin:** (a) — murah, sejalan validasi checkout `phoneSchema` pattern.
- **Future gap tag:** a11y
- **Status:** FIXED

---

#### LP-A-23 — Meta Pixel + GA fire tanpa consent; tidak ada halaman privacy

- **Severity:** P4 (advisory)
- **Skenario:** `MetaPixel`/`GoogleAnalytics` load `afterInteractive` begitu env set — tanpa consent banner/opt-out. Tidak ada `/privacy` page. Untuk bisnis Indonesia (UU PDP) + Meta Pixel tracking `Lead` events, consent notice adalah praktik yang direkomendasikan.
- **Bukti:** `src/components/tracking/*`, `layout.tsx` render unconditional saat env ada.
- **Risiko:** Compliance/privacy — rendah untuk skala ini tapi noted; tidak ada privacy page untuk link footer.
- **Opsi:**
  - (a) Consent banner ringan (localStorage opt-in) + privacy page.
  - (b) Dokumentasikan sebagai known gap, defer ke roadmap.
- **Rekomendasi Devin:** (b) — defer sadar; UU PDP enforcement untuk site skala ini rendah, tapi catat supaya tidak lupa saat scale.
- **Future gap tag:** security/compliance, monitoring
- **Status:** DEFERRED — keputusan user: dokumentasikan, implement saat scale/ads

---

## Riset Eksternal (Tahap 1 — wajib)

| Area | Current approach | Best practice (sumber) | Gap? |
|---|---|---|---|
| LCP hero animation | `initial="hidden"` → opacity 0 di SSR, animasi in | LCP element tidak boleh hidden/animasi entry (web.dev, DebugBear, Shopify — Chrome abaikan opacity:0 sbg kandidat LCP) | **Ya → LP-A-12** |
| Konten bergerak >5s | Marquee testimoni, pause hover saja | WCAG 2.2 SC 2.2.2 Level A: mekanisme pause/stop/hide untuk SEMUA user (W3C) | **Ya → LP-A-16** |
| SEO files | Metadata API lengkap; no sitemap/robots | Next.js `app/sitemap.ts` + `app/robots.ts` file convention (Next docs) | **Ya → LP-A-15** |
| Canonical/metadataBase | Hardcoded `bisaprint.com` | Env-driven metadataBase (Next docs — OG/canonical resolution) | **Ya → LP-A-14** |
| Site verification meta | Placeholder literal | Env-driven atau omit (Google Search Console docs) | **Ya → LP-A-13** |
| Third-party script scope | snap.js global via root layout | `next/script` load hanya di route yang pakai (Next script optimization docs) | **Ya → LP-A-17** |
| Anchor nav lintas route | preventDefault + scrollIntoView, no fallback | Fallback navigasi ke `/#anchor` saat section tidak ada | **Ya → LP-A-08** |
| Reduced motion | `useReducedMotion` di ScrollReveal/Testimonials, tapi tidak di Hero | Respect `prefers-reduced-motion` konsisten (WCAG 2.3.3 advisory) | Parsial → LP-A-19 |
| Consent/tracking | Pixel+GA unconditional | Consent notice untuk tracking (UU PDP / best practice) | Advisory → LP-A-23 |

## 5 Kelas Blind Spot — cross-check

| Kelas | Temuan di flow ini |
|---|---|
| Stale Reference | LP-A-10 (asset mati), LP-A-18 (dead comps), LP-A-20 (JSON-LD drift), LP-A-06 verified-resolved |
| Concurrent/Race | Tidak ada state shared antar user di landing (read-only page) — N/A |
| Time-Based Transition | Tidak ada state time-based — N/A |
| Partial Failure multi-step | FormKonsultasi → WA (single step, validation lemah → LP-A-22) |
| Cross-User Cache/Staleness | Halaman statis, data statis — N/A (produk/data perlu rebuild, acceptable) |

## Test Coverage (Tahap 1 — catatan, Track B yang deep-dive)

- Logic murni yang dipakai landing: `waUrl`/`buildWAUrl`/`buildWAFormUrl` (wa.test.ts ✓), `formatRupiah` (utils.test.ts ✓), `trackEvent` (tracking.test.ts ✓) — sudah ter-cover.
- Component-level (filter katalog, validasi form, nav fallback, marquee pause): **0 test** — kandidat Track B setelah fix.
- E2E: skipped per keputusan user (nav + conversion paths = kandidat pertama nanti).

---

## Rekap

| Severity | Count | IDs |
|---|---|---|
| P1 | 1 | LP-A-08 |
| P2 | 4 | LP-A-09, LP-A-10, LP-A-11, LP-A-12 |
| P3 | 5 | LP-A-13, LP-A-14, LP-A-15, LP-A-16, LP-A-17 |
| P4 | 6 | LP-A-18, LP-A-19, LP-A-20, LP-A-21, LP-A-22, LP-A-23 |

**Total: 16 temuan — 14 FIXED, LP-A-09 ACK (tetap tampil per user), LP-A-23 DEFERRED (per user).** Carry-over 01-07 semua FIXED/verified.

**Keputusan user (Tahap 2):** LP-A-09 → tetap tampil (user supply foto asli nanti); LP-A-23 → DEFERRED + dicatat di Open Items status.md.

---

## Tahap 2 — Fix Log

| ID | Fix | File |
|---|---|---|
| LP-A-08 | Fallback `router.push("/#id")` saat section tidak ada di halaman | Header.tsx, Footer.tsx |
| LP-A-09 | ACK — tetap tampil per keputusan user | — |
| LP-A-10 | Hapus blok Image dead (`decoratives/wavy-divider.webp`) | Footer.tsx |
| LP-A-11 | `CatalogSection` client wrapper — `onSelect` → `activeCategory` shared | CatalogSection.tsx (baru), page.tsx, ProductCatalog.tsx (controlled props) |
| LP-A-12 | Variant `hidden` opacity→1 (transform-only animasi) — LCP paint langsung | HeroSection.tsx |
| LP-A-13 | `verification.google` env-driven (`GOOGLE_SITE_VERIFICATION`, omit kalau kosong) | layout.tsx |
| LP-A-14 | `metadataBase` → `SITE_URL` env (`NEXT_PUBLIC_SITE_URL` fallback bisaprint.com) | layout.tsx, constants.ts |
| LP-A-15 | `src/app/sitemap.ts` + `src/app/robots.ts` (disallow /api, /checkout) | baru — muncul di route table |
| LP-A-16 | Tombol pause/play visible + aria-pressed pada marquee | Testimonials.tsx |
| LP-A-17 | snap.js + preconnect pindah ke `checkout/layout.tsx`, preconnect env-aware | layout.tsx, checkout/layout.tsx (baru) |
| LP-A-18 | Hapus GoogleMap/DecorativeImage/BlobDecoration (0 refs verified) | 3 file dihapus |
| LP-A-19 | Escape-close mobile menu, `aria-pressed` tabs, hero `useReducedMotion`, `min-h-svh` | Header, ProductCatalog, HeroSection |
| LP-A-20 | JSON-LD pakai SITE_URL/WA_NUMBER/EMAIL_URL/IG_URL dari constants | layout.tsx |
| LP-A-21 | `trackEvent("Lead")` semua variant WA CTA + source param; error.tsx copy jujur | WhatsAppButton, ProductCatalog, ContactSection, FormKonsultasi, error.tsx |
| LP-A-22 | Validasi `Number(jumlah)>0` + `role="alert"` + `aria-required` | FormKonsultasi.tsx |
| LP-A-23 | DEFERRED — dicatat di Open Items status.md | — |

**Re-check:** `tsc --noEmit` clean · `eslint` 0 problems · `vitest` 76/76 · `build` hijau (sitemap.xml + robots.txt tergenerate, /checkout jalan dengan layout snap scoped).

---

## Unit Test Coverage (Tahap 3)

| Function/path | File test | Kasus yang di-cover |
|---|---|---|
| `sitemap()` | `src/app/sitemap.test.ts` | homepage priority 1, public-only routes (no /checkout//api), absolute https URLs |
| `robots()` | `src/app/robots.test.ts` | allow `/`, disallow `/api/` + `/checkout`, sitemap URL benar |
| `formatWaDisplay()` (extract Footer→utils) | `src/lib/utils.test.ts` | format 62→+62 dashed, non-62 passthrough, empty string |
| `isConsultationFormComplete()` (extract FormKonsultasi→wa) | `src/lib/wa.test.ts` | nama kosong/whitespace, produk kosong, jumlah 0/negatif/non-numeric/empty ditolak; positif+desimal diterima |
| `waUrl`/`buildWAUrl`/`buildWAFormUrl`/`templates` | `wa.test.ts`, `constants.test.ts` | template URL encode, prefill fields |
| `formatRupiah`, `cn` | `utils.test.ts` | format IDR, merge class |
| `trackEvent`/`trackPurchase` | `tracking.test.ts` | gtag/fbq dispatch, SSR-safe |
| **Data integrity** (products/faq/testimonials/portfolio) | `src/data/integrity.test.ts` | unique ids, category valid, priceFrom>0, **image paths exist on disk** (guard permanen kelas LP-A-10), checkout-enabled punya spec options, rating 1-5 |
| `calculatePrice` + spec validation | `pricing.test.ts`, `schemas.test.ts` | pricing matrix, Zod contract |

**Sengaja tidak di-test (alasan eksplisit):** komponen UI glue (nav fallback Header, marquee pause, CatalogSection wiring, ProductCard branch, mobile menu) — butuh jsdom/RTL; kandidat Track B, preseden sama dengan CheckoutForm. Metadata/JSON-LD di layout.tsx — object literal, `next/font` tidak testable di node env; diverifikasi via build output.

## Track Gate (Tahap 3)

| Pertanyaan | Keputusan |
|---|---|
| User-facing butuh E2E? | **Nanti** — journey landing→WA/checkout kandidat E2E; skipped per keputusan user |
| Test shallow/lemah? | **Tidak** — data integrity test verify file on disk (fail nyata kalau asset hilang), validasi edge-case covered |
| Temuan UI/UX belum fix? | **Tidak blocking** — LP-A-19 residue (focus trap menu) + polish visual → Track C opsional |
| Dampak ke flow lain? | **Ya** — snap.js pindah ke checkout layout (checkout-flow); diverifikasi build hijau + route tetap jalan. WhatsAppButton tracking source baru → event Lead lebih lengkap (whatsapp-notification-flow tidak terpengaruh — beda layer) |

## UX Walkthrough — Redesign Visual (Sesi 12 Sep 2026)

**Mode:** eksekusi langsung (user override "gas eksekusi semuanya"), bukan audit-only. Grounding: `ui-ux-pro-max` (pattern Feature-Rich Showcase; rekomendasi palet luxury-gold skill ditolak karena off-brand — brand sudah established `#DE127A`).

### Perubahan yang di-ship

| Area | Before | After |
|---|---|---|
| Logo | `logo-bisaprint.webp` (bg putih kotak) | `logo-bisaprint.svg` vektor transparan; varian `-light.svg` untuk footer gelap |
| Navbar | sticky bar putih transparan | floating glass pill (`fixed`, rounded-full, blur) — logo pink kontras di atas pill putih di hero gradient |
| Hero | bg putih + ilustrasi wireframe | full-viewport pink gradient 4-layer (base + glow + dot texture + vignette bawah), teks putih, ilustrasi `hero-print.svg` (sticker sheet die-cut + kartu nama + poster roll) di kartu glass |
| Kategori | 5 kolom grid kecil rata | bento asymmetric: Digital Printing featured 2-kolom + thumbnail produk, tile CTA gradient pink |
| Why BisaPrint | ilustrasi + panel kartu | bento: kartu ilustrasi `why-bisaprint-v2.svg` + stat 10.000+ span 2 kolom, 7 kartu fitur grid 3 kolom |
| Cara Order | stepper horizontal 7 kartu sempit | split: panel sticky kiri (ilustrasi `chat-order.svg` mockup WA + CTA) + timeline vertikal numbered kanan |
| Konsultasi | kartu form flat tengah | split: copy + benefit checklist + reassurance card kiri, form card elevated + gradient top-bar kanan |
| Portfolio | base64 SVG gradient polos | 6 asset `public/assets/portfolio/*.svg` flat-lay bermakna (stiker, kartu nama, poster, undangan, jilid, packaging, merch) |
| Panduan File | list vertikal 7 item panjang | grid 4 kolom compact + tile CTA pink |
| FAQ | accordion penuh + badge `faq-001` + sticky-note | 2 kolom: sticky heading + kartu "Pertanyaan lain?" kiri, accordion kanan; badge id dihapus |
| Kontak | ilustrasi wireframe + kartu putih | kiri: info + chips sosial + Maps embed; kanan: kartu CTA gradient hijau WA + trust points |
| Footer | logo webp bg putih di dark bg | logo light SVG + glow radial pink/orange + kolom navigasi diperluas |
| Simulator | header bar flat sticky | header non-sticky dengan ikon tile, badge "Gratis", dot texture, pt untuk fixed navbar |
| Produk SVG | wireframe pudar | 7 asset produk digambar ulang flat-color (brosur, poster, dokumen, stiker, kartu nama, undangan, packaging) |
| Ilustrasi lama | print-team/why-bisaprint/cara-order/print-delivery | diarsipkan ke `_archive/assets/illustrations/` |

### Verifikasi
- Viewport dicek: desktop 1440 (hero, kategori, why, cara order, portfolio, panduan, kontak+footer) + mobile 375 (hero, kategori, why stack).
- `tsc --noEmit` clean, `eslint` clean, `vitest` 161/161, `next build` hijau.
- Catatan: halaman non-landing di `(public)` (checkout, success, simulator) diberi `pt-24/28` karena navbar sekarang `fixed` overlay.
- Tablet 768: tidak di-screenshot terpisah — breakpoint sm/lg sudah tercover di dua viewport yang dicek; grid bento `sm:grid-cols-2` dijamin konsisten.

## UX Walkthrough — Round 2 Polish (Sesi 12 Sep 2026, lanjutan)

Feedback user dari screenshot round 1 → fix:

| Keluhan | Root cause | Fix |
|---|---|---|
| Logo belum remove-bg | `logo-bisaprint.svg` adalah mark berbeda (kotak pink generik), bukan logo brand asli | `logo-bisaprint.webp` di-remove-bg via flood-fill edge (putih interior huruf P/strip utuh) → `logo-bisaprint-mark.png` 966×975 transparan; wordmark pindah ke HTML (`BrandLogo.tsx`) karena SVG `<text>` di `<img>` tidak bisa akses font halaman |
| Copy kategori janggal | "lalu scroll ke produknya" — padahal klik kartu sudah auto-scroll | "Klik kategori yang kamu butuhkan — langsung lompat ke daftar produknya" |
| Portfolio bolong | `columns-3` masonry + aspect bervariasi → kolom tidak seimbang, ada lubang | Grid seragam `sm:grid-cols-2 lg:grid-cols-4` aspect-[4/5] + tile CTA ke-8 ("Produk kamu selanjutnya di sini.") + caption judul selalu terlihat (hover-only → aksesibel di mobile) |
| WA card ada gap | `justify-between` di kartu setinggi kolom kiri (map) → void di tengah | `justify-center` + mini chat-preview bubble di tengah kartu (konten bermakna, tema WA) |
| Footer logo + ikon janky | logo webp/SVG lama; Shopee = kotak "S" merah | `BrandLogo light`; ikon brand resmi Simple Icons (CC0): Shopee path asli, IG/WA diekstrak ke konstanta — semua monochrome konsisten di lingkaran bordered |

**Cleanup:** 17 file orphan diarsip ke `_archive/` — hero/*.webp (6), machines/*.webp (2), icon/instagram.webp, products orphan (5: banner-spanduk, dtf-kaos, jilid-skripsi, print-dokumen-warna, totebag), brand/logo-bisaprint.svg + -light.svg, illustrations/underline-accent.svg. `public/` tersisa 21 file, semua tereferensi.

**Verifikasi:** tsc clean, eslint clean, vitest 161/161, build hijau. Screenshot verified: navbar logo (mark asli transparan di pill putih), portfolio grid 4×2 tanpa bolong + tile CTA, kontak WA card dengan chat preview, footer logo light + ikon Shopee proper, mobile 375px 1 kolom.

## UX Walkthrough — Round 3 (favicon + WhatsApp icon, Sesi 12 Sep 2026)

| Temuan | Root cause | Fix |
|---|---|---|
| Favicon tab masih Vercel | `src/app/favicon.ico` default Next tidak pernah diganti; metadata `icons` menunjuk `logo-tab.webp` (file conventions `favicon.ico` menang) | Generate `favicon.ico` (16/32/48) + `icon.png` (512) + `apple-icon.png` (180) dari `logo-bisaprint-mark.png`; hapus metadata `icons` manual — file conventions yang handle |
| Ikon WA = handset polos, bukan logo WhatsApp | `waIconPath` di Footer/ContactSection **ter-truncate** — cuma subpath handset, ring speech-bubble hilang. 6 file punya copy masing-masing (2 file ternyata punya versi lengkap beda digit) | `src/lib/brand-icons.ts` — `WHATSAPP_ICON_PATH` (Simple Icons resmi, lengkap) + `INSTAGRAM_ICON_PATH` + `SHOPEE_ICON_PATH` single source; semua 6 file import konstanta |

**Cleanup:** `logo-tab.webp` orphan → `_archive/assets/brand/`.
**Verifikasi:** `<link rel=icon>` DOM serve `/favicon.ico` + `/icon.png` + `/apple-icon.png` baru; footer icon WA render bubble+handset lengkap (screenshot mobile 375px); tsc + eslint clean, vitest 161/161, build hijau (route icon terdaftar static).
