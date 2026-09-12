---
trigger: always_on
---
# E2E Drift Prevention — Sebelum Jalankan Playwright

Gunakan aturan ini untuk **SEMUA** task E2E/Playwright atau audit flow yang menyentuh test `.spec.ts`. Rule ini bersifat conditional: dibaca saat task = E2E atau saat `.spec.ts` berubah/akan berubah.

> **Status infra:** Playwright ter-setup tapi spec belum ditulis. Bagian ini ditulis untuk kondisi BisaPrint: **tidak ada database, tidak ada auth, tidak ada seed** — data produk statis di `src/data/`, order disimpan di Upstash Redis (atau in-memory saat dev).

## Pre-Flight Drift Scan (wajib sebelum run)

1. **Baca audit + scenario** — `reports/audit/[flow].md` dan `reports/test-scenarios/[flow].md`. Catat scope yang di-freeze dan temuan yang sudah fixed/deferred.
2. **Baca komponen/service yang relevan** — Jangan assume text label atau class masih benar. Minimal baca:
   - Komponen utama yang di-test (contoh `src/components/checkout/CheckoutForm.tsx`, `src/components/sections/ProductCatalog.tsx`, `src/components/design-simulator/DesignSimulator.tsx`).
   - API route yang dipakai (contoh `src/app/api/midtrans/create-token/route.ts`, `src/app/api/midtrans/webhook/route.ts`, `src/app/api/upload/route.ts`).
   - `e2e/helpers.ts` atau shared helper yang dipakai test.
3. **Cross-check `data-testid` / `role` / `aria-label`** — pastikan setiap `data-testid` yang dipakai test masih ada di komponen. Jangan pakai CSS class yang bergantung warna/state (`.bg-white`, `.text-primary`) — pakai `data-testid` atau `getByRole`/`getByLabel`.
4. **Cek data fixture** — produk di `src/data/products.ts` adalah satu-satunya "seed". Kalau test butuh produk `isCheckoutEnabled: true`, verifikasi produk itu masih ada dan flag-nya masih true. Jangan hardcode nama produk kalau katalog bisa berubah — pilih berdasarkan `data-testid` atau kriteria (kategori, flag checkout).
5. **Hindari dependensi ke state antar test** — order yang dibuat test A tidak boleh diasumsikan ada di test B. Buat kondisi sendiri di awal test (misal: panggil `POST /api/midtrans/create-token` langsung sebagai fixture setup).
6. **External service** — Midtrans Snap, Google Maps embed, Meta Pixel adalah third-party. Di test, stub/intercept lewat `page.route()` — jangan biarkan test bergantung ke network eksternal.

## Server & Environment Guard

Playwright `reuseExistingServer: true` akan **reuse server apapun** yang sudah listen di `http://localhost:3000` — termasuk `npm run dev` yang ke-load `.env.local` dengan key berbeda dari yang test expect.

Aturan keras:

