---
description: Workflow cepat untuk eksekusi E2E Playwright (headless, targeted, minimal overhead)
---

# E2E Fast Track

Tujuan: menjalankan E2E secara cepat, default headless, dan menghindari re-run penuh yang sia-sia.

## Prinsip

1. **Default headless.** `--headed` cuma kalau butuh visual inspection / debug UI/layout/selector.
2. **Satu project/browser.** `--project=chromium`. Kalau perlu multi-browser, jadiin langkah terpisah di akhir.
3. **Workers=1 untuk flow yang masih bergantung DB state, khususnya money-flow.** Money-flow melakukan DB wipe per batch (`reseedDb()`) dan test di dalamnya share `bookingId` via `let` pakai `test.describe.configure({ mode: "serial" })` — ini anti-pattern. Target jangka panjang: setiap test create/reset data sendiri, hapus serial, lalu naikkan `workers`.
4. **Satu batch satu waktu untuk first pass atau debug.** First pass boleh `--headed` untuk visual inspection, tapi final verify WAJIB headless.
5. **Targeted verify kalau ada yang fail.** Jangan re-run full batch hanya untuk cek satu skenario.

## Perintah Cepat

### Jalankan 1 batch (default cepat)

```bash
npx playwright test e2e/money-flow/money-flow-batch1.spec.ts --project=chromium --workers=1
```

### Verifikasi targeted 1 skenario

```bash
npx playwright test e2e/money-flow/money-flow-batch3.spec.ts --grep "MF-028" --project=chromium --workers=1
```

### Verifikasi final batch 1-3 sekaligus

```bash
npx playwright test e2e/money-flow/money-flow-batch1.spec.ts e2e/money-flow/money-flow-batch2.spec.ts e2e/money-flow/money-flow-batch3.spec.ts --project=chromium --workers=1
```

### Verifikasi final SEMUA batch money-flow

```bash
npx playwright test e2e/money-flow --project=chromium --workers=1
```

## Kapan Pakai Headed

| Situasi | Mode | Alasan |
|---|---|---|
| Visual inspection / debug UI/layout/selector | `--headed` | Butuh lihat browser |
| Verify fix targeted yang gagal sebelumnya | `--project=chromium` (headless) | Cepat |
| Final verify | `--project=chromium` (headless) | Cepat + tetap valid |
| CI/pipeline | default (headless) | Tidak ada display |

## Batasan Agar Tidak Lama

- **Setelah setiap edit kecil, jalankan targeted verify dulu.** Full suite hanya final gate setelah targeted test yang fail sudah hijau berulang.
- **Maksimal 2 full run per batch: 1 diagnostic, 1 final verify.** Jika setelah run ke-2 masih ada yang **bukan passed** (failed / skipped / timed out), stop; lapor ke user root cause dan rencana fix.
- **`test.skip()` karena data tidak ketemu = bug, bukan solusi.** Kalau test butuh data, buat/seed di awal test (contoh: `createBookingForTest`). Jangan skip.
- **Row selector harus unik.** Search by client name sering match >1 row (seed + test data). Filter row juga berdasarkan konsultan, paket, dan status. Jangan `.first()` di hasil search kosong/potential ambiguous. Kalau butuh, tambah `data-*` di UI.
- **Sinkronkan UI label/teks tombol sebelum nulis assertion.** Cek `lib/constants.ts` (`bookingStatusLabel`) dan komponen asli (`BookingsClient.tsx`, modal). Jangan andalkan teks lama/terjemahan dari spec saja.
- Kalau masih fail dengan penyebab tidak jelas, stop dan lapor user.
- Jangan pakai `--headed` untuk loop verifikasi.
- Jalankan unit test dulu kalau fix menyentuh shared logic/business rule.
- Contoh biaya waktu: `booking-lifecycle-flow` full ~7.5 menit; targeted 1 skenario <30 detik.

## Laporan

Setelah batch/final verify hijau:
1. Append `reports/test-results/[flow].md`.
2. Update `reports/status.md` kolom E2E & Final.
3. Sebut shared file yang berubah dan dampak ke batch lain.
