# Bisa Print — Digital Printing Platform for UMKM

## Project Overview
Landing page + checkout untuk Bisa Print, percetakan digital di Bekasi yang melayani individu, UMKM, sekolah, kantor, dan event. Website menampilkan katalog produk (brosur, flyer, poster, print dokumen, stiker, kartu nama, undangan, packaging, dll), kalkulator layout cetak, dan checkout langsung via Midtrans. Alternatif order utama tetap WhatsApp Admin untuk produk custom dan konsultasi.

## Tech Stack
- **Framework**: Next.js 16.2.6 (App Router, Turbopack) + React 19 + TypeScript
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`, `@theme inline` for custom colors)
- **UI Pattern**: shadcn/ui-style components + Radix UI primitives (`@radix-ui/react-slot`)
- **Font**: Poppins (body) + Fredoka (display) via `next/font/google`
- **Animation**: Framer Motion
- **Validation**: Zod v4 (bila diperlukan untuk form/checkout)
- **Forms**: React Hook Form + `@hookform/resolvers` (bila diperlukan)
- **Payment**: Midtrans Snap (Snap.js + `midtrans-client`)
- **File Upload**: Local `/tmp` atau Vercel Blob di MVP
- **Image**: `next/image` wajib, output WebP
- **Icons**: lucide-react
- **Testing**: Vitest (unit/integration) + Playwright (E2E) — belum dikonfigurasi penuh

## Theme / Color Palette
Brand token diambil dari moodboard Bisa Print (pink/magenta hangat + orange accent):

```css
--color-primary: #DE127A
--color-primary-light: #EC91B4
--color-primary-muted: #D66E9E
--color-accent: #E87817
--color-accent-light: #F4A261
--color-accent-yellow: #FFD700
--color-bg-base: #FFFFFF
--color-bg-soft: #FFEAF4
--color-bg-card: #FFF5FA
--color-text-primary: #DE127A
--color-text-secondary: #5D2E4C
--color-text-muted: #A06080
--color-border: #F3D1E5
--color-border-strong: #DE127A
```

## Architecture
Project ini menggunakan struktur monolithic di dalam `src/` (dipilih karena sesuai skala landing page + checkout MVP dan sudah berjalan):

```
src/
  app/              # Routing + metadata (server components by default)
  components/       # UI components
    sections/       # Landing page sections
    shared/         # Cross-cutting components
    ui/             # Base UI primitives
    design-simulator/  # Kalkulator layout cetak
    checkout/       # Checkout flow components
  data/             # Static product/FAQ/portfolio/testimonial data
  lib/              # Shared helpers, constants, utilities
  types/            # Global TypeScript types
```

### Key Decisions
- **No `<img>` tag** — semua gambar wajib `next/image`.
- **No TypeScript `any`** — gunakan proper type atau `unknown`.
- **No inline style** untuk styling yang bisa ditangani Tailwind.
- **No GSAP** — animasi hanya Framer Motion + CSS keyframe sederhana.
- **Semua font load via `next/font`** — tidak ada Google Fonts CDN external.
- **Server Component by default** — tambahkan `"use client"` hanya jika perlu.
- **Midtrans Snap.js di-load via `next/script` dengan `afterInteractive`**.
- **Checkout MVP single product** — tidak ada cart, promo, multi-item.

## Project Structure

```
public/
  assets/
    brand/          # Logo, favicon, OG image
    products/       # Foto katalog produk (WebP)
    portfolio/      # Foto hasil cetak (WebP)
    hero/           # Hero images (WebP)
    icon/           # Icons
    machines/       # Foto mesin
  products/         # Default / legacy product images (WebP)
  robots.txt
  sitemap.xml

src/
  app/
    page.tsx                # Landing page
    layout.tsx              # Metadata, font, global providers
    globals.css             # Tailwind v4 + brand tokens
    checkout/page.tsx       # Checkout flow
    checkout/success/       # Payment success page
    simulator/page.tsx      # Full-page design simulator
    api/
      midtrans/create-token/route.ts  # Create Midtrans snap token
      midtrans/webhook/route.ts       # Midtrans payment notification
      orders/[orderId]/route.ts       # Order detail lookup
    error.tsx, not-found.tsx, loading.tsx

  components/
    sections/               # Hero, Kategori, Produk, USP, Cara Order, dll
    shared/                 # WhatsAppButton, WavyDivider, SectionHeader, dll
    ui/                     # Button, Card, Badge, Accordion (shadcn pattern)
    layout/                 # Header, Footer
    design-simulator/       # DesignSimulator, DesignCanvas, UploadZone, FloatingSimulator
    checkout/               # Komponen checkout
    tracking/               # MetaPixel, GoogleAnalytics

  data/
    products.ts             # Seed data katalog produk
    faq.ts                  # FAQ data
    portfolio.ts            # Portfolio data
    testimonials.ts         # Testimonial data

  lib/
    utils.ts                # cn, formatPrice, helpers murni
    constants.ts            # APP_NAME, WA number, site URL
    midtrans.ts             # Midtrans client helper
    wa.ts                   # WhatsApp URL builder
    paper-sizes.ts          # Ukuran kertas + imposition math
    tracking.ts             # Meta Pixel / GA helpers
