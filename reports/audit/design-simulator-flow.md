# Audit — design-simulator-flow

**Tier:** Core | **Prefix ID:** `DS`
**Status:** Track A lengkap (Tahap 0–3) — **CLEAR**. 9 FIXED, 1 ACK, 0 OPEN, 118/118 tests.

**Tanggal fix:** sesi terbaru — DS-A-05 diputuskan opsi disclaimer (user delegation), DS-A-08 di-ACK sebagai batasan MVP (user delegation).

**Tanggal re-audit:** sesi terbaru — audit formal v2 pertama (carry-over DS-A-01/02 diverifikasi ulang).

---

## Scope (Tahap 0 — Frozen)

### User Story / Business Rules

- **User bisa:**
  - Mode Kalkulator: pilih preset/input ukuran stiker (bulat/kotak), jenis potong (kiss 2mm / die 4mm), jumlah → lihat layout imposisi di A3 BisaPrint (325×485, area cetak 305×460) + jumlah lembar + estimasi harga → export PNG/PDF.
  - Mode Upload: drag-drop gambar design → resize via corner handles → lihat ghost tiling + jumlah per lembar.
  - FloatingSimulator: tombol floating `/simulator` di semua page kecuali checkout/simulator.
- **Roles:** anonymous visitor. Tidak ada server interaction — semua client-side (FileReader lokal, Konva canvas, jsPDF).
- **Output yang wajib benar:**
  1. Imposition math: `cols×rows` fit di `PRINT_AREA_MM` (305×460), gap per cut type, rotated hanya jika lebih banyak muat.
  2. `estimateSheets = ceil(quantity / total)`.
  3. Export PNG/PDF menghasilkan file yang benar-benar usable (bukan blank/salah rasio).
  4. Preview = apa yang tercetak (ghost grid = real layout).
  5. Estimasi harga tidak boleh tampil sebagai harga final.

### Boundary IN

| Area | File |
|---|---|
| Page | `src/app/simulator/page.tsx` |
| Components | `DesignSimulator.tsx`, `DesignCanvas.tsx`, `UploadZone.tsx`, `FloatingSimulator.tsx` |
| Domain logic | `src/lib/paper-sizes.ts` (`calculateImposition`, `estimateSheets`, constants) |
| Export | `handleExportPNG`, `handleExportPDF` (jsPDF dynamic import) |

### Boundary OUT

| Area | Kenapa OUT |
|---|---|
| `/api/upload` (Vercel Blob upload ke server) | checkout-flow — upload simulator = FileReader lokal saja, tidak menyentuh server |
| Midtrans/checkout | checkout-flow |
| WA CTA di page | whatsapp-notification-flow |

### Risiko & Prioritas

| Risiko | Skenario paling berisiko |
|---|---|
| Export broken | PNG/PDF unusable → fitur utama sia-sia |
| Preview menyesatkan | Ghost grid ≠ posisi drag user → salah ekspektasi cetak |
| Harga palsu | `BASE_SHEET_PRICE` placeholder tampil sebagai "Estimasi harga" |

**Vitest vs E2E:** imposition math + estimateSheets → Vitest (sudah 7 tests). Drag/canvas/export → E2E/manual (skipped).

---

## Temuan Track A (Tahap 1)

### Carry-over (di-verifikasi ulang)

| ID | Sev | Status |
|---|---|---|
| DS-A-01 imposition hanya stiker A3 | P1 | ACK — by design MVP (bulat+kotak saja), ekspansi backlog |
| DS-A-02 jsPDF setGState TS error | P2 | FIXED — `PDFWithGState` interface cast di `DesignSimulator.tsx:163-167`, tsc clean |

### Temuan Baru

---

#### DS-A-03 — Dimensi kertas diduplikasi hardcode (drift risk)

