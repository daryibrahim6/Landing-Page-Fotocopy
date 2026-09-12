---
trigger: always_on
---
# Flow Registry & Status Vocabulary — Kontrak Tunggal

> `reports/audit/*.md` = **registry kontrak** semua flow. `reports/status.md` = satu-satunya sumber kebenaran status. File lain (coverage matrix, milestones, master-reference) adalah proyeksi — kalau konflik, `status.md` menang.

## 1. Flow Registry (kontrak)

Setiap flow WAJIB terdaftar di 4 tempat sekaligus. Tidak boleh ada flow yang hanya ada di kode tapi tidak di registry.

| Lokasi | Wajib? | Isi |
|---|---|---|
| `reports/audit/<flow>.md` | WAJIB | Audit file — kontrak utama flow |
| `reports/status.md` (Flow Tracker) | WAJIB | 1 baris status |
| `reports/flow-coverage-matrix.md` | WAJIB | 1 baris + prioritas + next action |
| `reports/master-reference.md` (Flow Taxonomy) | WAJIB | Masuk Core / Supporting / Distributed |

Untuk flow aktif (non-distributed) juga wajib:
- `reports/test-scenarios/<flow>.md` — skenario test
- `reports/test-results/<flow>.md` — hasil eksekusi
- `e2e/<flow>/` — folder spec (kalau flow butuh E2E)

### Daftarkan flow baru

Saat ada flow/fitur baru:

1. Buat `reports/audit/<nama>-flow.md` dengan template standar (lihat `reports/workflow/execution-guide.md` → format temuan).
2. Tambah baris di `reports/status.md` — Final = `BELUM`.
3. Tambah baris di `reports/flow-coverage-matrix.md`.
4. Tambah ke `master-reference.md` di tier yang tepat.
5. Kalau distributed: tentukan parent flow + file test yang membuktikan coverage.

### Flow distributed (parent flow)

Flow yang logikanya hidup di dalam flow lain tetap terdaftar, tapi statusnya `DISTRIBUTED (...)`. Syarat:

- Sebut parent flow(s) eksplisit di status.md + coverage matrix.
- Sebut file test (Vitest/E2E) yang membuktikan logika distributed-nya tercover.
- Kalau salah satu parent masih `LEGACY`/`IN PROGRESS` → status distributed = `DISTRIBUTED (PARTIAL)` dan sebut parent mana yang belum.

## 2. Status vocabulary (kolom `Final`)

| Status | Arti | Syarat |
|---|---|---|
| `BELUM` | Belum mulai | — |
| `IN PROGRESS` | Ada tahap yang sedang berjalan | — |
| `ADA ISU` | Ada gap/bug OPEN (P0/P1/P2) atau butuh keputusan | Temuan OPEN di audit file |
| `CLEAR` | Track A selesai + tidak ada temuan OPEN; E2E/Track C belum wajib/belum jalan | Audit file: 0 OPEN |
| `E2E DONE` | Track A + E2E selesai; Track C belum | E2E pass count tercatat |
| `AMAN` | Semua track yang dibutuhkan selesai **di bawah workflow v2** (program re-audit Sep 2026+) | Audit v2 + E2E + Track C (kalau perlu) |
| `LEGACY` | Diverifikasi dengan workflow lama (pra Sep 2026) — **belum boleh dipercaya penuh** | Flow yang AMAN/CLEAR-nya dari audit lama |
| `DISTRIBUTED (CLEAR/IN PROGRESS/PARTIAL/LEGACY)` | Flow distributed, status mengikuti parent | Parent flow + bukti test |

### Aturan keras status

1. **`AMAN`/`CLEAR` hanya boleh diklaim untuk flow yang di-audit dengan workflow v2** (Tahap 0-3 + track lanjutan per execution-guide Sep 2026). Klaim lama (Jul–Agu 2026) diturunkan ke `LEGACY` sampai re-audit v2 selesai.
2. **Temuan P0/P1 OPEN → Final minimal `ADA ISU`/`IN PROGRESS`** — jangan pernah `CLEAR`/`AMAN` dengan security/correctness issue terbuka.
3. **`test.skip()` / conditional skip ≠ pass.** Status boleh naik hanya kalau skip terdokumentasi dan disetujui; skip tanpa alasan = `ADA ISU`.
4. **`DISTRIBUTED (CLEAR)` mensyaratkan semua parent v2-clear.** Kalau ada parent `LEGACY`/`IN PROGRESS` → `PARTIAL`/`IN PROGRESS` dan sebut parent mana.

## 3. Workflow order (canonical)

```
Tahap 0 (Scope Freeze)
  → Track A: Audit (dengan riset eksternal) → Fix → Vitest
    → Track C: UI/UX walkthrough (semua design pattern)
      → E2E Playbook (final gate — UI sudah stabil, selector tidak churn)
        → Final (AMAN/CLEAR)
```

**Kenapa Track C sebelum E2E (bukan sebaliknya):** fix Track A dan temuan Track C sama-sama bisa mengubah UI (teks, selector, struktur). Menjalankan E2E terakhir berarti test ditulis/diverifikasi terhadap UI yang sudah stabil — mengurangi rewrite test. Untuk flow yang sudah punya E2E, existing E2E tetap dipakai sebagai **smoke check** antar tahap (murah, sudah ada) — tapi **final verification E2E tetap di akhir**.

## 4. Auto-sync reports (wajib, tanpa trigger user)

Setiap perubahan yang menyentuh sebuah flow WAJIB update laporan terkait **di commit yang sama** — jangan tunggu user minta.

| Jenis perubahan | File yang WAJIB di-update |
|---|---|
| Fix bug / fitur di flow | `reports/audit/<flow>.md` (status temuan) + `reports/status.md` (baris flow) |
| Test berubah/ditambah/hasil run baru | `reports/test-results/<flow>.md` + `reports/status.md` |
| Skenario baru/diubah | `reports/test-scenarios/<flow>.md` |
| Status flow berubah (naik/turun tahap) | `status.md` + `flow-coverage-matrix.md` + `milestones/milestones.md` |
| Temuan cross-flow | `reports/cross-audits/review-change-report.md` |
| Flow baru / distributed mapping berubah | Semua 4 lokasi registry (lihat §1) |
| Env/infra/build yang mempengaruhi test | `status.md` catatan + memory `.devin/memories/` kalau pola berulang |

**Kalau ragu apakah perlu update → update.** Report basi lebih buruk daripada report yang terlalu sering di-update.

## 5. Jangan biarkan status bohong

- Status `AMAN`/`CLEAR` yang tidak didukung bukti di audit file = pelanggaran. Turunkan ke `LEGACY` atau `ADA ISU`.
- Tanggal `Last Update` yang lama (>30 hari) di flow `AMAN`/`CLEAR` = kandidat downgrade saat re-audit program berikutnya.
- Saat membaca status.md untuk planning, SELALU cross-check tanggal + bukti di audit file — jangan percaya label Final mentah.
