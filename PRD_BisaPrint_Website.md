# PRD — Website Landing Page Bisa Print
**Version:** 1.0  
**Status:** Draft — Ready for Execution  
**Prepared for:** Vibe Coding via OpenCode  
**Stack:** Next.js App Router · TypeScript Strict · Tailwind v4 · shadcn/ui · Framer Motion  
**Type:** Rebuild (existing folder structure dipertahankan)

---

## 1. Project Overview

**Bisa Print** adalah usaha digital printing yang melayani individu, UMKM, komunitas, sekolah, kantor, dan event. Website ini adalah rebuild dari proyek yang sudah ada, dengan tujuan memperkuat branding, menampilkan katalog produk secara rapi, dan mengonversi pengunjung — baik lewat WhatsApp Admin maupun checkout langsung via Midtrans.

| Atribut | Detail |
|---|---|
| Brand Name | Bisa Print |
| Tagline | *Bisa Mewujudkan Imajinasi Mu* |
| WhatsApp | +62 81299435019 |
| Instagram | @bisaprintshop |
| Email | bisadigitalprint@gmail.com |
| Social Proof | 10.000+ customer di Shopee |
| Mesin Produksi | Konica Minolta c2060 (warna), Konica Minolta 958 (BW) |

---

## 2. Goals & Success Metrics

### Primary Goals
1. Membangun kepercayaan dan branding pertama sebelum customer chat admin
2. Menampilkan katalog produk lengkap dengan harga mulai dari
3. Mengkonversi pengunjung ke WhatsApp Admin ATAU checkout langsung
4. Menyediakan alat bantu order (Design Simulator A3) sebagai diferensiator

### Success Metrics (Target 3 bulan post-launch)
- Bounce rate < 55%
- WhatsApp click-through rate > 8%
- Checkout conversion rate > 2% dari pengunjung halaman produk
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Indexable di Google untuk keyword lokal percetakan

---

## 3. Design Identity

> Ini adalah constraint paling krusial. AI dan developer wajib konsisten dengan sistem visual ini di setiap komponen.

### Visual Style
**Y2K Scrapbook / Collage / Playful** — bukan korporat, bukan minimalis.

| Elemen | Spesifikasi |
|---|---|
| Shapes | Blob organik, rounded irregular, bukan rectangle tajam |
| Dividers | Wavy SVG dividers antar section, bukan garis lurus |
| Decorative | Sparkle ✦, bintang kecil, confetti, sticker-style badges |
| Cards | Sticker-like: slight rotation (±2deg), outline tebal, drop shadow playful |
| Typography feel | Campuran font display (expressive) + body (readable) — lihat token |
| Layout energy | Dense tapi breathable — bukan kosong, bukan sesak |

### Color Palette
> **Catatan:** Hex eksak diambil dari Moodboard Bisa Print hal. 4 (Canva: `DAHKKmdq-yA`). Definisikan sebagai CSS custom properties di `globals.css` atau token Tailwind v4.

```css
/* Tailwind v4 — theme() token atau CSS vars di globals.css */
--color-primary:    [HEX — Warna Utama, pink/magenta dari moodboard]
--color-secondary:  [HEX — Warna Utama 2]
--color-tertiary:   [HEX — Warna Utama 3]
--color-accent:     [HEX — Warna Hint / orange accent]
--color-bg:         [HEX — Background utama]

/* Dark dari moodboard: pink sebagai primary, orange sebagai accent */
```

> Dari company profile dan moodboard: dominan **pink/magenta hangat** sebagai primary, **orange/amber** sebagai accent energik. Background cenderung terang/cream. Palette ini harus konsisten dari hero sampai footer — jangan ada section yang tiba-tiba abu-abu korporat.

### Typography
```
Display / Heading : [Font expressive — cek brand kit atau tentukan saat setup]
Body              : [Font readable — next/font, preload]
Mono (optional)   : Untuk panduan file cetak / spec teknis
```

**Hard rule:** Semua font load via `next/font`. Tidak ada Google Fonts CDN external. Tidak ada system font fallback yang merusak konsistensi.

---

## 4. Tech Stack & Hard Rules

