# AGENTS.md — BisaPrint Landing Page

> Baca file ini di awal setiap sesi. Ini satu-satunya sumber kebenaran.
> Berlaku untuk semua AI agents: Antigravity, Claude Code, Cursor, atau apapun.

---

## 1. PROJECT OVERVIEW

**Klien:** BisaPrint — jasa percetakan digital lokal Bekasi  
**Tipe:** Single-page landing page (BUKAN multi-page, BUKAN e-commerce)  
**Tujuan:** Branding + katalog produk + semua konversi ke WhatsApp  
**Deploy:** Vercel  
**WA Admin:** +628119198611

**Yang TIDAK ada di website ini:**
- ❌ Checkout / cart / payment
- ❌ Login / register
- ❌ Form kontak (cukup redirect WA)
- ❌ Halaman /sewa, /spare-part, /katalog terpisah
- ❌ API routes

---

## 2. TECH STACK

```
Framework  : Next.js 16.2 (App Router)
Language   : TypeScript strict
Styling    : Tailwind CSS v4
UI Lib     : shadcn/ui (Radix primitives)
Animation  : Framer Motion
Icons      : Lucide React
Fonts      : next/font (Nunito + Nunito Sans)
Deploy     : Vercel
```

**Hard rules:**
- App Router only — tidak ada `/pages` directory
- `"use client"` hanya jika butuh state/effects/browser API
- `next/image` wajib — tidak boleh `<img>` biasa
- `next/font` wajib — tidak boleh `<link>` font
- Tidak ada `any`, tidak ada `// @ts-ignore`
- Tidak ada hardcode hex — gunakan CSS variables atau Tailwind token

---

## 3. DESIGN SYSTEM

### 3.1 Brand Aesthetic
**Y2K Scrapbook / Collage / Playful** — bukan korporat, bukan minimal.  
Kata kunci: fun, ekspresif, berani, lokal, hangat, kreatif.  
Satu aturan: jika sesuatu terasa "slide PowerPoint" → itu salah.

### 3.2 Color Tokens (globals.css)

```css
:root {
  --color-primary:        #E0187A;
  --color-primary-light:  #F48FB1;
  --color-primary-muted:  #CE7AA0;
  --color-accent:         #E07820;
  --color-accent-light:   #FFB347;
  --color-bg-base:        #FFFFFF;
  --color-bg-soft:        #FFF0F5;
  --color-bg-card:        #FFF8FB;
  --color-text-primary:   #1A0A0F;
  --color-text-secondary: #6B3A50;
  --color-text-muted:     #A06080;
  --color-border:         #F0C0D8;
  --color-border-strong:  #E0187A;
}
```

### 3.3 Typography

```
Display / Heading : Nunito (700, 800, 900) → var(--font-display)
Body              : Nunito Sans (400, 500, 600) → var(--font-body)

h1, h2  → font-display font-black
body    → font-body
```

### 3.4 Elemen Dekoratif (Y2K Scrapbook)

BOLEH dan DIANJURKAN:
- ✅ Blob shapes organik (SVG inline)
- ✅ Sparkle/bintang ✦ sebagai accent
- ✅ Wavy dividers antar section
- ✅ Badge pill dengan border tebal
- ✅ "Masking tape" visual effect (strip warna diagonal)
- ✅ Sticker-like cards (slight rotation, drop shadow)
- ✅ Halftone dot pattern sebagai texture (opacity rendah)
- ✅ Torn paper edge effect
- ✅ Rounded pill buttons
- ✅ Overlapping elements

DILARANG KERAS:
- ❌ Gradient ungu/biru
- ❌ Font Inter, Roboto, Arial di heading
- ❌ Shadow korporat (box-shadow tebal abu-abu)
- ❌ Sharp corners pada interactive elements
- ❌ Layout yang terasa template/generic
- ❌ Warna di luar palette tanpa alasan kuat

### 3.5 Spacing & Radius

```
Button   : rounded-full
Card     : rounded-2xl atau rounded-3xl
Badge    : rounded-full
Input    : rounded-xl
Section  : py-16 md:py-24, max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

---

## 4. SITE STRUCTURE (Single Page)

```
Header (sticky)
│
├─ #beranda      → HeroSection
├─ [WavyDivider]
├─ #kenapa       → WhyBisaPrint
├─ [WavyDivider]
├─ #produk       → ProductCatalog
├─ [WavyDivider]
├─ #portfolio    → PortfolioGallery
├─ [WavyDivider]
├─ #testimoni    → Testimonials
├─ [WavyDivider]
├─ #faq          → FaqSection
├─ [WavyDivider]
└─ #kontak       → ContactSection

