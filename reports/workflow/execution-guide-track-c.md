# 🎨 TRACK C: UI/UX WALKTHROUGH

> **Track ini opsional / dipicu dari Track A.** Jangan dijalankan untuk setiap flow. Buka panduan ini kalau Track Gate memutuskan "butuh Track C" atau audit Track A menemukan UI/UX gap yang perlu deep dive.

> **Patokan per halaman:** untuk audit UI/UX/SEO satu halaman spesifik, baca `reports/cross-audits/page-flow-matrix.md` dan pakai prompt **Tahap UX-0.75 — Page-Level UI/UX/SEO Sweep** di bawah. Track C utama tetap per flow, tapi page-level sweep memungkinkan lo fokus ke satu halaman tanpa harus audit seluruh flow.

Alur ini untuk memverifikasi APAKAH TAMPILAN & PENGALAMAN PAKAI itu baik (visual, alur tugas, kelengkapan struktural, information architecture). Ini BUKAN test logic — verifikasinya pakai screenshot, BUKAN Vitest/E2E assertion. 5 tahap: UX-0 (Cross-Flow Sweep) → UX-0.5 (Functional Completeness) → UX-1 (Audit) → UX-2 (Fix) → UX-3 (Verify). UX-0 dan UX-0.5 dijalankan sekali untuk seluruh project, lalu UX-1/2/3 per-flow seperti biasa.

**Mindset wajib Track C (Senior UX Designer, 100 tahun pengalaman):** Bukan cuma "cari yang rusak lalu perbaiki" — tapi "cari yang bisa LEBIH BAGIK, lalu kasih solusi terbaik dari terbaik". Seorang UX designer senior tidak cuma ngecek "apakah ini jalan?" Dia mikir: "kalau saya mendesain platform ini dari awal dengan 100 tahun pengalaman di marketplace, apa versi terbaiknya? Apa yang user expect tapi tidak dapat? Apa yang membuat user ragu tanpa mereka sadari?" Untuk SETIAP temuan, WAJIB riset referensi — bukan cuma opini. Tujuannya: solusi optimal, bukan solusi pertama yang terpikir.

**Prinsip tambahan untuk Senior UX Designer:**
- **Jangan cuma fix yang rusak — anticipasi yang akan rusak.** Kalau ada pattern yang saat ini "jalan" tapi akan break di scale (10x user, 100x data, mobile slow), catat sebagai temuan. Senior UX designer tidak nunggu sampai rusak baru fix.
- **Setiap rekomendasi WAJIB punya referensi.** Bukan "saya rasa lebih bagus begini" — tapi "NN/g bilang X, Baymard bilang Y, jadi rekomendasi saya Z". Opini tanpa referensi = bukan standar senior.
- **Jangan batasi ke yang user sebut.** Kalau user sebut 3 masalah, cari 10 masalah lain yang user TIDAK sebut. Senior UX designer tidak nunggu user complaint baru act — dia proaktif cari friction yang user tidak sadari.
- **Micro-interactions matter.** Button hover, focus state, loading skeleton, empty state, error state — setiap state punya UX impact. Senior tidak skip ini karena "kecil".
- **Accessibility bukan nice-to-have.** WCAG compliance adalah baseline, bukan opsi. Senior UX designer tidak bilang "accessibility nanti aja" — dia masuk dari awal.

**Standar riset WAJIB sebelum mulai (bukan opsional):** Sebelum mulai audit apapun, WAJIB baca skill `ui-ux-pro-max` (99 UX guidelines, 161 color palettes, 57 font pairings, 25 chart types) sebagai baseline standar. Tidak boleh pakai standar sendiri tanpa grounding ke referensi established. Selain skill, WAJIB juga merujuk ke: NN/g usability heuristics, WCAG 2.1 AA, Material Design 3 / Apple HIG untuk interaction patterns. Ini bukan "baca sekilas" — ini adalah baseline yang setiap temuan WAJIB diukur against.

**Three-layer audit (WAJIB untuk semua flow):**
- **Layer 1: Anti-Pattern Scan** (grep-based, objektif) — jalankan SEBELUM walkthrough manual. Lihat "Anti-Pattern Scan" section di `.devin/rules/qa-qc-workflow-and-status-tracking.md`. Hasil scan jadi input untuk Layer 2.
- **Layer 2: Manual Visual Walkthrough** (Playwright MCP, subjektif tapi essential) — walkthrough seperti user, cek visual/spacing/proportion/consistency yang tidak bisa di-grep. Ini adalah Tahap UX-1 di bawah.
- **Layer 3: Interaction & Responsive Spot-Check** (Playwright MCP, WAJIB) — cek hover behavior, dropdown direction, focus state, touch target, text overflow di 3 viewport. Ini tidak bisa di-grep dan tidak bisa di-skip dengan alasan "tidak terlihat di screenshot default".

Tiganya WAJIB, bukan pilih satu. Layer 1 tangkap text-based anti-pattern, Layer 2 tangkap visual anti-pattern, Layer 3 tangkap interaction/responsive anti-pattern.

**SOLVE, DON'T SKIP (aturan tertinggi, di atas semua checklist):** Kalau ada halaman/komponen yang tidak bisa diakses — JANGAN skip. SIAPKAN state yang dibutuhkan (order via API/helper, Midtrans sandbox), NAVIGATE via UI ke page tersebut. Kalau setelah usaha maksimal masih tidak bisa, LAPOR kenapa — bukan diam-diam skip. Halaman yang di-skip = temuan yang tidak teraudit = lubang hitam. Lihat "Resolusi Kendala Teknis" di `.devin/rules/qa-qc-workflow-and-status-tracking.md` untuk prosedur detail.

---

## Tahap UX-0 — Cross-Flow UX Sweep (Jalankan SEKALI sebelum per-flow audit)

Tahap ini dijalankan sekali untuk seluruh project, sebelum mulai UX Walkthrough per-flow. Tujuannya: tangkap anti-pattern yang tersebar di multiple flow (em dash, breadcrumb dead links, capitalization inconsistency, dll) yang tidak akan tertangkap kalau cuma audit per-flow.

