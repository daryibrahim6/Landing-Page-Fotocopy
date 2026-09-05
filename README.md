# Bisa Print

Landing page + checkout untuk Bisa Print — jasa digital printing di Bekasi. Melayani cetak brosur, flyer, poster, dokumen, stiker, kartu nama, undangan, DTF, dan produk custom. Order via WhatsApp atau checkout langsung dengan Midtrans.

## Tech Stack

- **Framework**: Next.js 16.2.6 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui pattern
- **Font**: Poppins (body) + Fredoka (display) via `next/font/google`
- **Animation**: Framer Motion
- **Payment**: Midtrans Snap
- **Image**: `next/image` — semua gambar WebP
- **Icons**: lucide-react

## Getting Started

1. Copy environment variables:

   ```bash
   cp .env.local .env
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Jalankan development server:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Scripts Penting

- `npm run dev` — development server (Turbopack)
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint

## Dokumentasi & Aturan

- `PROJECT.md` — spesifikasi project dan arsitektur
- `PRD_BisaPrint_Website.md` — Product Requirement Document
- `AGENTS.md` — aturan pengembangan dan AI-agent
- `.devin/rules/` — panduan teknis detail
- `reports/status.md` — status QA/QC per flow