```

## Environment Variables
Required (lihat `.env.local` untuk template):

```
NEXT_PUBLIC_SITE_NAME="Bisa Print"
NEXT_PUBLIC_WHATSAPP_NUMBER=6281299435019
NEXT_PUBLIC_WHATSAPP_MESSAGE="Halo Admin Bisa Print, saya mau order."

# Email (Resend atau Nodemailer)
EMAIL_FROM=""
EMAIL_TO=""
RESEND_API_KEY=""

# Midtrans
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION=false

# Tracking
META_PIXEL_ID=""
GOOGLE_ANALYTICS_ID=""
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

## Running

```bash
# 1. Setup environment
cp .env.local .env

# 2. Install dependencies
npm ci

# 3. Jalankan development server
npm run dev        # next dev (Turbopack)

# 4. Build & lint
npm run build      # next build
npm run lint       # eslint
```

## Product Catalog
Produk yang ditampilkan (sementara dari `src/data/products.ts`):
- Digital Printing: Brosur, Flyer, Poster, Banner, Voucher
- Print Dokumen: Print hitam putih/warna, jilid, laminating, skripsi, fotocopy
- Stiker & Label: Chromo, vinyl matte/glossy, transparan, label UMKM, kartu nama
- DTF & Apparel: Kaos DTF, totebag, hoodie
- Produk Custom: Undangan, souvenir, packaging, label nama

Katalog awal di `docs/ketentuan-produk-bisaprint.docx` akan dimigrasikan ke `src/data/products.ts` secara bertahap.

## Design Simulator (Kalkulator Layout A3)
- Ukuran kertas: **32.5 cm × 48.5 cm** (325 mm × 485 mm)
- Ukuran area cetak: **30.5 cm × 46 cm** (305 mm × 460 mm)
- Register marks: **siku (corner)** saja
- Margin: tidak ada — layout mengikuti area cetak
- Gap otomatis: **kiss cut 2 mm**, **die cut 4 mm**
- Fokus MVP: **stiker kemasan UMKM** — bentuk bulat dan kotak
- Support orientasi portrait/landscape, rotasi otomatis untuk efisiensi, export PNG/PDF.

## Payment & Checkout
- Midtrans Snap untuk checkout produk yang `isCheckoutEnabled: true`.
- Webhook Midtrans untuk update status pembayaran dan notifikasi WhatsApp admin.
- File desain max 10MB, format PDF/PNG/JPG.
- Order data tersimpan sementara di memory/store sederhana di MVP (bisa dipindah ke DB v2).

## Milestones

### Milestone 1 — DONE ✅
- Landing page utama (hero, katalog, USP, cara order, FAQ, kontak)
- Design simulator A3
- WhatsApp integration
- Branding & styling

### Milestone 2 — IN PROGRESS 🚧
- Checkout flow via Midtrans
- Upload file design
- Order confirmation page
- Webhook notifikasi admin

### Milestone 3 — BACKLOG 📝
- Admin dashboard / production
- Order history
- User account
- CMS untuk produk
- Shipping cost integration

## QA/QC Progress
Flow yang sedang aktif:
- `landing-page-flow`
- `design-simulator-flow`
- `checkout-flow`

Lihat `reports/status.md` untuk status terkini.

## Git
- **Branch**: `feat/<nama-fitur>` — jangan push ke `main`/`dev` kecuali diinstruksikan.
- **GitLab**: `bos-gitlab.beonesolution.com`
- **Pre-push**: Ikuti `.devin/workflows/pre-push-verification.md` sebelum commit/MR.

## Dokumentasi Terkait
- `PRD_BisaPrint_Website.md` — Product Requirement Document
- `AGENTS.md` — Rules untuk AI agents (always-on)
- `.devin/rules/` — Panduan teknis detail
  - `feature-architecture.md` — Struktur project BisaPrint (src/ monolithic, dengan catatan migrasi ke /features di masa depan)
  - `lib-architecture.md` — Aturan `src/lib`
  - `design-taste.md` — Frontend design guidelines
  - `quality-radar.md` — Defect detection checklist
  - `qa-qc-workflow-and-status-tracking.md` — QA/QC workflow
  - `nextjs-build-cicd-optimization.md` — Build & CI/CD rules
  - `e2e-investigation-no-loop.md` — E2E flaky debugging
  - `ponytail.md` — Lazy senior dev mode
  - `pre-flight-checklist.md` — Pre-flight task checklist
- `.devin/workflows/` — Execution guides
  - `e2e-fast-track.md`
  - `pre-push-verification.md`
- `reports/status.md` — Status QA/QC per flow
- `milestones/milestones.md` — Tracking milestone