```
Sebelum mulai, WAJIB baca skill `ui-ux-pro-max` sebagai baseline
standar UX. Tidak boleh mulai audit tanpa grounding ke standar ini.

=== SCREENSHOT CLEANUP (WAJIB, jalankan SEBELUM audit dimulai) ===
Baca Konvensi Penamaan Screenshot di
.devin/rules/qa-qc-workflow-and-status-tracking.md.
List SEMUA file di reports/screenshots/ (rekursif semua subfolder).
Untuk SETIAP file yang TIDAK mengikuti format kanonik
({phase}-{deskripsi}-{viewport}-{tanggal}.png), rename ke format
kanonik. Aturan rename:
- File dengan prefix nomor (01-, 02-, dst) atau prefix uxw- →
  tentukan phase berdasarkan konteks (before/after/state), hapus
  prefix lama, tambah tanggal kalau tidak ada (pakai tanggal
  modifikasi file atau tanggal audit hari ini).
- File tanpa viewport → tambahkan viewport berdasarkan konteks
  (kalau tidak tahu, pakai "desktop").
- File dengan nama flow di filename (contoh: "landing-hero")
  → hapus nama flow, simpan deskripsi saja ("hero").
- File duplikat (deskripsi + viewport + tanggal sama) → hapus
  yang duplikat, simpan 1 versi.
Setelah rename, update referensi filename di audit report yang
bersangkutan (reports/audit/[nama-flow].md) kalau ada referensi
ke filename lama.
Laporkan: jumlah file sebelum cleanup, jumlah file direname,
jumlah file dihapus, jumlah file setelah cleanup.

Jalankan Cross-Flow UX Sweep (Tahap UX-0) untuk seluruh project,
sesuai "Anti-Pattern Scan" section di
.devin/rules/qa-qc-workflow-and-status-tracking.md.

=== LAYER 1: GREP-BASED ANTI-PATTERN SCAN ===
Jalankan SEMUA 21 scan yang sudah didefinisikan di section itu:
1. AI Slop Punctuation (em dash)
2. Breadcrumb Dead Links
3. Capitalization Inconsistency
4. Inconsistent Border-Radius
5. Missing aria-label pada Icon-Only Buttons
6. Native confirm()/alert()/prompt()
7. Emoji & Unicode Symbol in UI (Lucide icons WAJIB)
8. Flex Layout Without Gap (spacing bug root cause)
9. Table Cell Without Horizontal Padding
10. Component Variant Inconsistency (star rating, badge, dll)
11. Query Param Read But Not Consumed (broken flow detection)
12. Missing Loading State (skeleton/spinner) — NN/g H1
13. Missing aria-live pada Dynamic Feedback — WCAG 2.2 4.1.3
14. Missing prefers-reduced-motion — WCAG 2.3.3
15. Missing autoComplete pada Auth Forms — WCAG 2.2 3.3.8
16. Missing maxLength pada Text Input — SaaS UX #53
17. Placeholder-Only Labels — SaaS UX #51, WCAG 1.3.1
18. Drag Without Pointer Alternative — WCAG 2.2 2.5.7
19. Modal useEffect Deps Trap — React hooks pitfall, focus loss saat ketik di form dalam modal
20. Toggle Knob Without Left Anchor — CSS positioning, knob keluar dari track
21. Flex Fixed-Size Child Without shrink-0 — CSS flexbox, circle/icon ke-squish di viewport sempit

Untuk SETIAP scan, list semua hit dengan format:
- File + line number
- Kategori temuan (A = bug objektif, B = advisory)
- Flow mana yang terkena (map file ke flow berdasarkan folder structure)
- Rekomendasi fix (untuk Kategori A: langsung fix, untuk Kategori B:
  riset referensi dulu)

=== LAYER 2: VISUAL SNAPSHOT (3 VIEWPORT) ===
Jalankan Playwright visual snapshot di 3 viewport (mobile 375px,
tablet 768px, desktop 1440px) untuk HALAMAN UTAMA setiap flow
yang punya UI kompleks:
- Landing page — semua section (landing-page-flow)
- Checkout (checkout-flow)
- Halaman sukses/error order (checkout-flow)
- Design simulator (design-simulator-flow)
- Mobile menu / header states (semua flow)

Untuk visual comparison antar halaman, gunakan checklist berikut
(tidak boleh dilewati — cek SETIAP item untuk SETIAP pasangan halaman):
- [ ] Button styling: primary/secondary/ghost variant konsisten? Same padding, border-radius, font-size?
- [ ] Card styling: border-radius, shadow, padding, border color konsisten antar card sejenis?
- [ ] Spacing pattern: gap antar section, gap antar elemen dalam card, margin pattern konsisten?
- [ ] Typography hierarchy: heading size ratio, body text size, label size konsisten antar halaman?
- [ ] Icon size: icon di button, icon di card header, icon di nav konsisten?
- [ ] Color usage: primary color untuk action utama, secondary untuk action sekunder, color untuk status (success/warning/error) konsisten?
- [ ] Form input styling: border, border-radius, focus ring, error state konsisten antar halaman?
- [ ] Empty state pattern: illustration + message + CTA format konsisten?
- [ ] Loading state: skeleton vs spinner usage konsisten?
- [ ] Mobile layout: sidebar → drawer/bottom nav pattern, touch target size, content reflow konsisten?

Flag inkonsistensi visual yang tidak bisa di-grep. Setiap flag WAJIB
dibarengi screenshot evidence (nama file screenshot + halaman + viewport).

=== LAYER 3: INTERACTION & RESPONSIVE SPOT-CHECK (WAJIB, tidak boleh skip) ===
Untuk SETIAP halaman utama di atas, jalankan interaction check berikut
via Playwright MCP di 3 viewport (mobile 375px, tablet 768px, desktop 1440px):

Hover behavior:
- Hover SETIAP interactive element (nav link, button, card, dropdown trigger)
- Screenshot hover state
- Cek: apakah hover konten masih show setelah kursor keluar area? (bug)
- Cek: apakah hover state punya styling yang jelas? (bukan cuma cursor pointer)

Dropdown/popover direction:
- Buka SETIAP dropdown/popover di small viewport (375px)
- Screenshot dalam keadaan terbuka
- Cek: apakah dropdown terpotong/ke luar layar? (bug Kategori A)
- Cek: apakah dropdown auto-flip ke sisi yang punya ruang? (best practice)

Focus state:
- Tab ke SETIAP interactive element
- Screenshot focus state
- Cek: apakah focus indicator visible dengan 3:1 contrast? (WCAG 2.4.7)
- Cek: apakah focus indicator brand-styled atau cuma browser default?

Touch target (mobile only, 375px):
- Ukur SETIAP interactive element via bounding box
- Cek: minimum 44x44px? (WCAG 2.5.5)
- Cek: minimum spacing 8px antar interactive element? (touch accident prevention)

Text overflow (3 viewport):
- Cek SETIAP text container: apakah text overflow/terpotong di viewport sempit?
- Khususnya: hero section slogan, card title, button label, table cell
- Screenshot kalau ada overflow

Navbar/sidebar interaction:
- Hover kategori navbar: apakah konten muncul? Apakah hilang saat kursor keluar?
- Buka mobile sidebar/drawer: apakah terpotong? Apakah scroll lock bekerja?
- Buka notif bell dropdown: arah ke mana? Apakah terpotong di small screen?

Setiap temuan Layer 3 WAJIB screenshot evidence + viewport + halaman.

=== STATE SETUP (SOLVE, DON'T SKIP) ===
Untuk halaman yang butuh specific state (halaman sukses order butuh
order `paid`, webhook butuh order `pending` valid, upload butuh file
fixture):
JANGAN skip. Ikuti "State Setup" di
.devin/rules/qa-qc-workflow-and-status-tracking.md — buat order via
API/helper atau script __set-[state].ts, akses page, screenshot,
bersihkan state, hapus temp script. Kalau setelah usaha maksimal tetap
tidak bisa, LAPOR kenapa — bukan diam-diam skip.

=== OUTPUT ===
Simpan hasil ke reports/cross-audits/cross-flow-ux-sweep.md dengan format:
- Section "Screenshot Cleanup" — jumlah file sebelum, direname,
  dihapus, setelah cleanup
- Section per layer (Layer 1: grep, Layer 2: visual, Layer 3: interaction)
- Setiap hit: file, line, kategori, flow, rekomendasi, screenshot ref
- Summary: total temuan per kategori, total flow terkena, per layer

JANGAN fix apapun di tahap ini — murni scan dan lapor.
Setelah lapor, saya yang putuskan batch fix mana yang dieksekusi dulu.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

**Setelah dapat laporan sweep, lo WAJIB:**
- Baca `reports/cross-audits/cross-flow-ux-sweep.md`
- Putuskan batch fix urutan (rekomendasi: Kategori A dulu, lalu Kategori B per-kategori)
- Approve batch fix sebelum lanjut ke Tahap UX-1 per-flow

## Tahap UX-0.5 — Functional Completeness Sweep

Jalankan SEKALI untuk seluruh project, SEBELUM UX-1 per-flow. Tujuan: identifikasi fitur/kemampuan yang SEHARUSNYA ADA tapi TIDAK ADA di sistem — gap yang tidak bisa ditangkap oleh grep (karena tidak ada file untuk di-grep) atau walkthrough per-flow (karena gap-nya cross-cutting, bukan milik satu flow).

```
Sebelum mulai, WAJIB baca section "Functional Completeness Audit" di
.devin/rules/qa-qc-workflow-and-status-tracking.md.

