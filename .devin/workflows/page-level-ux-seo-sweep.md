# Workflow — Page-Level UI/UX/SEO Sweep (per Halaman)

Audit **satu halaman spesifik** secara visual/SEO/interaksi, tanpa audit seluruh flow. Patokan halaman ada di `reports/cross-audits/page-flow-matrix.md`.

## Langkah

1. Buka `reports/cross-audits/page-flow-matrix.md`, cari baris route `[ROUTE]`.
   Catat: Primary Flow, Role, Type, UX Priority, dan Page Audit Scope-nya.

2. Jalankan 3-layer check:
   - **LAYER 1 (grep-based):** scan anti-pattern di `.devin/rules/qa-qc-workflow-and-status-tracking.md` dan `reports/cross-audits/cross-flow-ux-sweep.md` (21 scan). Fokus ke file yang dirender di halaman ini.
   - **LAYER 2 (visual walkthrough):** buka halaman di Playwright pada 3 viewport (mobile 375px, tablet 768px, desktop 1440px). Screenshot SEBELUM perubahan apapun. Cek proporsi, spacing, typography, color, border-radius, konsistensi card/button, empty/loading/error state.
   - **LAYER 3 (interaction & responsive spot-check):** hover, focus, dropdown direction, touch target, text overflow, keyboard navigation, mobile sidebar/drawer, navbar behavior.

3. Terapkan 24 kategori kejanggalan dari `.devin/rules/quality-radar.md`:
   - K1-K12: UI layer (size, centering, spacing, color, radius, typography, loading, button, empty, status, interaction, a11y).
   - K13-K21: code/arch layer (error handling, validation, data, race, naming, dead code, feature folder, data fetching, import direction).

4. SEO & Mobile (wajib):
   - Metadata title/description, OG tags, canonical, JSON-LD (public page).
   - Heading hierarchy (`h1` tunggal), internal links, sitemap/robots.
   - Responsive reflow, touch target >=44x44px, mobile navigation pattern.

5. Untuk SETIAP temuan:
   - Screenshot "before" ke `reports/screenshots/page-audit/[flow]/` atau `reports/screenshots/[NAMA_FLOW]/before-[deskripsi]-[viewport]-[tanggal].png`.
   - Tulis temuan di section "Page-Level UX Findings" di `reports/audit/[NAMA_FLOW].md` dengan format: ID, Kategori (K1-K24 atau SEO/Mobile), Bukti (file + screenshot), Risiko, Opsi Solusi (≥2 kalau butuh keputusan produk).
   - Status OPEN.

6. JANGAN fix apapun dulu — murni audit, kecuali user sudah eksplisit mendelegasikan eksekusi.
