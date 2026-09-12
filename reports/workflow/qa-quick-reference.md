# QA/QC Quick Reference

> Ringkasan cepat dari `.devin/rules/qa-qc-workflow-and-status-tracking.md`. Baca file utuh untuk detail dan justifikasi.

---

## Definisi

- **QA** = pencegahan. Cari flow/fitur yang BELUM ada atau belum lengkap (business gap) sebelum ditest.
- **QC** = verifikasi hasil jadi. Tulis & jalankan skenario test untuk flow yang SUDAH ada.
- **JANGAN** campur QA dan QC dalam satu batch.

---

## Struktur Reports

```
reports/
├── status.md                    ← single source of truth
├── master-reference.md          ← index rules, flow, file patokan
├── workflow/                    ← execution guides
├── audit/[flow].md              ← audit per flow
├── cross-audits/                ← audit lintas-flow
├── page-audits/                 ← UX per halaman
├── test-scenarios/[flow].md     ← skenario test
├── test-results/[flow].md       ← hasil eksekusi
├── coverage/                    ← pure-logic coverage
└── screenshots/[flow]/          ← bukti visual
```

---

## Status.md Format

| Flow | Tier | Scope | Audit | Fix | Vitest | E2E | Track B | Track C | Final | Last Update | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|

- `Final` = `AMAN` / `CLEAR` / `IN PROGRESS` / `ADA ISU` / `BELUM`
- Update setelah setiap tahap.

---

## Track A — 4 Tahap

1. **Scope Freeze** — batas IN/OUT scope flow.
2. **Audit** — cari gap, logic bug, missing edge case, future gap.
3. **Fix + Re-check** — fix approved, re-check, lalu update status.
4. **Unit Test + Track Gate** — Vitest, lalu putuskan E2E / Track B / Track C.

---

## 5 + 1 Kelas Blind Spot Wajib Dicek

1. **Stale Reference** — entity yang bisa dihapus/diubah di tempat lain.
2. **Concurrent/Race Condition** — state transition dipicu dua aksi barengan.
3. **Time-Based State Transition** — expiry, timeout, idle.
4. **Partial Failure di Multi-Step Process** — gagal di tengah transaction.
5. **Cross-User Cache/State Staleness** — user A ubah, user B lihat lama.
6. **Visual/Layout Regression** — DOM benar tapi tampilan rusak (screenshot).

---

## Standar Kekuatan Assertion — 7 Lemah

1. Existence-only (`toBeVisible` tanpa cek isi).
2. Selector kelewat umum.
3. Negative assertion sebagai bukti positif.
4. Assertion parsial.
5. Side effect nggak diverifikasi (DB, email, notif).
6. Fixed sleep/timeout.
7. Assertion DOM untuk klaim visual/layout.

---

## Mutation Testing Ringan

Untuk test finansial/auth/critical atau test yang pernah gagal deteksi bug:

1. Sengaja rusak behavior yang diklaim ditest.
2. Jalankan test — **HARUS FAIL**.
3. Revert, jalankan lagi — **HARUS PASS**.
4. Kalau nggak fail, assertion lemah → tulis ulang.

---

## UI/UX — Pisahkan A vs B

- **Kategori A (bug objektif)** — WAJIB fix: terpotong, overlap, tidak bisa diklik, kontras 0, dialog native.
- **Kategori B (preferensi desain)** — advisory, bukan blocker status AMAN.
- `design-taste.md` **hanya** untuk landing/portfolio/redesign marketing — applicable ke hampir semua surface BisaPrint; untuk checkout/simulator kombinasikan dengan kerangka usability.

---

## 21 Anti-Pattern Scan (Layer 1 — grep)

Jalankan sebelum visual walkthrough:

1. AI Slop Punctuation (em dash)
2. Breadcrumb Dead Links
3. Capitalization Inconsistency
4. Inconsistent Border-Radius
5. Missing `aria-label` pada icon-only buttons
6. Native `confirm()` / `alert()` / `prompt()`
7. Emoji & Unicode Symbol in UI (pakai Lucide)
8. Flex Layout Without Gap
9. Table Cell Without Horizontal Padding
10. Component Variant Inconsistency
11. Query Param Read But Not Consumed
12. Missing Loading State
13. Missing `aria-live` pada Dynamic Feedback
14. Missing `prefers-reduced-motion`
15. Missing `autoComplete` pada auth forms
16. Missing `maxLength` pada text input
17. Placeholder-Only Labels
18. Drag Without Pointer Alternative
19. Modal `useEffect` Deps Trap
20. Toggle Knob Without Left Anchor
21. Flex Fixed-Size Child Without `shrink-0`

---

## Konvensi Screenshot

```
{phase}-{deskripsi}-{viewport}-{tanggal}.png
```

- `phase` = `before` / `after` / `state`
- `deskripsi` = kebab-case, tanpa nama flow
- `viewport` = `desktop` / `tablet` / `mobile`
- `tanggal` = `YYYY-MM-DD`

Simpan di `reports/screenshots/[flow]/` dan referensikan di audit.

---

## E2E Cepat

- Default **headless**: `--project=chromium --workers=1`.
- `workers=1` karena E2E money wipe DB dan serial.
- `--headed` hanya untuk debug UI/layout/selector.
- Verifikasi target pakai `--grep`.
- Maksimal 2 re-run full per batch.

---

## Format Temuan Audit

```
- ID: [FLOW]-A-NN
- Severity: P0 / P1 / P2 / P3 / P4
- Skenario: apa yang salah/belum ada
- Bukti: file/line
- Risiko: dampak
- Opsi solusi: 2+ opsi dengan trade-off
- Rekomendasi Devin
- Future gap tag: [scale / concurrency / infra / security / a11y / cross-flow / monitoring / none]
- Status: OPEN / ACK / DEFERRED / FIXED
```

---

## Self-Report Checkpoint (Wajib Tiap Jawaban)

```
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya / Tidak]
LANGKAH SELANJUTNYA: [apa yang user lakukan sekarang]
```

---

## Git & Branch (Ringkasan)

- Branch: `feat/<nama-task>`.
- Jangan push ke `main`/`dev`.
- Commit: `feat: ...` / `fix: ...`.
- Push, lalu buat MR di GitLab.