Sebelum mulai, WAJIB baca skill `ui-ux-pro-max` untuk grounding
standar UX. Tidak boleh mulai sweep tanpa grounding ke standar ini.

Lakukan Functional Completeness Sweep untuk seluruh project BisaPrint:

1. IDENTIFIKASI SEMUA PERSONA di platform (Customer/pengunjung,
   Admin/owner — future dashboard).

2. UNTUK SETIAP PERSONA, buat Persona-Needs Matrix dengan 6 kategori
   gap dari rules:
   - Storefront & Catalog Completeness
   - Checkout & Payment Completeness
   - Communication & Support
   - Trust & Conversion
   - Design Simulator Completeness
   - Admin/Operations (backlog)

   Grounding ke referensi:
   - Competitor analysis (printshop online lokal, Printerous/UpRint,
     Shopify storefront untuk referensi checkout)
   - Design system (Material Design, Apple HIG, Baymard)
   - Usability research (NN/g, Baymard)
   - Platform convention (apa yang user expect dari toko online sejenis)

3. CROSS-REFERENCE DENGAN CODE — untuk setiap need, grep/read file
   untuk konfirmasi benar-benar tidak ada (bukan cuma "tidak kelihatan").
   Laporkan kondisi aktual: "tidak ada sama sekali" vs "ada tapi tidak
   di-render di page X" vs "ada tapi incomplete".

4. KLASIFIKASI GAP: Critical / High / Medium / Low

5. UNTUK SETIAP GAP, tulis:
   - Need: apa yang missing
   - Persona: siapa yang terdampak
   - Kenapa penting: dampak kalau tidak ada
   - Referensi: sumber yang menyatakan ini expected
   - Status: ❌ Missing / ⚠️ Incomplete / ✅ Ada
   - Opsi solusi (WAJIB minimal 2 kalau butuh keputusan produk)
   - Data model impact: butuh schema change atau tidak

6. JAWAB 7 pertanyaan Senior UX Designer Mindset dari rules untuk
   setiap persona.

Simpan hasil ke reports/cross-audits/functional-completeness-sweep.md
dengan format:
- Header: tanggal, scope, persona yang diaudit
- Persona-Needs Matrix per persona (tabel)
- Gap list per kategori dengan klasifikasi prioritas
- Summary: total gap per kategori, total per persona, total per prioritas

Update reports/status.md — tambahkan baris "Functional Completeness
Sweep (UX-0.5)" dengan status sesuai.

JANGAN fix apapun di tahap ini — murni scan dan lapor.
Setelah lapor, saya yang putuskan gap mana yang dieksekusi dulu.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

## Tahap UX-0.75 — Page-Level UI/UX/SEO Sweep (per Halaman)

Gunakan prompt ini saat lo mau audit **satu halaman spesifik** secara visual/SEO/interaksi, tanpa harus audit seluruh flow. Patokan halaman ada di `reports/cross-audits/page-flow-matrix.md`.

