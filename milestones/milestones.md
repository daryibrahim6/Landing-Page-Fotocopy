# Milestone Tracking — BisaPrint

> File ini untuk track progress milestone. Update setiap kali ada perubahan signifikan.
> AI auto-retrieve konteks ini setiap session sebagai backup permanen + detail.

---

## Milestone 1 — Landing Page MVP ✅ DONE

| Task | Status | Deskripsi |
|------|--------|-----------|
| Landing page sections | ✅ Done | Hero, KategoriProduk, ProductCatalog, CaraOrder, PanduanFile, PortfolioGallery, Testimonials, FaqSection, ContactSection, FormKonsultasi, WhyBisaPrint |
| Header & Footer | ✅ Done | Logo `logo-bisaprint.webp`, navbar, mobile menu, footer links |
| Product data | ✅ Done | `src/data/products.ts` — brosur, flyer, poster, banner, print dokumen, stiker, kartu nama, undangan, DTF, packaging, custom |
| WhatsApp CTA | ✅ Done | `WhatsAppButton` + `wa.ts` URL builder, konsultasi & order via WA |
| Static data | ✅ Done | `src/data/` — faq, portfolio, testimonials |

---

## Milestone 2 — Checkout & Payment ✅ DONE

| Task | Status | Deskripsi |
|------|--------|-----------|
| Checkout page & form | ✅ Done | `src/app/checkout/page.tsx` + `CheckoutForm.tsx` — data customer, validasi inline `text-red-500` |
| Midtrans Snap integration | ✅ Done | `snap.js` via `next/script` di `layout.tsx`, `/api/midtrans/create-token` |
| Midtrans webhook | ✅ Done | `/api/midtrans/webhook` — signature verify (SHA512), status mapping, idempotent |
| Order storage | ✅ Done | `src/lib/order-storage.ts` — Upstash Redis + in-memory fallback |
| File upload | ✅ Done | `/api/upload` (Vercel Blob, max 10MB, PDF/PNG/JPG/WEBP) + input di CheckoutForm |
| Admin notification | ✅ Done | `src/lib/notification.ts` — `notifyAdminNewOrder`/`notifyAdminPaidOrder` (WA URL) |
| Order lookup | ✅ Done | `/api/orders/[orderId]` + halaman `checkout/success` |

---

## Milestone 3 — Design Simulator ✅ DONE

| Task | Status | Deskripsi |
|------|--------|-----------|
| Design Simulator | ✅ Done | `src/app/simulator` + `src/components/design-simulator/` — kalkulator layout A3/stiker |
| Imposition math | ✅ Done | `src/lib/paper-sizes.ts` — pure functions, di-cover `paper-sizes.test.ts` |
| jsPDF export | ✅ Done | Export hasil simulator (fix `setGState` TypeScript) |

---

## Milestone 4 — UI/UX Wave (Sep 2026) ✅ DONE

| Task | Status | Deskripsi |
|------|--------|-----------|
| UI/UX overhaul | ✅ Done | Logo, navbar, hero, accent cleanup (`eabec24`) |
| Product images | ✅ Done | 12 SVG per-produk, checkout enabled untuk semua produk (`20ccb1c`) |
| Layout & env | ✅ Done | Layout widened, env sync, `metadataBase` fix |
| Unit tests | ✅ Done | Vitest suite: `notification.test.ts`, `wa.test.ts`, `paper-sizes.test.ts` |
| Real logo | ✅ Done | `logo-bisaprint.webp` di Header & Footer (`de05c23`) |

---

## Milestone 5 — Workflow Infra Migration (Sep 2026) 🔄 IN PROGRESS

| Task | Status | Deskripsi |
|------|--------|-----------|
| Restore docs BisaPrint | ✅ Done | PROJECT.md, README.md, rules `src/`-based kembali dari HEAD + sync env/structure (`8492f1e`) |
| Archive konten project lain | ✅ Done | `_archive/` — e2e, blueprint, documents, reports stale, memories, docs asing, coverage (`e7717ca`) |
| Adapt rules `.devin/` | ✅ Done | quality-radar, qa-qc, e2e-*, build-cicd, flow-*, AGENTS, workflows — de-referensi project lama |
| Rebuild `reports/` + `milestones/` | 🔄 In Progress | status.md, master-reference.md, readme, milestones (file ini) |
| Playwright setup | 🔄 In Progress | Config terpasang, spec belum ditulis — eksekusi E2E di sesi tersendiri |

---

## Backlog — v2 Candidates

| Task | Status | Deskripsi |
|------|--------|-----------|
| Production dashboard | ⬜ Backlog | Admin lihat/manage order — `production-dashboard-flow` |
| Pricing matrix | ⬜ Backlog | Harga per material/ukuran/finishing (sekarang `priceFrom * quantity` + admin konfirmasi via WA) |
| WA Business API | ⬜ Backlog | Notifikasi otomatis ke customer (sekarang WA URL ke admin via `logNotification`) |
| E2E suite per flow | ⬜ Backlog | Spec Playwright untuk 4 flow core |

---

## Catatan

- Current branch: cek `git branch --show-current` sebelum task.
- Setiap task baru: tambah/update baris di tabel milestone yang sesuai.
- Setelah selesai task: update status kolom.
- AI wajib baca file ini setiap session untuk konteks milestone.
