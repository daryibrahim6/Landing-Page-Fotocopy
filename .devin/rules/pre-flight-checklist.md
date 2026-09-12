---
trigger: always_on
---
# Pre-Flight Checklist — WAJIB sebelum mulai task apapun

## Aturan

Sebelum menulis kode, jalankan checklist ini. Tidak ada pengecualian, tapi intensitasnya adaptif:
- **Task kompleks** (fitur baru, refactor, audit) = full report
- **Task simple** ("gas dah", bug fix kecil, text edit) = cukup 1 baris konfirmasi
- User bilang "pre-flight?" atau "udah baca rules?" = WAJIB output full report, tidak boleh bilang "iya udah" tanpa bukti

## Step 1: Baca context files

Baca file-file ini sebelum eksekusi (rules lain sudah auto-loaded via always-on):
1. `milestones/milestones.md` — cek milestone aktif
2. `reports/status.md` — cek status QA/QC per flow (audit, test scenario, test execution). Kalau belum ada, fallback ke `reports/master-reference.md` untuk index rules/flow.
3. `.devin/rules/design-taste.md` — HANYA saat task bikin/redesign halaman frontend marketing (on-demand)
4. `.devin/rules/nextjs-build-cicd-optimization.md` — HANYA saat task berhubungan dengan build, deploy, atau rendering strategy (auto-loaded, tapi eksplisit cek saat task relate)

## Step 2: Skills-first

Sudah diatur di `ponytail.md` (Skill-First Discipline). Sebut skill yang dipakai atau kenapa tidak ada yang relevan.

## Step 3: Konteks task + laporan

Jawab sebelum eksekusi, output dalam format ini:

```
## Pre-Flight Check
- Milestone: [milestone aktif / N/A]
- Skill: [skill yang dipakai / "tidak ada skill relevan, alasan: ..."]
- Task type: [fitur baru / bug fix / refactor / design]
- Fitur terkait: [flow/domain terkait, mis. checkout-flow, design-simulator]
- Files yang akan terkena: [list]
- Perlu update reports?: [ya/tidak]
```

Untuk task simple, cukup: *"Pre-Flight: [task type], files: [list], skill: [nama/alasan]"*