- **Severity:** P3
- **Skenario:** `BISA_PRINT_A3_WIDTH = 325` / `HEIGHT = 485` didefinisikan ulang di `DesignSimulator.tsx:764-765` padahal `paper-sizes.ts:14-19` sudah punya `BISA_PRINT_A3` (widthMm 325, heightMm 485). Kalau spek kertas berubah → harus edit 2 tempat → drift.
- **Bukti:** `src/components/design-simulator/DesignSimulator.tsx:764-765` vs `src/lib/paper-sizes.ts:14-19`.
- **Risiko:** Preview/PDF salah ukuran kalau satu sumber diubah.
- **Opsi:** (a) Import `BISA_PRINT_A3` dan pakai `.widthMm/.heightMm` (hapus konstanta lokal). (b) Export `BISA_PRINT_A3_WIDTH/HEIGHT` dari paper-sizes sebagai alias.
- **Rekomendasi Devin:** (a) — single source.
- **Future gap tag:** none
- **Status:** FIXED — konstanta lokal kini derive dari `BISA_PRINT_A3.widthMm/.heightMm` (single source paper-sizes.ts).

---

#### DS-A-04 — Stiker bulat digambar dengan radius cell (termasuk gap) → oversize

- **Severity:** P4
- **Skenario:** Preview `radius = cellW / 2` (line 482) dan PDF `pdf.circle(x + cellW/2, y + cellH/2, cellW/2, …)` (line 179) — `cellW = designW + gap` → lingkaran digambar **gap lebih besar** dari design asli → preview/PDF menampilkan stiker yang tumpang tindih area gap.
- **Bukti:** `DesignSimulator.tsx:179,185,482`.
- **Risiko:** Visual-only — preview/PDF sedikit menyesatkan ukuran stiker bulat.
- **Opsi:** (a) radius = `designW / 2` (atau cell dim tanpa gap). (b) Biarkan.
- **Rekomendasi Devin:** (a) — 1-line fix di 3 tempat.
- **Future gap tag:** none
- **Status:** FIXED — radius lingkaran kini `(cellW - gap) / 2` di preview SVG (line ~494) dan PDF (lines ~190,196) — design size, bukan cell+gap.

---

#### DS-A-05 — "Estimasi harga" dari `BASE_SHEET_PRICE` hardcode placeholder

- **Severity:** P2
- **Skenario:** `BASE_SHEET_PRICE = 15000` (line 42, komentar "placeholder — admin can adjust") ditampilkan sebagai "Estimasi harga Rp X" — angka ini tidak terhubung ke `pricing.ts` sama sekali. User bisa kira ini harga real. Catatan sidebar bilang "patokan" tapi angka besar tebal tetap misleading.
- **Bukti:** `DesignSimulator.tsx:42,85-87,623-628`.
- **Risiko:** Ekspektasi harga salah → komplain/konversi terganggu. Cross-flow dengan pricing.ts.
- **Opsi:**
  - (a) Wire ke `pricing.ts` (harga per lembar stiker A3 real kalau ada di products data).
  - (b) Tambah disclaimer eksplisit di sebelah angka ("*indikatif, harga final via admin") — minimal.
  - (c) Sembunyikan estimasi harga sampai pricing real.
- **Rekomendasi Devin:** (b) sekarang + (a) backlog saat pricing stiker per-lembar ada. **Butuh keputusan user** — apakah Rp15.000/lembar itu angka yang valid di lapangan?
- **Future gap tag:** cross-flow
- **Status:** FIXED (opsi disclaimer) — label "Estimasi harga*" + catatan "*Indikatif per lembar A3 — harga final dikonfirmasi admin via WhatsApp." Wire ke pricing.ts = backlog.

---

#### DS-A-06 — Posisi drag design diabaikan ghost grid (preview menyesatkan)

- **Severity:** P2
- **Skenario:** `DesignCanvas` design bisa di-drag bebas dalam kertas (`draggable` + `dragBoundFunc` line 264-273), tapi ghost copies selalu di-tile dari grid yang **terpusat** (offsetX/Y dari paper center, line 176-177). User geser design ke pojok → ghost grid tetap di tengah → preview tidak mencerminkan posisi real. Posisi drag tidak punya efek apa pun pada output/imposisi.
- **Bukti:** `src/components/design-simulator/DesignCanvas.tsx:264-276` (drag) vs `:156-177` (ghost centered).
- **Risiko:** User mengira posisi design mempengaruhi layout cetak — tidak. Ekspektasi salah → "kenapa geser tidak ngapa-ngapain".
- **Opsi:**
  - (a) Hilangkan `draggable` — design fixed center, ghost grid = satu-satunya truth (paling jujur untuk fitur imposisi).
  - (b) Ghost grid ikut anchor posisi design — kompleks, tile tetap perlu centering.
  - (c) Biarkan + tooltip jelas.
