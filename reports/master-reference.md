# Master Reference — Bisa Print

## Project Identity

- **Name:** Bisa Print
- **Tagline:** Bisa Mewujudkan Imajinasi Mu
- **Domain:** Digital printing, fotocopy, stiker, kartu nama, undangan, DTF, packaging
- **Target Audience:** UMKM, sekolah, kantor, event, personal
- **WhatsApp:** +62 812-9943-5019
- **Instagram:** @bisaprintshop
- **Email:** bisadigitalprint@gmail.com
- **Address:** Jl. Dalang I No.45, Pengasinan, Rawalumbu, Kota Bekasi, Jawa Barat 17115

## Production Specs

- **A3 BisaPrint sheet:** 325 × 485 mm
- **A3 with register marks (siku):** 310 × 470 mm
- **Printable area:** 305 × 460 mm
- **Register marks:** corners only (siku)
- **Margin:** none — layout follows printable area
- **Gap:**
  - Kiss cut: 2 mm
  - Die cut: 4 mm

## Tech Stack

- Next.js 16.2.6 + React 19 + TypeScript (strict)
- Tailwind CSS v4
- Framer Motion
- Midtrans Snap
- `next/image` wajib, WebP preferred
- `next/font` (Fredoka display, Poppins body)

## Folder Conventions

| Folder | Purpose |
|--------|---------|
| `src/app` | Routing, metadata, page composition |
| `src/components/sections` | Landing page sections |
| `src/components/shared` | Cross-cutting UI |
| `src/components/ui` | Base UI primitives |
| `src/components/design-simulator` | Sticker layout calculator |
| `src/components/checkout` | Checkout flow components |
| `src/data` | Static product/FAQ/portfolio/testimonial data |
| `src/lib` | Shared helpers, constants, domain logic |
| `src/types` | Global TypeScript types |
| `public/assets` | Optimized WebP images |

## Key Files

- `src/lib/paper-sizes.ts` — Imposition math for A3 BisaPrint
- `src/components/design-simulator/DesignSimulator.tsx` — UMKM sticker calculator
- `src/lib/midtrans.ts` — Midtrans helper
- `src/app/api/midtrans/create-token/route.ts` — Snap token
- `src/app/api/midtrans/webhook/route.ts` — Payment notification
- `src/data/products.ts` — Product catalog
- `src/lib/wa.ts` — WhatsApp URL builder
- `.env.local` — Environment template

## Design Tokens

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

## Rules Reference

- `AGENTS.md` — AI-agent project rules (always-on)
- `.devin/rules/feature-architecture.md` — Folder & data-fetching rules
- `.devin/rules/lib-architecture.md` — `src/lib` rules
- `.devin/rules/quality-radar.md` — Defect detection (always-on)
- `.devin/rules/design-taste.md` — Frontend design guidelines
- `.devin/rules/nextjs-build-cicd-optimization.md` — Build & deploy rules
- `.devin/rules/qa-qc-workflow-and-status-tracking.md` — QA/QC workflow
- `.devin/rules/e2e-investigation-no-loop.md` — E2E debugging
- `.devin/rules/ponytail.md` — Lazy senior dev mode
- `.devin/rules/pre-flight-checklist.md` — Pre-flight task checklist