### Stack
| Layer | Teknologi |
|---|---|
| Framework | Next.js App Router (verify version di `package.json`) |
| Language | TypeScript — strict mode (`"strict": true` di tsconfig) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Animation | **Framer Motion only** — tidak ada GSAP, tidak ada CSS keyframe manual untuk interaksi kompleks |
| Payment | Midtrans (Snap.js) |
| Image | `next/image` wajib — **tidak ada tag `<img>` bare** |

### Absolute Hard Rules
```
❌ Tidak ada <img> — semua pakai <Image> dari next/image
❌ Tidak ada TypeScript `any` — gunakan proper type atau `unknown`
❌ Tidak ada inline style untuk hal yang bisa di-handle Tailwind
❌ Tidak ada magic number tanpa komentar
❌ Tidak ada Framer Motion + GSAP bersamaan
✅ Semua komponen di /components dengan nama PascalCase
✅ Server Component by default — tambahkan "use client" hanya jika dibutuhkan
✅ next/font untuk semua font
✅ next/script untuk semua third-party script (Midtrans Snap, Meta Pixel)
```

---

## 5. Site Structure & Section Specs

Website adalah **single landing page** dengan navigasi anchor ke setiap section.

```
/                   → Landing page utama
/produk/[slug]      → Halaman detail produk (jika diperlukan untuk SEO)
/checkout           → Checkout flow (MVP, lihat section 7)
/api/midtrans       → Webhook & token endpoint
/api/orders         → Order management endpoint
```

### 5.1 Header (Sticky)
**Behavior:** Sticky top, background blur on scroll (Framer Motion `useScroll`).

**Konten:**
- Logo Bisa Print (SVG atau next/image WebP, width/height explicit)
- Nav: Produk · Portfolio · Cara Order · FAQ
- CTA Button: "Chat Admin" → WA link pre-filled
- Mobile: Hamburger dengan slide-down Framer Motion

**Notes:**
- WhatsApp button harus selalu visible di mobile (bottom of sticky header atau floating)
- Tidak ada mega menu — ini landing page, bukan e-commerce navigation

---

### 5.2 Hero Section
**Tujuan:** First impression — harus langsung communicate *playful + percaya*.

**Konten:**
- Headline utama (H1): *"Bisa Mewujudkan Imajinasi Mu"*
- Subheadline: deskripsi singkat layanan
- CTA Primary: "Order via WhatsApp" → WA pre-filled
- CTA Secondary: "Lihat Produk" → anchor scroll ke #produk
- Badge keunggulan: "10.000+ Customer" · "Cetak Satuan Bisa" · "Estimasi Cepat"
- Dekorasi visual: blob shapes, sparkle elements, product imagery atau ilustrasi

**Animation (Framer Motion):**
```
- Headline: fade up + spring, delay 0.1s
- Subheadline: fade up, delay 0.2s
- CTA buttons: fade up + scale spring, delay 0.3s
- Badge row: stagger fade in, delay 0.4s
- Dekorasi blob: continuous float (y: 0→-12→0, duration 4s, repeat)
- Sparkle: keyframes scale + opacity, staggered
```

**Hard rule:** Hero harus LCP-clean. Gambar utama wajib `priority` prop di `<Image>`. Tidak ada video autoplay di hero.

---

### 5.3 Kategori Produk
**Tujuan:** Navigasi cepat ke kategori — anchor atau filter.

**4 Kategori:**
| Kategori | Ikon / Visual | Contoh Produk |
|---|---|---|
| Digital Printing | — | Brosur, Flyer, Poster, Banner, Voucher |
| Print Dokumen | — | Print HB/Warna, Jilid, Laminating, Skripsi, Fotocopy |
| Stiker & Label | — | Vinil, Chromo, Transparan, Label UMKM, Kartu Nama, Sertifikat |
| DTF & Apparel | — | Kaos DTF, Totebag, Hoodie, Merchandise |
| Produk Custom | — | Undangan, Souvenir, Packaging, Label Nama, Produk Event |

**Component spec:** Sticker-like card, hover = slight lift + scale via Framer Motion spring. Click = scroll ke bagian produk kategori tersebut.

---

### 5.4 Produk Best Seller / Katalog
**Tujuan:** Menampilkan produk unggulan dengan detail yang cukup untuk memicu kontak.