- **Rekomendasi Devin:** (a) — drag punya fungsi palsu; hapus lebih jujur. Resize tetap via Transformer.
- **Future gap tag:** none
- **Status:** FIXED — `draggable` + `dragBoundFunc` + `onDragEnd` dihapus dari KonvaImage; design fixed center, ghost grid = single truth. Tips upload diperbarui.

---

#### DS-A-07 — Export PNG: SVG tanpa width/height → blank/salah ukuran di Firefox, degraded di Chrome

- **Severity:** P1
- **Skenario:** `handleExportPNG` serialize `svgRef.current` yang hanya punya `viewBox` + className (line 452-457) — **tidak ada width/height attribute**. Riset: Firefox gagal silently drawImage SVG tanpa dims (Bugzilla 700533, lama tapi workaround masih dipakai); spec = concrete object size → default ke canvas size. Hasil: PNG blank atau konten tidak sesuai di sebagian browser. Fitur export = core.
- **Bukti:** `DesignSimulator.tsx:111-143` (serialize langsung), `:452-457` (svg tanpa width/height).
- **Risiko:** Export PNG tidak reliable cross-browser — file rusak/blank.
- **Opsi:**
  - (a) Clone node + `setAttribute("width"/"height", viewBox dims)` sebelum serialize — fix standar per riset (SO/konva docs).
  - (b) Pakai `svg.getBoundingClientRect()` untuk dims lalu inject — sama saja.
- **Rekomendasi Devin:** (a) — clone + inject width/height sebelum serialize.
- **Future gap tag:** infra (browser compat)
- **Status:** FIXED — PNG export clone node + inject `width`/`height` attrs (BISA_PRINT_A3 dims) sebelum serialize → intrinsic size eksplisit, conform Firefox+spec.

---

#### DS-A-08 — Upload mode hardcode kiss+square + tidak ada export

- **Severity:** P3
- **Skenario:** `DesignCanvas` panggil `calculateImposition(…, "kiss", "square")` hardcode (line 103-108, 139-144) — tidak ada pilihan cut/shape di upload mode. Juga tidak ada export PNG/PDF di upload mode (hanya calculator).
- **Bukti:** `DesignCanvas.tsx:103-108`, `DesignSimulator.tsx:661-760` (upload mode tanpa export buttons).
- **Risiko:** Limitasi fitur — user upload design bulat/die-cut tidak bisa simulasi akurat; hasil simulasi upload tidak bisa di-export.
- **Opsi:** (a) Tambah cut selector + export di upload mode (kerja sedang). (b) Biarkan — MVP limitation.
- **Rekomendasi Devin:** (b) untuk sekarang — konsisten DS-A-01 ACK, tapi documented.
- **Future gap tag:** none
- **Status:** ACK — batasan MVP (konsisten DS-A-01): upload mode kiss+square saja, tanpa export. Backlog: cut selector + export di upload mode.

---

#### DS-A-09 — UploadZone: tanpa batas ukuran file + FileReader tanpa onerror

- **Severity:** P4
- **Skenario:** `handleFile` cek type saja — tidak ada batas ukuran. Image 50MB → `readAsDataURL` → dataURL ~67MB di memory + Konva render → lag/crash di device lemah. `reader` tidak punya `onerror` → gagal baca = silent.
- **Bukti:** `UploadZone.tsx:16-35`.
- **Risiko:** Memory spike, silent failure.
- **Opsi:** (a) Batasi ~10MB + `reader.onerror` alert. (b) Biarkan.
- **Rekomendasi Devin:** (a) — 5 baris.
- **Future gap tag:** scale
- **Status:** FIXED — cap 10MB (`MAX_FILE_SIZE_BYTES`) + `reader.onerror` alert di UploadZone.

---

#### DS-A-10 — Form inputs tanpa label terasosiasi + toggle tanpa `aria-pressed`

