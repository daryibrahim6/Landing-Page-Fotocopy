---
description: Workflow pre-push verifikasi sebelum commit/push/MR untuk menghindari regresi build, test, dan CI/CD
---

# Pre-push verifikasi (wajib sebelum commit/push/MR)

Ikuti: `.devin/rules/nextjs-build-cicd-optimization.md`
Tujuan: pastiin **tidak ada regresi** dari kategori masalah yang pernah kejadian (build-time DB access, rendering strategy per halaman, NODE_ENV ordering di Dockerfile, dll).

> **STOP:** Kalau ada salah satu step gagal, **jangan commit/push dulu**. Fix root cause terlebih dahulu.

### 0) Environment harus bersih (samain kondisi CI)

Jalankan **sebelum** check lain:

```bash
rm -rf node_modules lib/generated tsconfig.tsbuildinfo
npm ci
npx prisma generate
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
- Trace ke **akar penyebab tunggal** (misal: perubahan enum di `schema.prisma` tapi declaration/type augmentation belum disesuaiin).
- Jelaskan root cause-nya di ringkasan.

### 2) Build check (WAJIB)

```bash
npm run build
```

- Paste **output lengkap**.
- Harus sukses **tanpa error** dan **tanpa warning mencurigakan**.
- Catat halaman apa yang tetap `ƒ` (dynamic) vs `○` (static) kalau ada perubahan signifikan.

### 3) Simulasi DB unreachable (anti build-time DB access)

Simulasikan DB unreachable (pakai non-routable IP):

```bash
DATABASE_URL=postgresql://user:pass@192.0.2.1:5432/db npm run build
```

PowerShell (Windows):

```powershell
$env:DATABASE_URL = "postgresql://user:pass@192.0.2.1:5432/db"
Remove-Item -Recurse -Force .next
npm run build
```

- Pastikan `npm run build` tetap sukses.
- Pastikan **tidak ada** `prisma:error` fatal.
- Konfirmasi **tidak ada halaman** yang query Prisma langsung saat build time.

### 4) Unit test check (WAJIB — ini yang paling sering bikin CI prebuild gagal)

```bash
npx vitest run
```

- Paste ringkasan akhir: `Test Files X passed | Y failed`, `Tests Z passed`.
- **Kalau 1 test pun gagal, jangan push.**
- Root-cause tracing: trace kenapa fail, jangan langsung mock/force pass.

### 5) Environment variables (perubahan terbaru)

Cek `lib/env.ts`:

- Pastikan semua env var yang baru ditambah/diubah sudah masuk ke **schema validasi** (Zod).
- Pastikan env yang boleh kosong di dev/non-production pakai `.optional()`.
- Pastikan build **tidak gagal** kalau env var tsb kosong di environment tertentu (sudah tercover di step 2 & 4).

### 6) E2E targeted smoke (wajib jika menyentuh UI admin, server action, atau flow yang ada E2E)

Kalau branch mengubah file di `features/admin/**/*`, `features/booking/services/actions.ts`, `features/payment/services/reversal.ts`, atau spec E2E:

1. Jalankan **targeted verify** untuk skenario yang paling mungkin kena: `npx playwright test e2e/[flow]/[spec].ts --grep "XXX-NNN" --project=chromium --workers=1`.
2. Setelah targeted hijau, boleh full run batch tersebut **1x**.
3. Jika masih fail/skipped setelah 2 kali targeted, **jangan push**. Stop, update `reports/status.md`, `reports/test-results/[flow].md`, `reports/cross-audits/review-change-report.md`, lalu lapor ke user.
4. Sambil debug, cek ulang checklist E2E:
   - Row selector unik (client + consultant + package + status, atau `data-*` attribute).
   - UI label/teks tombol match `lib/constants.ts` dan komponen asli.
   - Data test deterministic (tidak andalkan seed saja).

### 7) Git hygiene

```bash
git diff
git status
```

- Pastikan branch aktif adalah feature branch (`feat/<nama>`), bukan `main`/`dev`.
- Pastikan semua perubahan yang dimaksud sudah ke-include (nggak ada yang ketinggalan / ke-stash).
- Working tree bersih sebelum push.

### 7) Ringkasan akhir (wajib)

Kasih ringkasan:

- File apa saja yang berubah
- Commit message yang direkomendasikan
- Hasil tiap step (tsc / build / DB-unreachable / vitest / env / git)
- Kesimpulan tegas: **aman untuk push atau belum**
- Kalau ada yang meragukan: sebutkan **apa yang masih perlu diverifikasi manual** sebelum push
- Catatan khusus: contoh `npm audit` vulnerabilities non-blocking, tapi perlu triase terpisah