**Setiap product card wajib memiliki:**
```typescript
interface Product {
  id: string
  name: string
  category: ProductCategory
  description: string
  priceFrom: number          // "Mulai dari Rp..."
  unit: string               // "per lembar" | "per pcs" | dll
  sizes: string[]            // ["A4", "A5", "Custom"]
  materials: string[]        // ["Chromo", "Vinyl", "dll"]
  finishings: string[]       // ["Glossy", "Matte", "Laminasi"]
  estimasi: string           // "1-2 hari kerja"
  fileSpecs: string          // "PDF/PNG 300dpi CMYK"
  images: string[]           // path di /public/products/
  isCheckoutEnabled: boolean // false = WA only, true = ada tombol beli
  whatsappTemplate: string   // pre-filled WA message template
}
```

**CTA per card:**
- Jika `isCheckoutEnabled: false` → tombol "Tanya Admin" ke WA pre-filled
- Jika `isCheckoutEnabled: true` → tombol "Pesan Sekarang" ke `/checkout?product=[id]`

**Konten WhatsApp pre-filled:**
```
Halo Admin Bisa Print, saya mau order.
Produk: [nama produk]
Jumlah: 
Ukuran: 
Bahan: 
Catatan: 
```

---

### 5.5 Kenapa Bisa Print (USP Section)
**Konten (dari company profile):**
- Proses order mudah via WhatsApp
- Bisa cetak satuan maupun jumlah banyak
- Cocok untuk UMKM, event, sekolah, kantor, personal
- Banyak pilihan produk cetak
- Tim CS & produksi yang responsif
- File bisa dicek dulu sebelum cetak
- Cocok untuk kebutuhan cepat dan custom

**Visual:** Icon + teks, layout grid playful, bukan list korporat.

---

### 5.6 Cara Order via WhatsApp
**Tujuan:** Edukasi alur — mengurangi anxiety customer baru.

**Alur (7 langkah):**
1. Pilih produk di website
2. Klik tombol Order via WhatsApp
3. Kirim detail: ukuran, jumlah, bahan, file desain
4. Admin cek file & hitung estimasi harga
5. Konfirmasi order & pembayaran
6. Masuk proses produksi
7. Ambil langsung atau dikirim ke alamat

**Animation:** Numbered step cards, stagger reveal on scroll (`useInView`).

---

### 5.7 Form Konsultasi Order (WA Redirect)
**Bukan form submit ke backend.** Ini form yang membuild WA deep-link secara client-side.

**Field:**
```
Nama       : text input
Produk     : select (dari list produk)
Jumlah     : number input
Ukuran     : text input
Bahan      : text input (optional)
Catatan    : textarea
```

**Behavior:** Klik "Konsultasi via WhatsApp" → generate `wa.me/6281299435019?text=[encoded message]` → open in new tab.

**Hard rule:** Tidak ada backend untuk form ini. Zero server cost, zero GDPR concern.

---

### 5.8 Portfolio / Galeri
**Konten:** Foto hasil cetak dan proses produksi.

**Layout:** Masonry atau grid dengan lightbox. Bisa difilter per kategori.

**Implementation note:** Gunakan next/image dengan `fill` + `sizes` yang benar untuk lazy loading masonry. Jangan preload semua gambar — hanya visible viewport.

---

### 5.9 Testimoni
**Sumber:** Review customer + ulasan marketplace (Shopee 10K+ customer).

**Komponen:** Carousel atau grid card — auto-scroll halus (Framer Motion `animate` infinite), pause on hover.

**Konten per card:**
- Nama customer (inisial atau nama depan)
- Bintang rating
- Teks review
- Produk yang dibeli (optional)
- Badge "Shopee Review" / "WhatsApp" sebagai source indicator

---

### 5.10 Panduan File Siap Cetak
**Tujuan:** Edukasi customer agar file yang dikirim sudah benar → mengurangi revisi admin.

**Konten:**
- Format: PDF, PNG, JPG, CDR, AI, PSD
- Resolusi minimal: 300 dpi
- Warna: CMYK disarankan
- Ukuran desain harus sesuai ukuran cetak
- Tambahkan bleed jika dibutuhkan
- Font: convert to outline atau embed
- Hindari gambar pecah, blur, atau terlalu kecil