```
Kerjain Page-Level UI/UX/SEO Sweep untuk halaman [ROUTE] (flow [NAMA_FLOW]):

1. Buka `reports/cross-audits/page-flow-matrix.md`, cari baris route [ROUTE].
   Catat: Primary Flow, Persona, Type, UX Priority, dan Page Audit Scope-nya.

2. Jalankan 3-layer check:
   - LAYER 1 (grep-based): jalankan scan anti-pattern yang definisikan di
     `.devin/rules/qa-qc-workflow-and-status-tracking.md` dan
     `reports/cross-audits/cross-flow-ux-sweep.md` (21 scan). Fokus ke file yang
     dirender di halaman ini.
   - LAYER 2 (visual walkthrough): buka halaman di Playwright MCP pada 3
     viewport (mobile 375px, tablet 768px, desktop 1440px). Ambil screenshot
     sebelum perubahan apa pun. Cek proporsi, spacing, typography, color,
     border-radius, card/button consistency, empty/loading/error state.
   - LAYER 3 (interaction & responsive spot-check): cek hover, focus,
     dropdown direction, touch target, text overflow, keyboard navigation,
     mobile sidebar/drawer, navbar behavior.

3. Terapkan 24 Kekuatan Kekuatan dari `.devin/rules/quality-radar.md`:
   - K1-K12: UI layer (size, centering, spacing, color, radius, typography,
     loading, button, empty, status, interaction, a11y).
   - K13-K21: code/arch layer (error handling, validation, data, race,
     naming, dead code, feature folder, data fetching, import direction).

4. SEO & Mobile (wajib):
   - Metadata title/description, OG tags, canonical, JSON-LD (public page).
   - Heading hierarchy (`h1` tunggal), internal links, sitemap/robots.
   - Responsive reflow, touch target >=44x44px, mobile navigation pattern.

5. Untuk SETIAP temuan:
   - Screenshot "before" ke `reports/screenshots/page-audit/[flow]/` atau
     `reports/screenshots/[NAMA_FLOW]/before-[deskripsi]-[viewport]-[tanggal].png`.
   - Tulis temuan di section "Page-Level UX Findings" di
     `reports/audit/[NAMA_FLOW].md` dengan format:
     ID, Kategori (K1-K24 atau SEO/Mobile), Bukti (file + screenshot),
     Risiko, Opsi Solusi (minimal 2 kalau butuh keputusan produk).
   - Status OPEN.

6. JANGAN fix apapun dulu — murni audit. Setelah lapor, saya putuskan mana yang difix.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [apa yang harus user lakukan sekarang]
```

## Tahap UX-1 — Audit (UX Walkthrough)

Devin benar-benar mencoba menyelesaikan tugas realistis dari flow tertentu, seperti user pertama kali pakai, lewat MCP Playwright — bukan cuma menganalisis code atau screenshot statis.