- **Severity:** P3
- **Skenario:** `<label>` di atas `<input>` (designW/H, quantity, fileName) tanpa `htmlFor`/`id` → tidak terasosiasi programatis (screen reader tidak link label→input). Mode/shape/cut/orientation toggle buttons tanpa `aria-pressed` (pola sama yang difix di landing LP-A-19).
- **Bukti:** `DesignSimulator.tsx:307-334, 402-413, 520-526`; toggle `:222-245, 277-304, 336-364, 373-398`.
- **Risiko:** A11y — screen reader user tidak dapat context field.
- **Opsi:** (a) htmlFor/id pairing + `aria-pressed` di semua toggle (pola landing). (b) Biarkan.
- **Rekomendasi Devin:** (a) — pola sudah ada, konsisten.
- **Future gap tag:** a11y
- **Status:** FIXED — `htmlFor`/`id` di ds-width/ds-height/ds-quantity + `aria-label` fileName + `aria-pressed` di semua toggle (mode/shape/orientasi/cut).

---

#### DS-A-11 — Transformer anchor 8px terlalu kecil untuk touch + tidak ada alternatif keyboard

- **Severity:** P4
- **Skenario:** `anchorSize={8}` (line 281) → handle resize ~8px vs panduan touch target 44px (WCAG 2.5.5 AAA / 24px 2.5.8 AA). Resize di mobile susah. Konva docs resmi: "Canvas shapes are not keyboard controls. Provide an HTML control for each essential drag action" — tidak ada input numeric untuk ukuran design di upload mode.
- **Bukti:** `DesignCanvas.tsx:281`; Konva docs (research).
- **Risiko:** Mobile UX resize frustasi; zero keyboard path.
- **Opsi:** (a) anchorSize naik (mis. 14-16) + input numeric ukuran design di sidebar upload mode (keyboard path). (b) Biarkan.
- **Rekomendasi Devin:** (a) bagian input numeric saja (a11y real); anchorSize optional polish.
- **Future gap tag:** a11y
- **Status:** FIXED — `anchorSize` 8→14 + input numeric L×T di pojok kanan atas canvas (keyboard path, sesuai rekomendasi Konva docs).

---

#### DS-A-13 — Transformer scale tidak di-reset → image double-scaling setelah resize

- **Severity:** P2
- **Skenario:** `handleTransformEnd` baca `node.scaleX/scaleY` → hitung mm → `setDesignMm` — tapi **tidak pernah `node.scaleX(1)`**. Pattern resmi Konva: bake transform ke width/height lalu reset scale. Tanpa reset, scale menumpuk: re-render dengan `width=designPxW` baru dikalikan scale lama → image render lebih besar dari `designMm` tracked → kompound di tiap resize.
- **Bukti:** `DesignCanvas.tsx` `handleTransformEnd` (sebelum fix); Konva docs Transformer example.
- **Risiko:** Ukuran visual ≠ ukuran tracked → ghost grid + hasil imposisi tidak match gambar.
- **Opsi:** (a) `node.scaleX(1); node.scaleY(1)` setelah baca (pattern resmi). (b) Pass scale sebagai prop — lebih kompleks.
- **Rekomendasi Devin:** (a).
- **Future gap tag:** none
- **Status:** FIXED — `node.scaleX(1); node.scaleY(1)` ditambahkan + komentar penjelasan.

---

#### DS-A-12 — Input angka: clear → snap ke 1 (tidak bisa hapus digit)

- **Severity:** P4
- **Skenario:** `onChange → Math.max(1, Number(e.target.value))` (lines 316, 329, 411) — user hapus isi field → `Number("")=0` → snap `1` → field tidak bisa dikosongkan → mengetik "12" dari kondisi clear menghasilkan "11"→"112" dst. Friction UX kecil.
- **Bukti:** `DesignSimulator.tsx:316,329,411`.
- **Risiko:** UX friction saat edit angka.
- **Opsi:** (a) Simpan state string, clamp on blur. (b) Biarkan.
- **Rekomendasi Devin:** (a) kalau mau polish; (b) acceptable.
- **Future gap tag:** none
- **Status:** FIXED — state designW/designH/quantity kini string; input bisa di-clear, parse Number() di useMemo (<=0 → result null).

---

## Riset Eksternal (Tahap 1 — wajib)

