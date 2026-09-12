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

> Catatan: `--color-bg-soft`/`--color-bg-card` di `globals.css` saat ini `#F8FAFC`/`#FFFFFF` (slate netral) — pink tint dipakai selektif sebagai aksen, bukan background dasar. Token di atas adalah palet moodboard awal; cek `globals.css` untuk nilai aktual.

## Flow Taxonomy

Flow BisaPrint (5). Detail status: `reports/status.md`. Audit per-flow: `reports/audit/<flow>.md` (5 file = kontrak coverage). Audit gabungan historis: `reports/archive/full-project-audit-2026-09-08.md`.

| # | Flow | Tier | Fokus |
|---|------|------|-------|
| 1 | `landing-page-flow` | Core | Homepage: hero, kategori, katalog, USP, cara order, konsultasi WA, portfolio, testimoni, panduan file, FAQ, kontak, footer, floating buttons |
| 2 | `checkout-flow` | Core | `/checkout` → Midtrans Snap → `/checkout/success`; API `create-token`, `webhook`, `orders/[orderId]`; upload file |
| 3 | `whatsapp-notification-flow` | Core | WA deep-link builder, notifikasi admin pasca-order/webhook |
| 4 | `design-simulator-flow` | Core | Simulator layout A3 (`/simulator` + floating panel), imposition math `paper-sizes.ts`, export PNG/PDF |
| 5 | `production-dashboard-flow` | Supporting | Admin dashboard produksi — BACKLOG v2, belum dibangun |

## Rules Reference

- `AGENTS.md` — AI-agent project rules (always-on)
- `.devin/rules/quality-radar.md` — Defect detection K1-K27 + pre-ship audit (always-on)
- `.devin/rules/ponytail.md` — Lazy senior dev mode, skills-first, kritik instruksi
- `.devin/rules/pre-flight-checklist.md` — Pre-flight task checklist
- `.devin/rules/feature-architecture.md` — Folder `src/` monolithic & data-fetching rules
- `.devin/rules/lib-architecture.md` — `src/lib` rules
- `.devin/rules/qa-qc-workflow-and-status-tracking.md` — QA/QC workflow: Track A/B/C, assertion strength, blind spots, screenshot naming
- `.devin/rules/flow-registry-and-status.md` — Flow registry, status vocabulary, auto-sync reports
- `.devin/rules/flow-coverage-tracking.md` — Coverage gate, micro-UX sweep, distributed-flow proof
- `.devin/rules/ui-ux-deep-audit.md` — Track C pattern coverage matrix
- `.devin/rules/design-taste.md` — Frontend design guidelines
- `.devin/rules/nextjs-build-cicd-optimization.md` — Build & deploy rules
- `.devin/rules/e2e-investigation-no-loop.md` — E2E debugging, no blind re-run
- `.devin/rules/e2e-drift-prevention.md` — Pre-flight drift scan sebelum Playwright run
- `.devin/rules/git-auto-commit-strategy.md` — Kapan & bagaimana auto-commit
- `.devin/workflows/e2e-fast-track.md` — Perintah cepat Playwright
- `.devin/workflows/pre-push-verification.md` — Checklist wajib sebelum commit/push

## Reports & Workflow

| File | Isi |
|---|---|
| `reports/status.md` | Single source of truth status per flow |
| `reports/flow-coverage-matrix.md` | Matrix flow → status, next action, prioritas |
| `reports/audit/` | Audit per flow — kontrak coverage (5 file = 5 flow) |
| `reports/test-scenarios/` | Skenario test per flow (dibuat saat flow masuk sesi testing) |
| `reports/test-results/` | Hasil eksekusi test per flow |
| `reports/cross-audits/` | Audit lintas-flow (dibuat saat sweep) |
| `reports/screenshots/` | Evidence UI/UX manual — **gitignored** |
| `reports/workflow/` | Execution guides: Track A, E2E playbook, Track B/C, appendix |
| `_archive/` | Konten referensi dari project lain — **gitignored**, bukan patokan aktif |

## Posisi Terakhir & Tahap Berikutnya

- Playwright ter-setup tapi **belum ada spec** — sesi E2E tersendiri nanti.
- Open items ada di `reports/status.md` → "Open Items".