```
Sebelum mulai, WAJIB baca skill `ui-ux-pro-max` sebagai baseline
standar UX. Tidak boleh mulai audit tanpa grounding ke standar ini.

=== SCREENSHOT CLEANUP (WAJIB, jalankan SEBELUM walkthrough) ===
Baca Konvensi Penamaan Screenshot di
.devin/rules/qa-qc-workflow-and-status-tracking.md.
List SEMUA file di reports/screenshots/[NAMA_FLOW]/.
Untuk SETIAP file yang TIDAK mengikuti format kanonik
({phase}-{deskripsi}-{viewport}-{tanggal}.png), rename ke format
kanonik. Aturan rename sama seperti di UX-0.
Setelah rename, update referensi filename di
reports/audit/[NAMA_FLOW].md kalau ada referensi ke filename lama.
Laporkan: jumlah file sebelum cleanup, jumlah file direname,
jumlah file dihapus, jumlah file setelah cleanup.

Untuk flow [NAMA_FLOW], lakukan UX Walkthrough (Tahap UX-1: Audit)
sesuai .devin/rules/qa-qc-workflow-and-status-tracking.md.

**Sebelum mulai walkthrough manual**, cek hasil Cross-Flow UX Sweep
di reports/cross-audits/cross-flow-ux-sweep.md (kalau sudah dijalankan).
Cara merge hasil sweep ke audit per-flow:
1. Tandai setiap temuan UX-0 yang ada di flow ini sebagai "sudak
   ditemukan di UX-0" — tidak perlu re-discover, tapi WAJIB verifikasi
   saat walkthrough apakah temuan itu benar-benar muncul di flow ini.
2. Fokus walkthrough manual pada temuan BARU yang tidak ter-cover
   grep: visual spacing, proportion, user flow friction, edge case
   behavior, interaktif state (hover/focus/disabled).
3. Kalau ada temuan UX-0 yang ternyata tidak relevan untuk flow ini
   (false positive), catat sebagai "tidak berlaku" dengan alasan.

**Juga cek hasil Functional Completeness Sweep (UX-0.5)** di
reports/cross-audits/functional-completeness-sweep.md (kalau sudah dijalankan).
Cara merge hasil sweep ke audit per-flow:
1. Tandai setiap gap UX-0.5 yang ada di flow ini sebagai "sudah
   ditemukan di UX-0.5" — tidak perlu re-discover, tapi WAJIB verifikasi
   saat walkthrough apakah gap itu benar-benar muncul di flow ini.
2. Gap yang cross-cutting (kayak "tidak ada estimasi harga") masuk di
   flow yang paling relevan (kayak checkout-flow), bukan diduplikasi
   di semua flow.

Pilih tugas realistis yang representatif untuk flow ini (kalau tidak
saya sebutkan spesifik, tentukan sendiri tugas yang paling umum
dilakukan user di flow ini). Coba selesaikan tugas itu dari awal
sampai akhir lewat MCP Playwright TANPA membaca code implementasinya
dulu — benar-benar simulasikan first-time user, bukan orang yang
sudah tahu logic di baliknya.

Catat SETIAP titik dimana lo sendiri (sebagai simulasi user) harus
berhenti/bingung/menebak apa yang harus dilakukan, istilah yang tidak
jelas maknanya, atau opsi yang seharusnya ada tapi tidak ditemukan.

**WAJIB ambil screenshot "SEBELUM" di setiap titik temuan** (kondisi
bermasalah, sebelum diperbaiki apapun), di MINIMAL 3 ukuran viewport
(mobile sempit ~375px, tablet ~768px, desktop ~1440px — bukan cuma 2).
Simpan ke
reports/screenshots/[NAMA_FLOW]/before-[deskripsi]-[viewport]-[tanggal].png
(mengikuti Konvensi Penamaan Screenshot di
.devin/rules/qa-qc-workflow-and-status-tracking.md) —
ini WAJIB, karena jadi bukti pembanding nanti pas verifikasi (Tahap
UX-3), tanpa ini tidak bisa dibuktikan objektif apakah fix beneran
menaikkan kualitas.

**VERIFIKASI SEBELUM KLAIM** — kalau mau melaporkan "komponen X tidak
ada", WAJIB cek code dulu (grep, read file) untuk konfirmasi benar-benar
tidak ada, bukan cuma karena tidak terlihat di screenshot. Komponen
mungkin ada tapi tidak ter-render di page tertentu, atau collapsed/hidden.
Laporkan kondisi aktual ("tidak ter-render di page X" vs "tidak ada
sama sekali"), bukan asumsi. Ini mencegah temuan false positive yang
membingungkan user.

Selain alur tugas, cek juga eksplisit checklist "Kelengkapan
Struktural & Detail yang Sering Terlewat" dari rules. Checklist ini
sekarang DIPERLUAS dengan item-item berikut (WAJIB cek semua):

**Checklist struktural (existing):**
- Komponen struktural yang hilang dibanding halaman sejenis
- Proporsi/skala elemen relatif ruang tersedia
- Whitespace/jarak antar elemen
- Typography readability
- Konten/copy standards (kapitalisasi, tanda baca, terminologi)
- Kebenaran destinasi navigasi/link (klik dan verifikasi, bukan cuma cek ada)

**Checklist struktural (BARU, sering terlewat):**
- **Breadcrumb context di multi-step flow** — flow multi-step WAJIB punya
  breadcrumb atau context indicator (produk mana, step keberapa, bisa
  kembali ke step sebelumnya tanpa browser back button)
- **Information Architecture (IA) navigation** — navbar/menu: apakah item
  di-group by user goal atau flat list tanpa grouping? Flat list 6+ item
  tanpa grouping = cognitive overload (Hick's Law). Active/hover state cukup
  distinct (bukan cuma beda shade, tapi genuinely different visual treatment)?
  Label sesuai user mental model ("Produk", "Harga", "Cara Order")?
- **Mobile navigation pattern** — JANGAN cuma cek "apakah ada mobile nav".
  Cek apakah pattern-nya appropriate: `<details>`/`<summary>` BUKAN pattern
  standar — pakai Sheet/drawer atau menu overlay. Touch target
  minimum 44px. Hamburger icon jelas di top bar.
- **Trust signals di flow finansial** — checkout/payment page WAJIB punya
  security badge, "Pembayaran Aman", encryption icon. Tanpa ini conversion drop.
- **Keyboard navigation** — verifikasi Tab, Enter, Escape berfungsi di
  form/flow utama. Focus indicator visible (bukan cuma rely pada color).
- **Empty state (WAJIB 3 elemen)** — context (kenapa kosong) + direction
  (apa yang harus dilakukan) + CTA button. Bukan cuma blank space.
- **Loading state** — skeleton screen untuk structural component (table,
  card, metric panel), spinner untuk inline action. Bukan blank/berkedip.
- **Interactive states** — hover/focus/disabled punya styling jelas.
  Disabled button WAJIB punya helper text ("Lengkapi data untuk melanjutkan").
- **Color contrast (WCAG 1.4.3)** — cek contrast ratio text vs background di
  SEMUA text element. Minimum 4.5:1 untuk normal text, 3:1 untuk large text
  (18px+ / 14px bold). Cek juga contrast untuk UI component (button border,
  input border, icon). Pakai WebAIM Contrast Checker atau browser DevTools
  accessibility tab. Bukan cuma "kelihatan bisa dibaca" — ukur objektif.
- **Error state (API failure, form validation)** — apa yang user lihat kalau:
  (1) API gagal/load timeout, (2) form validation gagal, (3) page 404, (4) server
  500. Apakah pesan error jelas dan actionable? Atau cuma "Terjadi kesalahan"? 
  Error message WAJIB kasih tahu user apa yang harus dilakukan selanjutnya.
  Cek juga: apakah error state konsisten antar page (same pattern untuk
  API failure di semua page)?
- **Form UX** — (1) validation pattern: inline (per-field) vs summary (top form)? 
  Konsisten antar form? (2) error message: dekat field atau jauh? (3) required
  field indicator: asterisk + legend atau tidak ada? (4) field grouping: related
  field di-group visual atau flat? (5) autofill: browser autofill bekerja?
  (6) label: di atas field (best practice) atau di samping?
- **Modal/dialog UX** — (1) focus trap: Tab tidak keluar dari modal? (2) Escape:
  tutup modal? (3) backdrop click: tutup atau tidak? (4) mobile sizing: modal
  full-screen di 375px atau terpotong? (5) scroll lock: background tidak scroll?
  (6) close button: visible dan accessible?
- **Notification/toast pattern** — (1) konsisten antar page (same position, same
  style, same duration)? (2) auto-dismiss: berapa lama? Too short = user miss,
  too long = annoying. (3) position di mobile: top atau bottom? Terpotong?
  (4) accessible: aria-live untuk screen reader? (5) action button di toast:
  bisa diklik atau cuma text?
- **Data table UX** — (1) sorting: kolom sortable? Indicator arah sort jelas?
  (2) filtering: filter UI jelas dan intuitive? (3) pagination: ada? Consistent
  pattern antar table? (4) responsive: table scroll horizontal di mobile atau
  collapse ke card? (5) column alignment: number right-align, text left-align?
  (6) empty row: apa yang user lihat kalau table kosong?
- **Success state (post-action confirmation)** — setelah user selesai aksi
  (submit checkout, kirim konsultasi WA, export simulator): (1) apa yang user lihat?
  Redirect ke halaman sukses? Inline message? (2) apakah user TAHU aksi berhasil? (3)
  apakah ada next step guidance ("Order diterima, admin akan menghubungi via WA")?
  (4) konsisten antar flow?
- **Cross-page component consistency** — komponen yang sama (product card,
  CTA button, badge harga, WhatsApp button) muncul di multiple page/section. Cek: apakah styling
  dan behavior SAMA di semua page? Atau ada variant yang tidak sengaja beda?
  grep component name → list semua page yang pakai → screenshot di semua page.
- **Animation/motion** — (1) transition timing konsisten (150ms-300ms range)?
  (2) easing: natural (ease-out) atau linear (robotic)? (3) reduced-motion:
  `prefers-reduced-motion` di-respect? (WCAG 2.3.3). (4) loading animation:
  tidak terlalu aggressive (no flashing > 3Hz, WCAG 2.3.1).
- **Image/media** — (1) alt text: semua image punya alt text yang deskriptif?
  Decorative image: alt="" (kosong, bukan tidak ada attribute). (2) responsive:
  image resize di mobile? Pakai next/image? (3) lazy loading: below-the-fold
  image lazy loaded? (4) broken image: apa yang user lihat kalau image gagal?
- **Date/number/currency format** — (1) date: konsisten format? (dd MMM yyyy
  vs yyyy-mm-dd vs mm/dd/yyyy). (2) currency: konsisten? (Rp vs IDR vs "Rp ").
  (3) number: thousand separator konsisten? (1.000 vs 1,000). (4) time: 24h
  vs 12h konsisten? Cek di SEMUA page, bukan cuma 1.
- **Destructive action confirmation** — (1) hapus item di simulator, batalkan
  order: ada konfirmasi? (2) konfirmasi modal: text jelas konsekuensinya?
  ("Hapus desain ini dari canvas? Tindakan tidak bisa dibatalkan.") (3) button:
  destructive action pakai red/danger style? (4) undo: bisa undo atau
  benar-benar permanent?
- **Edge case state** — (1) very long text: nama customer 50 karakter, catatan
  order 500 kata, alamat 200 karakter — apakah layout break? (2) very many items:
  20+ produk di katalog, 50+ item di simulator — apakah scroll/layout bekerja?
  (3) very few items: 1 produk, 1 item di canvas — apakah layout terlihat aneh?
  (4) special character: emoji di nama, quote di alamat, karakter non-latin —
  apakah render benar?
- **User persona coverage** — walkthrough WAJIB coba dari MINIMAL 2 persona
  per flow: (1) new user (belum pernah pakai, tidak tahu istilah cetak seperti
  "kiss-cut"/"die-cut"), (2) returning user (sudah familiar, cari shortcut).
  **PENTING: cross-surface inconsistency (contoh: CTA WhatsApp di hero beda
  dengan di product card) TIDAK akan ketemu kalau cuma walkthrough dari 1
  surface. WAJIB bandingkan komponen sejenis di semua surface yang memakainya.**
- **Flow redundancy check** —
  apakah user harus melakukan aksi yang sama di 2 tempat berbeda? Contoh: pilih
  produk di katalog → masuk checkout → harus pilih produk lagi, atau isi ukuran
  di simulator → hilang saat pindah ke checkout.
  Ini bukan cuma "inefficient" — ini confusing karena user tidak tahu apakah
  pilihan pertamanya berpengaruh atau tidak. Cek: (1) apakah ada action yang
  dilakukan di page A lalu harus diulang di page B? (2) apakah ada query param
  atau state yang dikirim dari page A tapi tidak dikonsumsi di page B? (3) kalau
  ada redundansi, apakah ini intentional (user bisa ubah pilihan) atau bug
  (pilihan pertama hilang)? Referensi: NN/g Task Flow — "Users should not have
  to repeat information they already provided."
- **Proactive option display** —
  untuk flow yang melibatkan pilihan (ukuran, bahan, tipe kertas, jumlah): apakah sistem
  PROAKTIF menampilkan opsi yang tersedia, atau user harus menebak/trial-and-error?
  Contoh buruk: input ukuran bebas tanpa daftar ukuran valid → user isi salah →
  error → repeat. Contoh baik: opsi ukuran/bahan ditampilkan sebagai pilihan jelas
  dengan harga per opsi.
  Cek: (1) apakah user bisa melihat opsi tersedia SEBELUM input? (2) apakah
  ada feedback actionable saat pilihan tidak valid? (3) apakah
  user harus trial-and-error untuk menemukan opsi valid?
- **Cross-surface component consistency** —
  komponen yang sejenis (product card, CTA button, badge harga) WAJIB konsisten
  tidak hanya antar-section, tapi juga antar-surface (landing vs checkout vs
  simulator). WhatsApp button di hero dan di footer — apakah icon, warna, size,
  dan interaksi SAMA?
  Walkthrough dari 1 surface saja TIDAK akan menangkap inkonsistensi
  cross-surface. WAJIB bandingkan komponen sejenis di semua surface yang
  memakainya.
- **Focus Not Obscured (Riset: WCAG 2.2 SC 2.4.11, NEW in 2.2)** — saat user
  Tab ke interactive element, apakah focus indicator terlihat atau terhalang
  sticky header / sticky bottom bar / floating banner? Focus di belakang sticky
  element = user tidak tahu dimana focus-nya. Cek khusus pada page dengan sticky
  navbar, sticky filter bar, atau floating action button.
- **Consistent Help Location (Riset: WCAG 2.2 SC 3.2.6, NEW in 2.2)** — help
  mechanism (help link, contact, FAQ link, support chat) WAJIB muncul di lokasi
  yang konsisten across halaman. Kalau help link ada di footer di page A tapi di
  sidebar di page B, user tidak bisa menemukan help dengan cepat.
- **Form Data Preservation on Error (Riset: SaaS UX #60, NN/g H9)** — kalau form
  submit gagal (validation error, API error, network timeout), apakah data yang
  user sudah input tetap ada? Atau form reset? User WAJIB tidak pernah harus
  re-enter information yang sudah diketik. Test: isi form → submit → trigger
  error → cek apakah field masih berisi data.
- **Network Failure Handling (Riset: SaaS UX edge case, NN/g H9)** — apa yang
  terjadi saat network drop di tengah action? (1) submit form → timeout → data
  hilang atau retry? (2) upload file → drop → corrupt atau resume? (3) payment →
  timeout → user charged tapi tidak ada confirmation? Test dengan Chrome DevTools
  Network throttling (offline mode). Setiap action WAJIB graceful degrade.
- **Loading vs Empty vs Error Distinction (Riset: SaaS UX #69)** — user WAJIB
  bisa membedakan 3 state: (1) "still loading" (skeleton/spinner), (2) "nothing
  here" (empty state + CTA), (3) "something broke" (error + recovery). Ketiga
  state BUTUH visual treatment berbeda. Blank page = ambigu.
- **Flexibility & Efficiency (Riset: NN/g H7)** — apakah ada accelerator untuk
  power user? (1) keyboard shortcut untuk frequent action, (2) quick path untuk
  returning user, (3) bulk action untuk repetitive task. WAJIB dicek apakah flow
  punya user yang akan frustrated karena tidak ada shortcut.
- **Help & Documentation (Riset: NN/g H10)** — apakah user bisa menemukan help
  saat stuck? (1) FAQ accessible dari navigation? (2) contextual help di form/flow
  complex? (3) error message dengan link ke solusi? Help WAJIB contextual,
  searchable, task-oriented — bukan generic "Contact support".
- **Jargon Check (Riset: NN/g H2 Match System & Real World)** — apakah semua
  istilah di UI user-facing atau technical jargon? "Email" bukan "Email Address
  Identifier", "Menunggu Pembayaran" bukan "PENDING_PAYMENT". User tidak harus
  belajar istilah teknis untuk pakai platform.
- **Functional completeness (dari UX-0.5)** — untuk setiap gap yang
  ditemukan di Functional Completeness Sweep dan relevan untuk flow ini:
  (1) verifikasi gap-nya benar-benar muncul saat user coba pakai flow ini,
  (2) catat friksi tambahan yang gap itu sebabkan di flow ini (bukan cuma
  "fitur tidak ada", tapi "user sampai sini bingung karena tidak bisa X"),
  (3) cek apakah ada workaround yang user mungkin lakukan (kayak manual
  via admin) dan apakah workaround itu sendiri punya UX issue.

**LAYER 3: INTERACTION & RESPONSIVE SPOT-CHECK (WAJIB, tidak boleh skip):**
Selain checklist struktural di atas, WAJIB jalankan interaction check
berikut via Playwright MCP di 3 viewport (mobile 375px, tablet 768px,
desktop 1440px) untuk SETIAP halaman di flow ini:

- **Hover behavior** — hover SETIAP interactive element, screenshot hover
  state. Cek: apakah hover konten masih show setelah kursor keluar area?
  Cek: apakah hover state punya styling jelas (bukan cuma cursor pointer)?
- **Dropdown/popover direction** — buka SETIAP dropdown/popover di 375px,
  screenshot. Cek: apakah terpotong/ke luar layar? Auto-flip?
- **Focus state** — Tab ke SETIAP interactive element, screenshot. Cek:
  focus indicator visible 3:1 contrast? Brand-styled atau browser default?
- **Touch target (mobile 375px)** — ukur SETIAP interactive element via
  bounding box. Minimum 44x44px? Spacing 8px antar interactive element?
- **Text overflow (3 viewport)** — cek SETIAP text container: hero slogan,
  card title, button label, table cell. Screenshot kalau ada overflow.
- **Navbar/sidebar interaction** — hover kategori navbar: konten muncul?
  Hilang saat kursor keluar? Mobile sidebar: terpotong? Scroll lock?
  Notif bell: arah ke mana? Terpotong di small screen?

Setiap temuan Layer 3 WAJIB screenshot evidence + viewport + halaman.

**WAJIB cek SEMUA instance dari komponen sejenis yang berulang** (kalau
ada beberapa card/badge/elemen sejenis di halaman ini, cek konsistensi
di SEMUA-nya, bukan cuma 1 contoh representatif — inkonsistensi biasa
baru ketauan dari perbandingan across instance).

**DUA PERTANYAAN WAJIB untuk SETIAP temuan (bukan cuma yang jelas salah):**
1. "Apakah alokasi ruang/layout ini benar-benar OPTIMAL untuk tugas ini,
   atau cuma 'tidak rusak'?" — Jangan cuma tunggu sampai jelas salah.
   Usulkan peningkatan struktural kalau ada potensi.
2. "Kalau saya mendesain ini dari awal sebagai UX designer senior, apa
   versi TERBAIKnya — bukan cuma versi yang tidak rusak?" — Untuk SETIAP
   temuan, jangan cuma pikirkan "cara memperbaiki yang janggal". Pikirkan:
   kalau ini desain dari nol, bagaimana solusi optimalnya? Contoh: bukan
   cuma "tambah stepper", tapi spesifikkan — horizontal di desktop dengan
   labeled steps, compact "Step 2 of 4" di mobile, completed/current/future
   states. Bukan cuma "tambah empty state", tapi 3 elemen lengkap.

**Riset referensi WAJIB untuk SEMUA rekomendasi Kategori B** (bukan cuma
yang ambigu) — cari referensi dari web: design system established
(Material Design, Atlassian, Polaris, dll), usability research (NN/G,
Baymard, UX Patterns Guide), atau pattern library production (SaaSUI,
shadcn/ui blocks, Nextcraft). WAJIB juga cek skill `ui-ux-pro-max`
untuk guidelines yang relevant. Sebutkan sumber referensi di laporan.
TIDAK PERLU riset untuk bug objektif (Kategori A) yang sudah jelas salah
dari heuristik yang ada (buang waktu). Kalau tidak nemu referensi yang
qualified, WAJIB nyatakan eksplisit: "rekomendasi ini tidak punya
referensi established, berdasarkan penilaian profesional saya".

**SOLVE, DON'T SKIP** — kalau ada halaman yang gagal diakses/screenshot:
JANGAN skip. SIAPKAN state yang dibutuhkan (order via API/helper, fixture
file), NAVIGATE via UI. Cuma laporkan kalau setelah usaha maksimal
tetap gagal. Laporan akhir WAJIB ringkas, fokus ke temuan penting — jangan
laporkan proses rutin (retry berhasil, dst).

**PENTING:** analisis independen untuk SEMUA aspek flow ini, tidak
terbatas ke kategori tertentu — temukan sendiri dari pengalaman
mencoba menyelesaikan tugas itu, jangan asumsi hanya soal layout.
Termasuk analisis Information Architecture (IA) navigation, mobile nav
pattern, trust signals, keyboard nav, interaction states, responsive
behavior — bukan cuma visual/layout.

Simpan hasil ke reports/audit/[NAMA_FLOW].md sebagai section terpisah
"UX Walkthrough Findings", masing-masing dengan status OPEN dan
referensi nama file screenshot "before"-nya. JANGAN fix apapun dulu
di tahap ini — murni audit.

Update reports/status.md kolom "Track C" untuk flow ini, isi
"Done" atau "In Progress".

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI? (termasuk: apakah ada temuan yang
dibaca dari code duluan bukan dari pengalaman mencoba langsung, ada
screenshot "before" yang kelewat disimpan, ada temuan "komponen tidak
ada" yang tidak diverifikasi via code check, atau ada rekomendasi
Kategori B tanpa referensi yang disebutkan?): [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

## Tahap UX-2 — Fix

```
Fix temuan UX Walkthrough berikut dari section "UX Walkthrough
Findings" di reports/audit/[NAMA_FLOW].md yang sudah gue approve,
sesuai .devin/rules/qa-qc-workflow-and-status-tracking.md:
[list temuan yang mau difix]