**Visual:** Illustrated guide / checklist visual, bukan tabel kering.

---

### 5.11 FAQ
**10 pertanyaan wajib:**
1. Apakah bisa cetak satuan?
2. Apakah bisa order lewat WhatsApp?
3. Apakah bisa desain sekalian?
4. Berapa lama proses produksi?
5. Apakah bisa kirim ke luar kota?
6. File desain harus format apa?
7. Apakah file bisa dicek dulu?
8. Apakah bisa ambil langsung di toko?
9. Pembayaran lewat apa saja?
10. Apakah bisa konsultasi bahan dulu?

**Component:** Accordion (shadcn/ui `Accordion`), smooth Framer Motion height animation.

---

### 5.12 Kontak & Lokasi
**Konten:**
- WhatsApp: +62 81299435019 (tombol langsung chat)
- Instagram: @bisaprintshop
- Email: bisadigitalprint@gmail.com
- Google Maps embed (lokasi toko)
- Jam operasional
- Alamat lengkap

---

### 5.13 Footer
**Konten:**
- Logo + tagline
- Link navigasi: Produk · Portfolio · FAQ · Panduan File
- Marketplace: Shopee (link toko)
- Sosial media: Instagram
- WhatsApp button
- Copyright © Bisa Print [tahun]

---

## 6. Floating Elements (Persistent UI)

### 6.1 Floating WhatsApp Button
**Posisi:** Kanan bawah, `fixed bottom-6 right-6`  
**Behavior:**
- Selalu visible kecuali saat halaman checkout (sembunyikan di `/checkout`)
- Pulse animation subtle (Framer Motion scale keyframe)
- Tooltip "Chat Admin" muncul on hover

---

### 6.2 Floating Design Simulator Button (FITUR KHAS)
**Posisi:** Kiri tengah, `fixed left-0 top-1/2 -translate-y-1/2`  
**Spesifikasi:** Tool bantu layout stiker — client-side only, zero backend.

**Trigger:** Tab/tombol di kiri layar → slide-in panel dari kiri.

**Fitur panel (A3 Only — 325 × 485 mm):**

```typescript
interface SimulatorConfig {
  // Input
  designWidth: number       // mm
  designHeight: number      // mm
  locked: boolean           // lock aspect ratio
  gutter: number            // mm, range 0–20, default 0
  marginSensor: number      // mm, range 0–20, default 10
  orientation: 'portrait' | 'landscape'
  register: 'siku-l' | 'center' | 'none'

  // Computed (pure client-side math)
  paperWidth: 325           // FIXED — A3 only
  paperHeight: 485          // FIXED — A3 only
  cols: number              // Math.floor((paperW - 2*margin) / (designW + gutter))
  rows: number              // Math.floor((paperH - 2*margin) / (designH + gutter))
  totalFit: number          // cols * rows

  // Preview
  gridPreview: SVGGrid      // rendered preview of layout
}
```

**Computed logic (contoh):**
```typescript
const usableW = paperWidth - 2 * marginSensor
const usableH = paperHeight - 2 * marginSensor
const cols = Math.floor(usableW / (designWidth + gutter))
const rows = Math.floor(usableH / (designHeight + gutter))
const totalFit = cols * rows
```

**Export:** Tombol "Simpan PNG" dan "Simpan PDF" → client-side canvas/SVG export (pakai `html2canvas` atau `jsPDF` via dynamic import).

**Catatan penting:**
- Ini A3 ONLY sesuai instruksi client — tidak ada pilihan kertas lain di MVP
- Panel bisa dibuka/tutup dengan slide animation (Framer Motion `x` transition)
- Mobile: panel full-screen bottom sheet
- Tidak perlu auth, tidak ada data yang disimpan ke server

---

## 7. Checkout MVP — Scope & Flow

> **Scope MVP dikunci ketat.** Apapun di luar scope ini masuk backlog v2.

### 7.1 Produk yang Checkout-Enabled (MVP)
Hanya produk dengan spesifikasi yang bisa dikuantifikasi tanpa konsultasi:

| Produk | Alasan bisa checkout |
|---|---|
| Print dokumen HB/Warna | Ukuran standard (A4), harga per lembar jelas |
| Stiker chromo / vinil | Ukuran custom tapi bisa diinput |
| Kartu nama standard | Ukuran fixed, material fixed |
| Fotocopy (jika tersedia) | Per lembar, straightforward |