| Area | Current approach | Best practice (sumber) | Gap? |
|---|---|---|---|
| SVG→PNG export | Serialize DOM svg (viewBox only, no width/height) | Inject `width`/`height` attrs sebelum serialize — Firefox fail silently tanpa dims (Bugzilla 700533, SO konva threads) | **Ya → DS-A-07** |
| Canvas a11y | Konva drag/resize only | Konva docs resmi: "provide an HTML control for each essential drag action" | **Ya → DS-A-11** |
| Touch target | `anchorSize={8}` (~8px) | WCAG 2.5.8 AA min 24px / 2.5.5 AAA 44px | **Ya → DS-A-11** |
| Imposition math | `floor(printable/cell)` + rotated compare + ceil sheets | Standar bin-packing grid (approach benar) | Conform ✓ |
| Form labels | `<label>` sibling tanpa htmlFor | WCAG 1.3.1 — programmatic association | **Ya → DS-A-10** |
| FileReader | Type check only | Size cap + onerror untuk robustness | **Ya → DS-A-09** |

## 5 Kelas Blind Spot — cross-check

| Kelas | Temuan |
|---|---|
| Stale Reference | **DS-A-03** (duplikat dimensi), DS-A-04 (cell vs design dim) |
| Concurrent/Race | Client-only, single-user — N/A. `img.onload` cancelled-flag ada ✓ |
| Time-Based Transition | N/A |
| Partial Failure multi-step | **DS-A-07** (export gagal cross-browser), DS-A-09 (FileReader tanpa onerror); export catch → alert ✓ |
| Cross-User Cache/State | N/A — semua state local |

## Unit Test Coverage (Tahap 3)

- `calculateImposition` → `paper-sizes.test.ts` → square/round layout, gap kiss vs die, oversized→0, **deterministic rotation** (200×20 → rotated, 13×2=26), no-rotate case, **non-positive dims → 0** (guard baru), boundary exact-fit (303×458→1), gap-overflow→0
- `estimateSheets` → `paper-sizes.test.ts` → ceil math, pieces=0→0
- `mmToPx`/`pxToMm` → `paper-sizes.test.ts` → 96DPI conversion, round-trip, scale factor
- UploadZone validation, drag/transform, export path → DOM-dependent → **Track B/E2E** (skipped)

## Track Gate

| Pertanyaan | Keputusan |
|---|---|
| E2E? | **Nanti** — canvas drag/export butuh browser real; skip per keputusan user |
| Test shallow? | **Tidak** — rotation test kini deterministic assertion (bukan conditional), guard ≤0 di-test eksplisit |
| UI/UX sisa? | Tidak blocking — canvas UX polish → Track C opsional |
| Cross-flow? | Tidak — semua perubahan client-local ke simulator; `paper-sizes` guard backward-compatible |

---

## Rekap

| Severity | Count | IDs | Status |
|---|---|---|---|
| P1 | 1 | DS-A-07 | FIXED |
| P2 | 2 | DS-A-05, DS-A-06 | FIXED |
| P3 | 3 | DS-A-03, DS-A-08, DS-A-10 | FIXED / ACK (DS-A-08) |
| P4 | 4 | DS-A-04, DS-A-09, DS-A-11, DS-A-12 | FIXED |

**Total: 10 FIXED, 1 ACK, 0 OPEN** (DS-A-13 ditambahkan di deep recheck).

## Tahap 2 Fix Log

| File | Perubahan |
|---|---|
| `src/components/design-simulator/DesignSimulator.tsx` | Dims derive dari `BISA_PRINT_A3` · PNG export clone+dims inject · radius bulat `- gap` (preview+PDF) · disclaimer harga indikatif · string-state inputs · `htmlFor`/`aria-pressed`/`aria-label` lengkap · tips upload disync |
| `src/components/design-simulator/DesignCanvas.tsx` | `draggable`/`dragBoundFunc`/`onDragEnd` dihapus · `anchorSize` 8→14 · input numeric L×T keyboard-accessible · scale reset post-transform (DS-A-13, deep recheck) |
| `src/components/design-simulator/UploadZone.tsx` | Cap 10MB + `reader.onerror` |

**Verifikasi Tahap 2:** `tsc` clean · `eslint` 0 problems · `vitest` **111/111** (paper-sizes math tidak berubah → tests tetap hijau).