Sebelum mulai, deklarasikan blast radius dan pastikan git safety net
(working tree bersih) sesuai Tahap 2.

**Sebelum fix setiap temuan, VERIFIKASI dulu kondisi aktualnya** — baca
code yang relevan untuk konfirmasi temuan itu benar (bukan false positive
dari screenshot yang menyesatkan). Kalau ternyata temuan itu salah (misal:
"komponen tidak ada" padahal ada tapi tidak ter-render di page tertentu),
KOREKSI temuan itu di audit report sebelum fix, jangan diam-diam fix
berdasarkan asumsi yang salah.

Untuk temuan yang masuk kategori "boleh GAS langsung" (tidak perlu
approval), tetap kerjakan dan laporkan sesudahnya seperti biasa.

**Saat implementasi fix, pikirkan versi TERBAIK bukan cuma versi "jalan"**
— ini konsisten dengan mindset Track C. Contoh: kalau fix-nya "tambah
empty state", bukan cuma tambah text "Belum ada data". Implementasikan
3 elemen: context + direction + CTA. Kalau fix-nya "tambah stepper",
bukan cuma garis horizontal — implementasikan dengan labeled steps,
completed/current/future states, dan mobile compact variant.

**PENTING:** kalau flow ini SUDAH punya baseline `toHaveScreenshot()`
dari Kelas Blind Spot ke-6 (screenshot regression otomatis), dan fix
ini mengubah tampilan yang di-cover baseline itu — WAJIB flag eksplisit
ke saya bahwa baseline itu akan jadi USANG dan perlu di-update supaya
tidak false-fail di test berikutnya (baseline lama akan menolak
tampilan BARU yang sudah benar). JANGAN diam-diam update baseline
tanpa bilang — ini perubahan yang menimpa reference lama, harus saya
tahu dulu.

