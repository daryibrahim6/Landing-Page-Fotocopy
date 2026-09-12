---
description: Workflow pre-push verifikasi sebelum commit/push/PR untuk menghindari regresi build, test, dan CI/CD
---

# Pre-push verifikasi (wajib sebelum commit/push/PR)

Ikuti: `.devin/rules/nextjs-build-cicd-optimization.md`
Tujuan: pastiin **tidak ada regresi** dari kategori masalah yang pernah kejadian (env missing saat runtime, rendering strategy salah, warning build yang diabaikan).

> **STOP:** Kalau ada salah satu step gagal, **jangan commit/push dulu**. Fix root cause terlebih dahulu.

### 0) Environment harus bersih (samain kondisi CI)

Jalankan **sebelum** check lain:

```bash
rm -rf node_modules tsconfig.tsbuildinfo
npm ci
```

- `npm audit vulnerabilities` yang muncul saat `npm ci` adalah **warning pre-existing/non-blocking** untuk pre-push. Triage dan fix di branch terpisah, jangan campur ke commit fitur ini.

### 1) TypeScript check (WAJIB)

```bash
npx tsc --noEmit
```

- Paste **output mentah lengkap** (bukan cuma "bersih/error").
- Kalau output kosong, tulis `tsc --noEmit: clean (no output)`.

#### Root-cause tracing (kalau ada error)

Kalau ketemu TypeScript error:

- Jangan cuma list error.
- Trace ke **akar penyebab tunggal** (misal: type `Product` berubah di `src/types/` tapi `src/data/products.ts` belum disesuaikan).
- Jelaskan root cause-nya di ringkasan.

### 2) Build check (WAJIB)

```bash
npm run build
```

- Paste **output lengkap**.
- Harus sukses **tanpa error** dan **tanpa warning mencurigakan**.
- Catat halaman apa yang tetap `ƒ` (dynamic) vs `○` (static) kalau ada perubahan signifikan.

### 3) Simulasi env production-kritis kosong (anti runtime-secret coupling)

BisaPrint tidak punya database, tapi punya service eksternal yang wajib ada di production: **Upstash Redis** (order storage), **Vercel Blob** (upload), **Midtrans server key** (payment).

```powershell
# Windows — build tanpa env production-critical
Remove-Item Env:UPSTASH_REDIS_REST_URL -ErrorAction SilentlyContinue
Remove-Item Env:BLOB_READ_WRITE_TOKEN -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next
npm run build
```

- Build **harus tetap sukses** meski env itu kosong — env runtime tidak boleh dibutuhkan saat build/SSG.
- Konfirmasi tidak ada halaman publik (`/`, `/simulator`) yang jadi dynamic gara-gara baca env saat render.
- Bedakan: env `NEXT_PUBLIC_*` memang di-inline saat build — itu OK. Yang tidak boleh: route handler / server component crash kalau `MIDTRANS_SERVER_KEY`/`UPSTASH_*` kosong **saat build**.

### 4) Unit test check (WAJIB)

```bash
npx vitest run
```

- Paste ringkasan akhir: `Test Files X passed | Y failed`, `Tests Z passed`.
- **Kalau 1 test pun gagal, jangan push.**
- Root-cause tracing: trace kenapa fail, jangan langsung mock/force pass.

### 5) Environment variables (perubahan terbaru)

Cek `.env.local.example`:

- Pastikan semua env var yang baru ditambah/diubah sudah terdokumentasi di `.env.local.example` (dengan nilai kosong/placeholder — JANGAN nilai asli).
- `NEXT_PUBLIC_*` = ter-expose ke browser — jangan pernah taruh secret di situ (server key Midtrans wajib non-public).
- Pastikan build tidak gagal kalau env opsional (Meta Pixel, GA, Maps) kosong.

### 6) E2E targeted smoke (wajib jika menyentuh checkout, API route, atau komponen yang ada spec-nya)

Kalau branch mengubah file di `src/components/checkout/**`, `src/app/api/**`, `src/lib/midtrans.ts`, `src/lib/order-storage.ts`, atau spec E2E — **dan spec E2E untuk flow itu sudah ada**:

1. Jalankan **targeted verify** untuk skenario yang paling mungkin kena: `npx playwright test e2e/[flow]/[spec].ts --grep "XXX-NNN" --project=chromium`.
2. Setelah targeted hijau, boleh full run batch tersebut **1x**.
3. Jika masih fail/skipped setelah 2 kali targeted, **jangan push**. Stop, update `reports/status.md`, `reports/test-results/[flow].md`, `reports/cross-audits/review-change-report.md`, lalu lapor ke user.
4. Sambil debug, cek ulang checklist E2E:
   - Selector unik (`data-testid`, atau kombinasi kategori + nama produk).
   - UI label/teks tombol match `src/lib/constants.ts` dan komponen asli.
   - Kondisi test deterministic (tidak andalkan state sisa test lain).
   - Third-party (Midtrans Snap, Maps) di-stub via `page.route()`.

### 7) Git hygiene

```bash
git diff
git status
```

- Repo ini kerja langsung di `master` (branch utama). Untuk perubahan besar boleh pakai `feat/<nama>`; yang WAJIB: semua step di atas hijau sebelum push.
- Pastikan semua perubahan yang dimaksud sudah ke-include (nggak ada yang ketinggalan / ke-stash).
- Pastikan `.env*` / file dengan secret TIDAK ter-stage.
- Working tree bersih sebelum push.

### 8) Ringkasan akhir (wajib)

Kasih ringkasan:

- File apa saja yang berubah
- Commit message yang direkomendasikan
- Hasil tiap step (tsc / build / env-missing / vitest / git)
- Kesimpulan tegas: **aman untuk push atau belum**
- Kalau ada yang meragukan: sebutkan **apa yang masih perlu diverifikasi manual** sebelum push
- Catatan khusus: contoh `npm audit` vulnerabilities non-blocking, tapi perlu triase terpisah
