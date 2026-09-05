---
description: Aturan investigasi E2E flaky tanpa loop trial-and-error
trigger: always_on
---

# Investigasi E2E Flaky — No Blind Re-Run Loop

Tujuan: mencegah putaran E2E panjang karena coba-coba. Setiap test failure WAJIB diinvestigasi dulu, bukan langsung di-run ulang.

## 1. Analisis sebelum fix

Sebelum mengubah kode, lakukan minimal satu dari:

- Baca **error log terakhir** (Playwright output, browser console, server log).
- Baca **code path** yang terkena (server action, API route, query, komponen UI).
- Baca **state DB** saat failure (query Prisma manual, screenshot, trace viewer).
- **Cek UI label dan teks tombol asli** di komponen (`BookingsClient.tsx`, `lib/constants.ts`, modal). Jangan asumsikan label dari spec lama.
- **Cek apakah row selector ambiguous**: search by client name bisa match banyak row (seed + test). Pastikan selector unik (client + consultant + package + status, atau `data-*` attribute).
- Identifikasi apakah ini **app bug, test assertion outdated, atau race/flaky environment**.

Jika belum tahu penyebabnya, **jangan coba-coba edit**. Tambahkan logging sementara atau jalankan test terarah 1 kali.

## 2. No full re-run loop

Dilarang loop berikut:

- Edit → full batch → fail → edit → full batch → fail → ... tanpa evidence baru.
- Ganti-ganti test assertion tanpa root cause jelas.
- Re-run "doang" tanpa perubahan dan tanpa membaca log.

Sebelum setiap re-run, tulis **hipotesis + predicted outcome** (contoh: "Hapus Serializable biar P2034 hilang; expected: MF-028–MF-030 pass").

**Aturan keras: maksimal 2 full run per batch.**
- Run 1: diagnostic — cari apa yang fail/skip.
- Run 2: final verification — konfirmasi fix sudah beres.
- Kalau setelah run ke-2 masih ada hasil **selain passed** (failed, skipped, timed out), **STOP**. Lapor ke user root cause, hipotesis, dan rencana fix targeted.
- `test.skip()` karena data tidak ketemu bukan solusi; itu menandakan test/seed kurang kuat. Buat data di awal test (contoh: `createBookingForTest`) atau tambah ke seed.

## 3. Gunakan targeted verification — sebelum full suite

- **Setelah edit, prioritas utama adalah targeted verify, bukan full suite.** Jalankan hanya test yang gagal: `npx playwright test ... --grep "MF-XXX"`.
- Full suite diperbolehkan sebagai final gate setelah targeted test yang fail sudah hijau berulang, atau untuk cross-batch regression yang memang direncanakan.
- Headless lebih cepat untuk verifikasi: `--project=chromium` tanpa `--headed`.
- `--workers=1` hanya untuk eksekusi serial/dependen (seperti money-flow); kalau test sudah independent, headless + parallel lebih cepat.
- Untuk server action, tambahkan **logging sementara ke file** (bukan cuma console) agar log tertangkap setelah run. Logging sementara WAJIB dihapus setelah root cause ketemu — jangan di-merge sebagai logging permanen. Logging permanen hanya boleh melalui `logger` yang sudah ada.

## 4. Shared files & unit test

Kalau fix menyentuh file shared (helpers, global-setup, services, hooks) atau business logic:

- Jalankan **unit test terkait** dulu sebelum E2E.
- Sebutkan file shared yang berubah di laporan.

## 5. Stop condition

Berhenti dan lapor ke user kalau:

- 3x re-run setelah fix tetap gagal dengan penyebab sama.
- Failure bersifat flaky dan tidak bisa direproduksi konsisten.
- Butuh keputusan arsitektur/signifikasi (misal: ganti isolation level, tambah retry, ubah flow bisnis).
- **Test tiga kali gagal atau stuck di titik yang sama — jangan coba-coba lanjut otomatis.** Stop, tulis temuan di `reports/status.md`, `reports/test-results/[flow].md`, dan `reports/cross-audits/review-change-report.md`, lalu lapor ke user dengan evidence konkret (file, error, behavior yang sudah diverifikasi).

## 6. Kecepatan: jangan pakai headed untuk loop

- **Default selalu headless.** `--project=chromium` tanpa `--headed`.
- `--headed` hanya untuk **visual inspection / debug UI/layout/selector**.
- Final verification WAJIB headless — headed bukan bukti valid, cuma bukti visual.
- Perkiraan waktu money-flow: ~2–3 menit per batch headless (batch 1 sendiri ~3.1 menit), vs ~20% lebih lambat dengan `--headed`. Selisih kecil per batch, tapi numpuk di iterasi debug.
- `workers` saat ini tetap 1 (`playwright.config.ts`) karena money-flow masih serial / share `bookingId` antar test — lihat `.devin/workflows/e2e-fast-track.md` untuk roadmap enable parallelism.
- Lihat `.devin/workflows/e2e-fast-track.md` untuk perintah cepat bawaan.

---

Lampiran: contoh log terarah

```bash
# Contoh: jalankan 5 test terakhir di batch 3
npx playwright test e2e/money-flow/money-flow-batch3.spec.ts --grep "MF-026|MF-027|MF-028|MF-029|MF-030" --project=chromium --workers=1
```

```ts
// Contoh: logging sementara di server action catch
const fs = await import("fs");
fs.appendFileSync("payout-debug.log", `[${new Date().toISOString()}] error=${String(err)}\n`);
```
