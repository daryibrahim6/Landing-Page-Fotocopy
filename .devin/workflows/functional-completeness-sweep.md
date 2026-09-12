# Workflow — Functional Completeness Sweep (UX-0.5)

Jalankan SEKALI untuk seluruh project, SEBELUM UX-1 per-flow. Tujuan: identifikasi fitur/kemampuan yang SEHARUSNYA ADA tapi TIDAK ADA di sistem — gap yang tidak bisa ditangkap grep (tidak ada file untuk di-grep) atau walkthrough per-flow (gap cross-cutting, bukan milik satu flow).

## Prasyarat

- WAJIB baca section "Functional Completeness Audit" di `.devin/rules/qa-qc-workflow-and-status-tracking.md`.
- WAJIB baca skill `ui-ux-pro-max` untuk grounding standar UX.
- Baca `reports/status.md` + `milestones/milestones.md` (pre-flight).

## Langkah

1. IDENTIFIKASI SEMUA ROLE di platform (untuk BisaPrint: **Customer/Pengunjung** guest tanpa akun via WA, dan **Admin/Owner** Basic Auth).

2. UNTUK SETIAP ROLE, buat Persona-Needs Matrix dengan kategori gap dari rules (saat ini 7):
   - Storefront & Catalog Completeness
   - Checkout & Payment Completeness
   - Communication & Support
   - Trust & Conversion
   - Design Simulator Completeness
   - Admin/Operations
   - Order Persistence & Lifecycle

   Grounding ke referensi: kompetitor (Xpress, OnlinePrint, Uprint, PrimaGraphia, e-commerce umum), design system (Material Design, Polaris, Apple HIG), usability research (NN/g, Baymard), platform convention.

3. CROSS-REFERENCE DENGAN CODE — untuk setiap need, grep/read file untuk konfirmasi benar-benar tidak ada (bukan cuma "tidak kelihatan"). Laporkan kondisi aktual: "tidak ada sama sekali" vs "ada tapi tidak di-render di page X" vs "ada tapi incomplete".

4. KLASIFIKASI GAP: Critical / High / Medium / Low.

5. UNTUK SETIAP GAP, tulis: Need · Role · Kenapa penting · Referensi · Status (❌ Missing / ⚠️ Incomplete / ✅ Ada) · Opsi solusi (WAJIB ≥2 kalau butuh keputusan produk) · Data model impact.

6. JAWAB 7 pertanyaan Senior UX Designer Mindset dari rules untuk setiap role.

7. Gap yang menyentuh data model → WAJIB approval user. Gap murni UI/copy → boleh dieksekusi kalau user sudah mendelegasikan.

## Output

- Simpan ke `reports/cross-audits/functional-completeness-sweep.md` — header (tanggal, scope, role), Persona-Needs Matrix per role, gap list per kategori + prioritas, summary (total per kategori/role/prioritas).
- Update `reports/status.md` — baris "Functional Completeness Sweep (UX-0.5)".
- JANGAN fix apapun di tahap sweep — murni scan dan lapor, kecuali user sudah eksplisit mendelegasikan eksekusi.

Report terakhir: `reports/cross-audits/functional-completeness-sweep.md` (12 Sep 2026) — 15 gap (1 Critical fixed, 3 fix murah, sisanya backlog/keputusan owner).
