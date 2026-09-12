# Page-Flow Matrix — BisaPrint

> Patokan untuk **Tahap UX-0.75 — Page-Level UI/UX/SEO Sweep** (`reports/workflow/execution-guide-track-c.md`).
> Satu baris per route/halaman yang dirender user. Update file ini setiap ada route baru.

| Route | Primary Flow | Persona | Type | UX Priority | Page Audit Scope |
|---|---|---|---|---|---|
| `/` | landing-page-flow | Customer (new + returning) | Public marketing | P0 — first impression & conversion | Semua section (hero, kategori, katalog, USP, cara order, portfolio, testimoni, panduan file, FAQ, kontak), Header/Footer, floating buttons, sticky nav, mobile menu |
| `/checkout` | checkout-flow | Customer siap order | Transactional | P0 — money path | CheckoutForm (field, validasi, error state), upload area, ringkasan order, trust signals, Snap trigger, loading "Mengupload..."/snap open |
| `/checkout/success` | checkout-flow | Customer pasca-bayar | Transactional | P1 — post-payment trust | Order number display, next-step guidance ("admin hubungi via WA"), CTA lanjut, state saat order tidak ketemu |
| `/simulator` | design-simulator-flow | Customer teknis (UMKM/designer) | Tool | P1 — differentiator | Canvas A3, kontrol ukuran/gap/rotasi, upload artwork, hasil imposition, export PNG/PDF, mobile usability |
| `not-found` (404) | landing-page-flow (global shell) | Semua | System | P2 | Pesan jelas + CTA kembali, konsistensi header/footer |
| `error` / `loading` | landing-page-flow (global shell) | Semua | System | P2 | Spinner "Memuat..." konsisten, error actionable + recovery |

## Catatan

- Route API (`/api/*`) tidak masuk matrix ini — diverifikasi via test & audit flow, bukan walkthrough visual.
- `production-dashboard-flow` belum punya route — tambahkan baris saat dibangun.
- Floating components (WhatsAppButton, floating simulator entry) teraudit di flow pemiliknya; konsistensi cross-surface dicek di UX-1 checklist "Cross-surface component consistency".