Update status temuan di reports/audit/[NAMA_FLOW].md dari OPEN jadi
FIXED (belum VERIFIED — itu Tahap UX-3).

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

## Tahap UX-3 — Verify (Recheck Final, WAJIB untuk SEMUA temuan termasuk yang GAS)

**Ini tahap yang sering kelewat — WAJIB dilakukan untuk SEMUA temuan, termasuk yang tadinya di-GAS-fix tanpa approval.** Fix kecil sekalipun bisa saja tidak sengaja merusak sesuatu di tempat lain.

```
Verifikasi final untuk semua temuan UX Walkthrough flow [NAMA_FLOW]
yang sudah di-fix (status FIXED), termasuk yang tadinya di-GAS-fix
tanpa approval — sesuai .devin/rules/qa-qc-workflow-and-status-tracking.md.

Untuk SETIAP temuan:
1. Ambil screenshot "SESUDAH" di kondisi yang sama persis dengan
   screenshot "before" (viewport sama, state sama). Simpan ke
   reports/screenshots/[NAMA_FLOW]/after-[deskripsi]-[viewport]-[tanggal].png
   (mengikuti Konvensi Penamaan Screenshot di rules).
2. Bandingkan before vs after — konfirmasi masalah yang dilaporkan
   benar-benar sudah teratasi (bukan cuma "kelihatannya berubah").
3. Cek juga apakah fix ini tidak sengaja merusak elemen LAIN di
   sekitarnya yang sebelumnya baik-baik saja (ambil screenshot area
   yang lebih luas, tidak cuma elemen yang difix).
4. Kalau ada baseline `toHaveScreenshot()` yang perlu diupdate (sudah
   di-flag di Tahap UX-2), lakukan update baseline-nya sekarang,
   jalankan ulang test Kelas 6 untuk konfirmasi baseline baru diterima.
5. **Verifikasi multi-viewport** — cek fix di MINIMAL 3 viewport (mobile
   375px, tablet 768px, desktop 1440px). Fix yang bagus di desktop bisa
   break di mobile atau sebaliknya.
6. **Verifikasi keyboard navigation** — untuk fix yang mengubah interactive
   element (tombol, form, nav), cek Tab/Enter/Escape masih berfungsi.
7. **Verifikasi tidak ada false positive yang diperbaiki** — kalau temuan
   ternyata salah (misal: komponen sudah ada tapi tidak ter-render di page
   tertentu), pastikan fix yang dilakukan menangani kondisi AKTUAL, bukan
   kondisi yang salah dilaporkan di audit.

Update status temuan di reports/audit/[NAMA_FLOW].md dari FIXED jadi
VERIFIED (atau tetap OPEN kalau ternyata belum benar-benar teratasi
saat direcheck — jangan dipaksa VERIFIED).

Update reports/status.md kolom "Track C" untuk flow ini jadi
"Done" HANYA kalau semua temuan sudah VERIFIED (bukan cuma FIXED).

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI? (termasuk: apakah ada temuan yang
ditandai VERIFIED padahal saat direcheck ternyata belum benar-benar
teratasi?): [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

---
