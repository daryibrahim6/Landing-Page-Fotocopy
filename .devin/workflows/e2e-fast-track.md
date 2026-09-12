---
description: Workflow cepat untuk eksekusi E2E Playwright (headless, targeted, minimal overhead)
---

# E2E Fast Track

Tujuan: menjalankan E2E secara cepat, default headless, dan menghindari re-run penuh yang sia-sia.

> **Status:** spec belum ada — file ini menyiapkan perintah baku untuk sesi E2E nanti. Flow aktif: `landing-page-flow`, `checkout-flow`, `whatsapp-notification-flow`, `design-simulator-flow`. Konvensi ID skenario: prefix audit flow + `-NNN` (contoh `CF-001`, `DS-003`) — prefix sama dengan audit: `LP`, `CF`, `WA`, `DS`, `PD`.

## Prinsip

1. **Default headless.** `--headed` cuma kalau butuh visual inspection / debug UI/layout/selector.
2. **Satu project/browser.** `--project=chromium`. Kalau perlu multi-browser, jadiin langkah terpisah di akhir.
3. **Workers default dari config.** Turunkan ke `--workers=1` hanya untuk skenario yang share state (contoh: order yang sama dipakai lintas test). Target: setiap test siapkan kondisi sendiri → parallel aman.
4. **Satu batch satu waktu untuk first pass atau debug.** First pass boleh `--headed` untuk visual inspection, tapi final verify WAJIB headless.
5. **Targeted verify kalau ada yang fail.** Jangan re-run full batch hanya untuk cek satu skenario.

## Perintah Cepat

### Jalankan 1 spec/flow (default cepat)

```bash
npx playwright test e2e/checkout-flow --project=chromium
```

### Verifikasi targeted 1 skenario

```bash
npx playwright test e2e/checkout-flow/checkout.spec.ts --grep "CF-001" --project=chromium
```

### Verifikasi final beberapa spec sekaligus

```bash
npx playwright test e2e/checkout-flow e2e/landing-page-flow --project=chromium
```

### Verifikasi final SEMUA spec

```bash
npx playwright test --project=chromium
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
- **`test.skip()` karena kondisi tidak ketemu = bug, bukan solusi.** Kalau test butuh state tertentu (order exist, produk checkout-enabled), siapkan di awal test — jangan skip.
- **Selector harus unik.** Nama produk bisa match beberapa card. Filter juga berdasarkan kategori/CTA, atau pakai `data-testid`. Jangan `.first()` di hasil yang potential ambiguous.
- **Sinkronkan UI label/teks tombol sebelum nulis assertion.** Cek `src/lib/constants.ts` dan komponen asli (`CheckoutForm.tsx`, `ProductCard.tsx`). Jangan andalkan teks dari spec/PRD saja — copy bisa berubah.
- **Animasi scroll-reveal:** landing page penuh `whileInView` — scroll elemen ke view dulu sebelum assert visible. Lihat `e2e-drift-prevention.md` → "Animation & Hydration Race".
- Kalau masih fail dengan penyebab tidak jelas, stop dan lapor user.
- Jangan pakai `--headed` untuk loop verifikasi.
- Jalankan unit test dulu kalau fix menyentuh `src/lib/` atau business logic.

## Laporan

Setelah batch/final verify hijau:
1. Append `reports/test-results/[flow].md`.
2. Update `reports/status.md` kolom E2E & Final.
3. Sebut shared file yang berubah dan dampak ke batch lain.