Footer
WhatsAppButton (floating, fixed bottom-right)
```

---

## 5. FOLDER STRUCTURE FINAL

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── WhyBisaPrint.tsx
│   │   ├── ProductCatalog.tsx
│   │   ├── PortfolioGallery.tsx
│   │   ├── Testimonials.tsx
│   │   ├── FaqSection.tsx
│   │   └── ContactSection.tsx
│   ├── shared/
│   │   ├── WhatsAppButton.tsx
│   │   ├── ProductCard.tsx
│   │   ├── SectionWrapper.tsx
│   │   ├── WavyDivider.tsx
│   │   └── BlobDecoration.tsx
│   └── ui/
│       └── button.tsx
├── data/
│   ├── products.ts
│   ├── testimonials.ts
│   ├── portfolio.ts
│   └── faq.ts
├── lib/
│   ├── constants.ts
│   └── utils.ts
└── types/
    └── index.ts
```

---

## 6. KEY PATTERNS

### WhatsApp CTA
```ts
// lib/constants.ts
export const WA_NUMBER = "628119198611"

export function waUrlProduct(productName: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Halo BisaPrint, saya tertarik dengan ${productName}`
  )}`
}
```

### Product Type
```ts
export interface Product {
  id: string
  name: string
  category: 'digital-print' | 'document' | 'sablon' | 'umkm'
  description: string
  startingPrice: number
  image: string
  whatsappMessage: string
  featured?: boolean
}
```

---

## 7. PLACEHOLDER RULES

Website sedang di fase "gambaran awal ke klien" — placeholder diizinkan dengan syarat:

- ✅ Teks placeholder realistis dalam Bahasa Indonesia
- ✅ Placeholder image: gradient pink dengan emoji + label
- ❌ Tidak boleh ada "Lorem ipsum" sama sekali
- ❌ Tidak boleh ada "[INSERT TEXT HERE]"
- ❌ Tidak boleh deploy ke domain live dengan placeholder

---

## 8. COPY TONE

Semua teks UI dalam Bahasa Indonesia.  
Tone: informal, friendly, energik — gunakan "kamu" bukan "Anda".  
Contoh benar: "Cetak impianmu, bisa!" / "Urgent? Bilang aja."  
Contoh salah: "Kami menyediakan layanan percetakan profesional."

---

## 9. SEO

- Title: "BisaPrint — Percetakan Digital Bekasi"
- Keywords: percetakan sumedang, cetak murah sumedang, digital printing sumedang
- Locale: id_ID
- LocalBusiness JSON-LD: tambahkan setelah alamat klien dikonfirmasi

---

## 10. KONTEN YANG MASIH KURANG (tunggu dari klien)

| Aset | Status |
|------|--------|
| Foto portfolio | ⏳ Belum |
| Screenshot testimoni | ⏳ Belum |
| Harga "mulai dari" | ⏳ Belum |
| Foto mesin Konica Minolta | ⏳ Belum |
| Alamat lengkap | ⏳ Belum |
| Handle sosmed | ⏳ Belum |
| Logo SVG | ⏳ Perlu dicek |
| Nomor WA | ✅ 628119198611 |

---

## 11. REAL ASSETS

**Note:** All assets require transparent PNG background.

### /public/assets/machines/
- `konica-c2060.png` → Digunakan di HeroSection
- `konica-958.png` → Digunakan di WhyBisaPrint

### /public/assets/brand/
- `logo-bisaprint.png` → Digunakan di Header, Footer

### /public/assets/decoratives/
- `arrow-curved.png` → Digunakan di HeroSection, ContactSection
- `badge-scalloped.png` → Digunakan di ProductCard (featured)
- `blob-pink-glossy.png` → Digunakan di HeroSection, ContactSection
- `bow-ribbon.png` → Digunakan di Testimonials, ContactSection
- `camera-sticker.png` → Digunakan di PortfolioGallery
- `exclamation.png` → Digunakan di ProductCatalog
- `gem-crystal.png` → Digunakan di WhyBisaPrint, FaqSection
- `pushpin.png` → Digunakan di FaqSection
- `sparkle-stars.png` → Digunakan di HeroSection, PortfolioGallery, Testimonials
- `squiggle-orange.png` → Digunakan di HeroSection, WhyBisaPrint, ProductCatalog, Footer
- `swoosh-orange.png` → Digunakan di WhyBisaPrint
- `tape-strip.png` → Digunakan di HeroSection, ProductCard, PortfolioGallery, Testimonials
- `torn-paper-corner.png` → Digunakan di PortfolioGallery
- `torn-paper-tape.png` → Digunakan di ContactSection
- `wavy-divider.png` → Digunakan di Footer

---

*Maintainer: Dary Ibrahim | Last updated: Mei 2026*