Semua produk **custom, apparel, event, undangan → WA only**. Tidak ada checkout untuk produk yang butuh konsultasi file/spec.

### 7.2 Checkout Flow (MVP)

```
1. Customer klik "Pesan Sekarang" di product card
   ↓
2. Halaman /checkout?product=[id]
   - Detail produk auto-populated
   - Customer pilih: ukuran, material, jumlah, finishing
   - Harga auto-calculate (client-side, based on price table)
   - Upload file desain (opsional, max 10MB, format: PDF/PNG/JPG)
   ↓
3. Form customer info
   - Nama lengkap
   - Nomor WhatsApp (untuk konfirmasi)
   - Email (untuk invoice)
   - Metode pengambilan: Ambil sendiri | Kirim (Jabodetabek, via ongkir manual)
   - Catatan tambahan
   ↓
4. Order summary + konfirmasi
   - Review semua detail
   - Total harga
   - Estimasi pengerjaan
   ↓
5. Bayar via Midtrans Snap
   - Trigger: POST /api/midtrans/create-token
   - Snap.js popup (via next/script)
   - Payment methods: Transfer bank, QRIS, e-wallet
   ↓
6. Post-payment
   - Success → halaman konfirmasi
   - Notifikasi WA ke customer (via wa.me link auto-open atau WA Business API jika ada)
   - Notifikasi ke admin WA otomatis (via webhook Midtrans → /api/midtrans/webhook)
   - Email konfirmasi (opsional v1 — bisa skip jika belum ada email service)
```

### 7.3 Backend Endpoints (MVP)

```
POST /api/midtrans/create-token
  Body: { orderId, items, customerDetails, grossAmount }
  Returns: { token: string, redirectUrl: string }

POST /api/midtrans/webhook
  Body: Midtrans notification payload
  Action: Update order status, kirim notif WA admin

GET  /api/orders/[orderId]
  Returns: order detail (untuk halaman konfirmasi)
```

### 7.4 Order Data Model (MVP)

```typescript
interface Order {
  id: string                    // generated, e.g. BP-2024-XXXX
  productId: string
  productName: string
  specs: Record<string, string> // { ukuran: 'A4', material: 'Chromo', jumlah: '50' }
  fileUrl?: string              // uploaded file path (ke /tmp atau cloud storage)
  customer: {
    name: string
    whatsapp: string
    email: string
    pickup: 'ambil' | 'kirim'
    address?: string
    notes?: string
  }
  pricing: {
    subtotal: number
    shippingEstimate?: number
    total: number
  }
  payment: {
    status: 'pending' | 'paid' | 'cancelled' | 'expired'
    midtransOrderId: string
    paidAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}
```

### 7.5 File Upload (MVP)
- Storage: **local `/tmp` atau Vercel Blob** (bukan S3 dulu di MVP)
- Max size: 10MB per file
- Format: PDF, PNG, JPG only
- File path dikirim ke admin via notifikasi WA webhook

### 7.6 Yang TIDAK Ada di Checkout MVP
```
❌ User account / login
❌ Order history dashboard
❌ Promo code / diskon
❌ Multiple items (satu produk per checkout — KISS)
❌ Real-time shipping cost calculation (estimasi manual)
❌ Email service (notif via WA cukup untuk MVP)
❌ Refund flow
❌ Midtrans recurring payment
```

---

## 8. Animation Guidelines (Framer Motion)

> Semua animasi pakai Framer Motion. Tidak ada GSAP. Tidak ada `animate.css`. CSS transition hanya untuk micro-interactions sederhana (color, opacity < 150ms).

### 8.1 Scroll-triggered Reveals
```typescript
// Gunakan useInView dari framer-motion
const { ref, inView } = useInView({ once: true, margin: "-100px" })

// Standard entrance animation
const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}
```

### 8.2 Stagger Children
```typescript
// Container
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

// Item
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
```

### 8.3 Floating / Decorative Elements
```typescript
// Blob / dekorasi hero
animate={{ y: [0, -12, 0] }}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}

// Sparkle
animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
```

