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
| File upload | ✅ Done | `/api/upload` (Upstash Blob private bucket, max 10MB, PDF/PNG/JPG/WEBP; baca via signed URL `/api/admin/files`) + input di CheckoutForm |
| Admin notification | ✅ Done | `src/lib/notification.ts` — `notifyAdminNewOrder`/`notifyAdminPaidOrder` (WA URL) |
| Order lookup | ✅ Done | Halaman `checkout/success` baca `getOrder` langsung (server-side; endpoint `/api/orders/[orderId]` dihapus — CF-A-18) |

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
| Rebuild `reports/` + `milestones/` | ✅ Done | status.md, master-reference.md, readme, milestones — semua ter-sync 12 Sep |
| Playwright setup | 🔄 In Progress | Config terpasang, spec belum ditulis — eksekusi E2E di sesi tersendiri |

---

## Milestone 6 — Ops Hardening (Sep 2026) ✅ DONE

| Task | Status | Deskripsi |
|------|--------|-----------|
| Order retention fix | ✅ Done | TTL 30d hanya untuk `pending`; terminal (paid/cancelled/expired) permanen — rekam bisnis tidak hilang |
| Production storage guard | ✅ Done | `saveOrder` fail-fast saat `NODE_ENV=production` tanpa Upstash; banner warning di `/admin/orders` saat in-memory |
| Rate limit create-token | ✅ Done | `Ratelimit.slidingWindow(10, "10 m")` per IP — blokir order-spam |
| Export CSV admin | ✅ Done | `GET /api/admin/orders/export` + tombol di `/admin/orders` — rekap Excel-friendly |
| Cleanup | ✅ Done | `@vercel/kv` dihapus (dead dep); env mati dikomentari; `ADMIN_*` lokal diisi; docs sync |

## Milestone 7 — Client Feedback Batch (Sep 2026) ✅ DONE

Feedback dari owner via WA → dieksekusi:

| Task | Status | Deskripsi |
|------|--------|-----------|
| Etalase dipangkas | ✅ Done | 12 produk → 7 (brosur&flyer, poster, print dokumen merge, cetak stiker, kartu nama, undangan, packaging) + card "Produk Lainnya" → WA admin. Kategori DTF/banner keluar etalase |
| Upload preview tiling | ✅ Done | `DesignCanvas` — design upload ke-render di SEMUA cell imposition (bukan ghost pink), cell-0 tetap resizable |
| Fix imposition math | ✅ Done | `paper-sizes.ts` — gap hanya di ANTAR cell (N cell = N-1 gap); boundary size seperti 305mm kini benar (dulu 0 pcs) |
| Kalkulator per-lembar tier | ✅ Done | `STICKER_SHEET_TIERS` di `pricing.ts` — model kompetitor (harga/lembar turun per tier qty). PLACEHOLDER, ganti saat owner kirim price list |
| AI designer MVP | ✅ Done | Panel "Coba AI" di upload mode — Pollinations.ai gratis tanpa API key; draft → langsung masuk canvas |
| Kode order WA | ✅ Done | `BSP-XXXX` unik di pesan checkout WA — matching mutasi transfer manual (zero-cost) |
| Guide text kalkulator | ✅ Done | Intro singkat di atas preset: "berapa pcs dalam 1 lembar A3" |
| Pembayaran | ✅ Done | Konfirmasi: checkout WA-only selama env Midtrans kosong — sesuai request "sementara gausah bayar di web" |
| PDF siap cetak | ✅ Done | Export upload-mode embed gambar asli per cell + cutline + siku marks — output naik-cetak langsung (commit `8164e94`) |
| AI prompt per produk | ✅ Done | Template prompt khusus stiker (flat vector, clean edge, white bg) |

**Visi owner (self-service pipeline)** — scope v1 disepakati: **stiker dulu**, notifikasi via **link download**, AI = **draft + cek admin**. Sudah jalan: pilih stiker → AI/upload → auto-layout → PDF siap cetak → order WA + kode BSP-XXXX. Sisa untuk auto-penuh: (a) pembayaran perlu Midtrans/mutasi-checker untuk tahu "lunas", (b) auto-kirim file ke WA butuh gateway (Fonnte/Cloud API/Telegram) — sementara link `/api/admin/files` di dashboard.

**Payment roadmap (disepakati)**: sekarang WA + kode order (zero cost) → nanti kalau mau auto-acc tanpa gateway: jasa cek-mutasi (Moota/Mutasiku ~Rp100-300rb/bln) → atau aktifkan Midtrans (QRIS/VA) kapanpun via env.

## Backlog — v2 Candidates

| Task | Status | Deskripsi |
|------|--------|-----------|
| UX-0.5 Functional Completeness | ✅ Done | Sweep persona Customer+Admin × 7 kategori → 15 gap; 4 fix dieksekusi (`POST /api/orders` order WA tercatat, FAQ garansi/revisi, trust line, status "batal"). Detail: `reports/cross-audits/functional-completeness-sweep.md` |
| Order tracking page customer | ⬜ Backlog | FC-06 — halaman cek status via orderId (sementara: success URL bookmark-able) |
| Info rekening di success page | ⬜ Backlog | FC-07 — butuh nomor rekening owner |
| Estimasi ongkir "kirim" | ⬜ Backlog | FC-05 — butuh tarif kurir owner |
| Pricing matrix | ⬜ Backlog | Harga per material/ukuran/finishing (sekarang `priceFrom * quantity` + admin konfirmasi via WA) |
| WA Business API | ⬜ Backlog | Notifikasi otomatis ke customer (sekarang WA URL ke admin via `logNotification`) |
| E2E suite per flow | ⬜ Backlog | Spec Playwright untuk 5 flow |
| Backup order → Google Sheets | ⬜ Backlog | `ADMIN_NOTIFY_WEBHOOK_URL` → n8n/Make → Sheets (env sudah ada, butuh setup external) |
| Migrasi DB relasional (Supabase) | ⬜ Backlog | Re-evaluasi saat butuh order history permanen multi-tahun / customer account / CMS produk |

---

## Catatan

- Current branch: cek `git branch --show-current` sebelum task.
- Setiap task baru: tambah/update baris di tabel milestone yang sesuai.
- Setelah selesai task: update status kolom.
- AI wajib baca file ini setiap session untuk konteks milestone.
