# Investigasi E2E Flaky — No Blind Re-Run Loop

Tujuan: mencegah putaran E2E panjang karena coba-coba. Setiap test failure WAJIB diinvestigasi dulu, bukan langsung di-run ulang.

> **Status infra:** Playwright ter-setup (`playwright.config.ts`) tapi **spec belum ditulis** — aturan ini aktif begitu `e2e/` punya spec BisaPrint. Referensi pola spec: `_archive/konsulexpert/e2e/` (project lain, jangan copy isi skenarionya).

## 1. Analisis sebelum fix

Sebelum mengubah kode, lakukan minimal satu dari:

- Baca **error log terakhir** (Playwright output, browser console, server log).
- Baca **code path** yang terkena (API route, komponen UI, helper `src/lib/`).
- Baca **state penyimpanan** saat failure — order di Upstash Redis / in-memory store (`src/lib/order-storage.ts`), file upload di Vercel Blob.
- **Cek UI label dan teks tombol asli** di komponen (`CheckoutForm.tsx`, `ProductCard.tsx`, `src/lib/constants.ts`, dialog). Jangan asumsikan label dari spec lama.
- **Cek apakah selector ambiguous**: cari produk by nama bisa match banyak card. Pastikan selector unik (pakai `data-testid`, atau kombinasi kategori + nama produk + CTA).
- Identifikasi apakah ini **app bug, test assertion outdated, atau race/flaky environment**.

Jika belum tahu penyebabnya, **jangan coba-coba edit**. Tambahkan logging sementara atau jalankan test terarah 1 kali.

## 2. No full re-run loop

Dilarang loop berikut:

- Edit → full batch → fail → edit → full batch → fail → ... tanpa evidence baru.
- Ganti-ganti test assertion tanpa root cause jelas.
- Re-run "doang" tanpa perubahan dan tanpa membaca log.

Sebelum setiap re-run, tulis **hipotesis + predicted outcome** (contoh: "Tambah `waitForResponse` ke `/api/midtrans/create-token`; expected: checkout test pass").

**Aturan keras: maksimal 2 full run per batch.**
- Run 1: diagnostic — cari apa yang fail/skip.
- Run 2: final verification — konfirmasi fix sudah beres.
- Kalau setelah run ke-2 masih ada hasil **selain passed** (failed, skipped, timed out), **STOP**. Lapor ke user root cause, hipotesis, dan rencana fix targeted.
- `test.skip()` karena kondisi tidak ketemu bukan solusi; itu menandakan test/fixture kurang kuat. Siapkan kondisi di awal test (contoh: buat order lewat helper API) — jangan skip.

## 3. Gunakan targeted verification — sebelum full suite

- **Setelah edit, prioritas utama adalah targeted verify, bukan full suite.** Jalankan hanya test yang gagal: `npx playwright test e2e/<flow>/<spec>.ts --grep "CHK-XXX"`.
- Full suite diperbolehkan sebagai final gate setelah targeted test yang fail sudah hijau berulang, atau untuk cross-batch regression yang memang direncanakan.
- Headless lebih cepat untuk verifikasi: `--project=chromium` tanpa `--headed`.
- Naikkan `workers` kalau test sudah independent; pakai `--workers=1` hanya untuk skenario yang share state (contoh: urutan order yang sama).
- Untuk API route / server logic, tambahkan **logging sementara ke file** (bukan cuma console) agar log tertangkap setelah run. Logging sementara WAJIB dihapus setelah root cause ketemu — jangan di-merge sebagai logging permanen.

## 4. Shared files & unit test

Kalau fix menyentuh file shared (`src/lib/`, komponen `shared/`, API route) atau business logic:

- Jalankan **unit test terkait** dulu (`npm test` / `npx vitest run <file>`) sebelum E2E.
- Sebutkan file shared yang berubah di laporan.

## 5. Stop condition

Berhenti dan lapor ke user kalau:

- 3x re-run setelah fix tetap gagal dengan penyebab sama.
- Failure bersifat flaky dan tidak bisa direproduksi konsisten.
- Butuh keputusan arsitektur/signifikan (misal: pindah storage order, ubah flow checkout).
- **Test tiga kali gagal atau stuck di titik yang sama — jangan coba-coba lanjut otomatis.** Stop, tulis temuan di `reports/status.md`, `reports/test-results/[flow].md`, dan `reports/cross-audits/review-change-report.md`, lalu lapor ke user dengan evidence konkret (file, error, behavior yang sudah diverifikasi).

## 6. Kecepatan: jangan pakai headed untuk loop

- **Default selalu headless.** `--project=chromium` tanpa `--headed`.
- `--headed` hanya untuk **visual inspection / debug UI/layout/selector**.
- Final verification WAJIB headless — headed bukan bukti valid, cuma bukti visual.
- Lihat `.devin/workflows/e2e-fast-track.md` untuk perintah cepat bawaan.

---

Lampiran: contoh log terarah

```bash
# Contoh: jalankan 1 skenario spesifik di flow checkout
npx playwright test e2e/checkout-flow/checkout.spec.ts --grep "CHK-001" --project=chromium
```

```ts
// Contoh: logging sementara di route handler catch
const fs = await import("fs");
fs.appendFileSync("webhook-debug.log", `[${new Date().toISOString()}] error=${String(err)}\n`);
```