### 8.4 Hover Interactions
```typescript
// Product card
whileHover={{ scale: 1.03, rotate: 1 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}

// CTA button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.97 }}
```

### 8.5 Page Transition (App Router)
```typescript
// Layout wrapper — AnimatePresence + motion.div
// Key = pathname untuk trigger re-animation
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2 }}
```

### 8.6 Design Simulator Panel
```typescript
// Slide in dari kiri
animate={{ x: isOpen ? 0 : "-100%" }}
transition={{ type: "spring", stiffness: 400, damping: 40 }}
```

### Performance Rules
- Gunakan `will-change: transform` hanya pada elemen yang **benar-benar** animating
- `layoutId` untuk shared element transitions — jangan overuse
- Disable animasi jika `prefers-reduced-motion` aktif:
```typescript
const prefersReduced = useReducedMotion()
const transition = prefersReduced ? { duration: 0 } : { duration: 0.5 }
```

---

## 9. SEO & Performance

### 9.1 Metadata (Next.js App Router)
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "Bisa Print — Cetak Digital, Stiker, DTF, Kartu Nama & Lebih",
  description: "Jasa cetak digital printing: stiker, banner, kartu nama, DTF kaos, print dokumen. Order mudah via WhatsApp. 10.000+ customer. Cepat, custom, harga terjangkau.",
  keywords: ["cetak stiker", "digital printing", "kartu nama", "DTF kaos", "print dokumen", "percetakan"],
  openGraph: { /* OG tags lengkap */ },
  twitter: { /* Twitter card */ }
}
```

### 9.2 Structured Data
```json
{
  "@type": "LocalBusiness",
  "name": "Bisa Print",
  "telephone": "+6281299435019",
  "sameAs": ["https://instagram.com/bisaprintshop"],
  "priceRange": "Rp",
  "openingHours": "..."
}
```

### 9.3 Image Optimization
- Semua gambar: WebP format, width/height explicit
- Hero image: `priority={true}`
- Below fold: `loading="lazy"` (default next/image)
- `sizes` prop wajib diisi untuk responsive

### 9.4 Pixel Tracking
```typescript
// Gunakan next/script strategy="afterInteractive"
// Meta Pixel dan/atau Google Ads
// Jangan block rendering
```

---

## 10. File & Folder Structure (Relevan untuk Rebuild)

```
/app
  /layout.tsx              ← metadata, font, global providers
  /page.tsx                ← landing page (semua section)
  /checkout
    /page.tsx              ← checkout flow
  /api
    /midtrans
      /create-token/route.ts
      /webhook/route.ts
    /orders
      /[orderId]/route.ts

/components
  /sections                ← per section: Hero, Katalog, Testimoni, dll
  /ui                      ← shadcn components + custom
  /simulator               ← Design Simulator panel
  /checkout                ← komponen checkout flow

/lib
  /products.ts             ← product data / CMS
  /midtrans.ts             ← Midtrans client helper
  /wa.ts                   ← WhatsApp URL builder utility
  /simulator.ts            ← A3 layout math utils

/public
  /products                ← foto produk (WebP)
  /portfolio               ← foto portfolio
  /fonts                   ← jika font self-hosted

/types
  /index.ts                ← semua interface/type global
```

---

## 11. WhatsApp Integration Details

### Pre-filled Message Templates

```typescript
// lib/wa.ts
const WA_NUMBER = "6281299435019"

export function buildWAUrl(template: WATemplate): string {
  const text = encodeURIComponent(templates[template])
  return `https://wa.me/${WA_NUMBER}?text=${text}`
}