1. **JANGAN pernah `npm run dev` manual sebelum `npx playwright test`.** Biarkan Playwright spawn webServer sendiri.
2. **Sebelum run, pastikan port 3000 kosong:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -State Listen
   ```
   Kalau ada → `Stop-Process -Id <pid> -Force` dulu, baru run.
3. **Env yang dipakai test** harus konsisten: kalau test butuh Midtrans/Upstash mock atau key sandbox, definisikan di `playwright.config.ts` (`webServer.env`) atau `.env.test` — jangan campur credential production.
4. **Node orphan check** kalau port kosong tapi test tetap aneh: `Get-Process node` — banyak node zombie dari run sebelumnya bisa mengganggu; kill yang tidak perlu.

## Slow-Test Stop Rule (E2E lama = langsung stop)

Dev server compile halaman on-demand; cold compile rute berat (contoh `/simulator` dengan Konva) bisa 30-90 detik — itu normal. Tapi:

1. **Satu test > 5 menit di dev = SUSPICIOUS.** Stop, baca `[WebServer]` log + screenshot `test-results/`, jangan tunggu `test.setTimeout` habis.
2. **Page `goto` yang tidak pernah resolve hampir selalu compile-hang atau server crash**, bukan test lambat — cek `[WebServer]` untuk error compile.
3. Saat debugging, turunkan `test.setTimeout` ke angka realistis (misal 120-300s) daripada membiarkan 8 menit. Timeout yang terlalu besar = blind waiting.
4. `npx playwright test` tidak punya global command-timeout — yang menghentikan adalah per-test `timeout`/`test.setTimeout`. Kalau ragu, set global `timeout: 180_000` di `playwright.config.ts` untuk task eksplorasi.

## Run Policy (tidak langsung full suite)

1. `npx tsc --noEmit` + `npx vitest run` dulu — test app harus bersih sebelum E2E.
2. **Targeted single test** dulu: `npx playwright test e2e/[flow]/[spec].ts --grep "XXX-NNN" --project=chromium --retries=0`. Jangan langsung full suite.
3. Setelah targeted pass, jalankan **full suite flow itu**: `npx playwright test e2e/[flow] --project=chromium --retries=0`.
4. **Stop setelah 3 failure pertama** — baca error/context, jangan edit sampai root cause jelas. Update `reports/status.md` dan `reports/test-results/[flow].md` dengan temuan.
5. Pakai `--retries=0` saat debugging; `retries` default hanya untuk final gate.

## Selector Policy

- `data-testid` > `getByRole`/`aria-label` > CSS class warna/state.
- Jika komponen tidak punya `data-testid` yang diperlukan test, tambahkan ke komponen dulu, baru nulis test.
- Element di bawah fold butuh `scrollIntoViewIfNeeded` atau `expect` dengan scroll-aware locator — landing page ini penuh scroll-reveal section.
- Jangan rely pada `menuitem` jika dropdown tidak punya role itu; gunakan `getByRole("button")` atau `data-testid`.
- Untuk konten yang muncul via fetch client-side (harga, status order), tunggu elemen dengan `expect(item).toBeVisible({ timeout: 10000 })`, bukan `count()` yang race-prone.

## Animation & Hydration Race (Framer Motion / scroll-reveal)

Landing page BisaPrint penuh `whileInView` / scroll-triggered animation. Dua jebakan:

- **Klik sebelum hydration selesai = no-op diam-diam** — elemen terlihat (HTML SSR) tapi handler belum terpasang. Gejala: click → assertion berikutnya gagal "element(s) not found" padahal elemen ada.
- **Elemen `whileInView` awalnya `opacity: 0`** — `toBeVisible()` bisa gagal kalau animasi belum trigger. Scroll ke elemen dulu (`scrollIntoViewIfNeeded`) atau tunggu animasi selesai.

Pola aman untuk komponen toggle/animated (bukan `waitForTimeout` buta):

```ts
await expect(async () => {
  if ((await trigger.getAttribute("aria-expanded")) === "true") return true;
  await trigger.click();
  await new Promise((r) => setTimeout(r, 300));
  return (await trigger.getAttribute("aria-expanded")) === "true";
}).toPass({ timeout: 15000 });
```

Cek state dulu → click hanya kalau masih closed → aman dari double-toggle. Berlaku juga untuk `data-state`.

## Midtrans Snap di E2E

- Snap.js adalah iframe third-party — test harus `page.route()` intercept `https://app.sandbox.midtrans.com/**` (atau stub `window.snap`) untuk menghindari ketergantungan network.
- Webhook Midtrans (`POST /api/midtrans/webhook`) di-test via `request.post()` langsung ke API dengan signature valid, bukan lewat UI.

## Reporting

- Update `reports/status.md` + `reports/test-results/[flow].md` + `reports/test-scenarios/[flow].md` setiap ada perubahan atau hasil run.
- Sebutkan skip dengan alasan eksplisit; jangan bilang "pass semua" kalau ada `test.skip()`.
- `ECONNRESET`/`Error: aborted` dev-server adalah noise; jangan treat sebagai failure kecuali test benar-benar fail.