// Templates
export const templates = {
  general: `Halo Admin Bisa Print, saya mau konsultasi order.\nNama:\nProduk:\nJumlah:\nUkuran:\nBahan:\nCatatan:`,
  fromProduct: (productName: string) =>
    `Halo Admin Bisa Print, saya mau order.\nProduk: ${productName}\nJumlah:\nUkuran:\nBahan:\nCatatan:`,
  postCheckout: (orderId: string) =>
    `Halo Admin Bisa Print, saya sudah bayar order ${orderId}. Mohon konfirmasi dan cek file desain saya. Terima kasih!`,
}
```

### WhatsApp Button Placement
Sesuai spesifikasi, tombol WA harus ada di:
- [ ] Header
- [ ] Hero section
- [ ] Setiap product card
- [ ] Setelah section portfolio
- [ ] Section FAQ
- [ ] Footer
- [ ] **Floating button kanan bawah** (persistent)

---

## 12. Product Data (Initial Seed)

> Data ini adalah seed awal. Bisa dipindah ke CMS (Sanity/Contentful) di v2.

```typescript
// lib/products.ts
export const products: Product[] = [
  {
    id: "stiker-chromo",
    name: "Stiker Chromo",
    category: "stiker-label",
    description: "Stiker dengan bahan chromo, cocok untuk label produk UMKM, stiker promosi, dan packaging.",
    priceFrom: 500,
    unit: "per lembar (A4)",
    sizes: ["A4", "A5", "Custom"],
    materials: ["Chromo"],
    finishings: ["Glossy", "Matte", "Laminasi"],
    estimasi: "1-2 hari kerja",
    fileSpecs: "PDF atau PNG, 300dpi, CMYK, ukuran sesuai cetak",
    images: ["/products/stiker-chromo-1.webp"],
    isCheckoutEnabled: true,
    whatsappTemplate: "fromProduct",
  },
  {
    id: "print-dokumen-bw",
    name: "Print Dokumen Hitam Putih",
    category: "print-dokumen",
    description: "Print dokumen A4 hitam putih, cocok untuk proposal, skripsi, laporan.",
    priceFrom: 300,
    unit: "per lembar",
    sizes: ["A4"],
    materials: ["HVS 80gsm"],
    finishings: ["Tanpa finishing", "Jilid spiral", "Jilid hard cover"],
    estimasi: "Hari yang sama (tergantung jumlah)",
    fileSpecs: "PDF, resolusi bebas",
    images: ["/products/print-bw-1.webp"],
    isCheckoutEnabled: true,
    whatsappTemplate: "fromProduct",
  },
  // ... produk lainnya
]
```

---

## 13. Environment Variables

```env
# .env.local

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false     # true saat go-live

# App
NEXT_PUBLIC_SITE_URL=https://bisaprint.com
NEXT_PUBLIC_WA_NUMBER=6281299435019

# Storage (pilih salah satu untuk file upload)
BLOB_READ_WRITE_TOKEN=            # Vercel Blob

# Optional
META_PIXEL_ID=
GOOGLE_ANALYTICS_ID=
```

---

## 14. Out of Scope — v1

Hal-hal berikut **tidak dikerjakan** dalam rebuild ini. Dicatat agar tidak scope creep:

```
❌ CMS / admin dashboard (produk dikelola via code)
❌ User account & order history
❌ Multiple checkout items (cart)
❌ Real-time stock
❌ Promo code / diskon
❌ Desain service (form request desain)
❌ WA Business API (notif otomatis pakai wa.me biasa dulu)
❌ Multi-bahasa (Indonesia only)
❌ Dark mode
❌ Blog / artikel
❌ Affiliate / referral
❌ Pilihan kertas selain A3 di Design Simulator
```

---

## 15. Launch Checklist

```
□ Semua TypeScript error 0 — `tsc --noEmit` clean
□ `next build` sukses tanpa warning
□ Lighthouse score: Performance ≥ 85, SEO ≥ 90, Accessibility ≥ 80
□ Midtrans sandbox test — semua payment method sukses
□ WA pre-filled message test di mobile dan desktop
□ Design Simulator: hitung muat benar, export PNG/PDF benar
□ Mobile responsive: 375px, 390px, 414px
□ `prefers-reduced-motion` — animasi disabled dengan benar
□ Meta Pixel / GA firing di key events
□ sitemap.xml + robots.txt accessible
□ OG image test via opengraph.xyz
□ Form konsultasi: WA URL encode benar, tidak ada karakter rusak
□ Checkout flow end-to-end: dari product card → payment → konfirmasi
□ Webhook Midtrans: test dengan ngrok atau Vercel preview
```

---

*PRD ini dibuat berdasarkan: Rangkuman Website Bisa Print, Company Profile Canva (DAHKunlQS1E), Moodboard Canva (DAHKKmdq-yA), referensi Design Simulator A3, dan diskusi requirements.*

*Last updated: Juni 2026*
