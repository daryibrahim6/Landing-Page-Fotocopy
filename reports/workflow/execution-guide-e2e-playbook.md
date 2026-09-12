# 🌐 E2E PLAYBOOK — Integration Testing (Playwright)

> **BUKAN Track A.** E2E ini terpisah. Jalankan setelah flow selesai Track A dan Track Gate memutuskan butuh E2E.
>
> **Status saat ini:** Playwright infra di-setup tapi **spec BisaPrint belum ditulis** dan E2E sengaja **belum dijalankan** — eksekusi ditunda sampai functional + UI/UX stabil. Jangan klaim status E2E apapun sebelum run pertama benar-benar dieksekusi.

---

## Kapan E2E Dijalankan

1. Track A untuk flow sudah `CLEAR` (scope → audit → fix → unit test selesai).
2. Track Gate memutuskan flow ini user-facing dan butuh end-to-end coverage.
3. Atau: ada fix/arsitektur yang menyentuh banyak flow dan perlu smoke E2E.

---

## Mindset E2E (Senior QA Engineer)

Bukan cuma "test pass" — tapi "apakah test ini benar-benar membuktikan sistem aman untuk user real?"

- Cari skenario yang TIDAK ada di spec tapi user masuk akal lakukan.
- Setiap skenario yang di-skip WAJIB punya alasan documented.
- Test data harus deterministic — tidak boleh flaky.

---

## Playwright Quality Standards

**Wajib:**

1. **Tidak boleh `waitForTimeout()`.** Pakai web-first assertions (`expect(locator).toBeVisible()`, `expect(page).toHaveURL()`), `page.waitForResponse()`, atau `expect.poll()`.
2. **Tidak boleh `test.describe.configure({ mode: "serial" })` kecuali alasan eksplisit.** Test harus independent; create/cleanup sendiri.
3. **Locator user-facing:** `getByRole()`, `getByLabel()`, `getByText()`, `getByTestId()`. Hindari CSS selector raw.
4. **Tidak boleh `networkidle`.** Pakai `expect(locator).toBeVisible()` atau `waitForResponse()`.

**Strongly recommended:**

5. **Production build untuk CI.** `npm run build && npm run start` di CI; dev mode hanya untuk lokal.
6. **Shared setup:** kalau ada state berulang (order yang sudah dibuat, consent state), siapkan lewat setup project/helper — bukan auth (BisaPrint tidak punya login).
7. **Retry strategy:** `retries: 2` di CI, `0` di lokal.
8. **HTML reporter + trace:** `reporter: [['list'], ['html', { open: 'never' }]]`, `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`.

**Nice to have:** multi-browser, parallel workers setelah test isolation fix, sharding `--shard=1/4`.

---

## Cara Menjalankan E2E

Default WAJIB **headless** dengan chromium:

```bash
npx playwright test --project=chromium
```

- `--headed` hanya untuk visual inspection / debug selector/layout.
- `workers: 1` hanya kalau test terbukti share state; default boleh parallel.
- Targeted verify pakai `--grep "nama-flow or pattern"` atau path spec.
- Maksimal 2 re-run full per batch.
- Final verification dan CI harus headless.

Lihat juga `.devin/workflows/e2e-fast-track.md` dan `.devin/rules/e2e-investigation-no-loop.md`.

---

## Prompt: Tulis / Perbaiki E2E untuk Satu Flow

```
Kerjain E2E Playwright untuk flow [NAMA_FLOW].

Konteks:
- Track A untuk flow ini sudah CLEAR.
- Unit test sudah ter-cover di Tahap 3; JANGAN tulis ulang skenario murni-logic sebagai E2E.
- Fokus E2E ke alur USER: klik, isi form, navigasi, integrasi antar halaman, state transition terlihat di UI.

Langkah:
1. Baca `reports/audit/[NAMA_FLOW].md` dan `reports/test-scenarios/[NAMA_FLOW].md` (kalau ada).
2. Cek `e2e/[NAMA_FLOW]/` — list test yang sudah ada; review apakah masih relevan.
3. Tulis/update spec Playwright sesuai Playwright Quality Standards di atas.
4. Pastikan setiap test:
   - Independent (buat data/state sendiri via UI atau helper, cleanup sendiri).
   - Assertion ketat (cek URL, state, elemen spesifik — bukan cuma "tidak crash").
   - Cover normal + edge path yang user bisa lakukan.
5. Jalankan targeted verify: `npx playwright test e2e/[NAMA_FLOW]/ --project=chromium`.
6. Kalau gagal, root cause dulu — jangan blind re-run. Lihat `.devin/rules/e2e-investigation-no-loop.md`.
7. Simpan test scenario summary di `reports/test-scenarios/[NAMA_FLOW].md`.
8. Update `reports/status.md` kolom E2E = Done / In Progress untuk flow ini.

Output:
- List spec file yang ditulis/diubah.
- Hasil run (pass/fail/skip) dengan evidence.
- Temuan yang perlu fix di app — bukan cuma di test.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya / Tidak]
LANGKAH SELANJUTNYA: [lanjut fix app, atau update STATUS, atau selesai]
```

---

## Prompt: E2E Regression untuk Banyak Flow

```
Jalankan E2E regression headless untuk flow-flow berikut:
[list flow]

Gunakan `--project=chromium`. Laporkan:
- Total tests, pass, fail, skip per flow.
- Failures: root cause (app bug, flaky, test outdated, env issue).
- Apakah perlu fix app sebelum merge.

Jangan blind re-run lebih dari 2 kali per batch.
```

---

## Screenshot & Evidence

- Screenshot on failure WAJIB aktif.
- Screenshot before/after manual walkthrough ikut konvensi di `.devin/rules/qa-qc-workflow-and-status-tracking.md`.
- Trace on first retry WAJIB aktif untuk debug flaky.

---

## Playwright Baseline (Project-Level)

> Bagian ini berlaku untuk **semua flow**. Update hanya kalau ada perubahan di `playwright.config.ts` atau shared helpers.

### Konfigurasi Target

File: `playwright.config.ts` (dibuat saat Fase E2E setup)

```ts
{
  fullyParallel: true,          // BisaPrint tidak punya shared DB — test isolated
  workers: undefined,           // default parallel; turunkan kalau terbukti share state
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI },
}
```

Catatan:
- **Tidak ada auth setup / storageState** — BisaPrint public-facing, tidak ada login.
- **Tidak ada DB seed** — order dibuat lewat UI flow atau helper `createOrderForTest` yang memanggil API/storage langsung.
- `video`, `trace`, `screenshot` hanya menyimpan artefak saat **gagal** supaya disk tidak penuh dan run lebih cepat.
- Untuk Midtrans: test pakai sandbox mode (`MIDTRANS_IS_PRODUCTION=false`); JANGAN test pembayaran real.

### Profiling Commands

```bash
# Lihat durasi per spec (profiling)
npx playwright test --reporter=list

# Targeted flow, headless (default lokal)
npx playwright test e2e/[FLOW]/ --project=chromium

# Verifikasi TypeScript sebelum run
npx tsc --noEmit
```

---

## Prompt: Playwright Performance / Baseline Check

```
Cek baseline Playwright project ini. Pastikan:
1. `playwright.config.ts` masih sesuai standar (headless, workers, visual assets on-failure).
2. Helper test (kalau ada di `e2e/helpers.ts`) masih berfungsi dan dipakai di flow yang relevan.
3. Jalankan profiling `npx playwright test --reporter=list` dan lapor spec paling lambat.
4. Cari anti-pattern: `waitForTimeout()`, `getByLabel` yang ambiguous, `test.describe` serial tanpa alasan, data test non-unique.

Jangan lupa update `reports/workflow/execution-guide-e2e-playbook.md` kalau ada perubahan baseline.
```

---

## Per-Flow E2E Remediation Checklist

Setiap flow baru yang diaudit E2E WAJIB dicek item berikut (pola-pola yang terbukti lolos di project sebelumnya):

- [ ] **Data test deterministic.** Buat order/state sendiri di awal test via helper atau lewat UI flow. `test.skip()` karena data tidak ketemu = bug.
- [ ] **Selector unik, bukan `.first()` sembarangan.** Card produk dengan nama mirip bisa match banyak elemen. Filter berdasarkan atribut unik (kategori + nama produk), atau tambahkan `data-testid` di UI dan pilih via `page.getByTestId(...)`.
- [ ] **UI label & teks tombol selalu dicek ke source of truth-nya.** Jangan asumsikan label dari spec. Cek `src/lib/constants.ts` (WhatsApp message, brand name), komponen `CheckoutForm.tsx`, `ProductCard.tsx`, dan copywriting di `src/data/` sebelum nulis assertion.
- [ ] **Debug route handler pakai file logging, bukan console.** WebServer Playwright tidak selalu print `console.log` server ke terminal. Kalau perlu trace, tulis ke file: `appendFileSync("e2e-debug.log", ...)`; baca setelah run. Hapus debug log setelah root cause ketemu.
- [ ] **Cek response API route, bukan cuma UI.** Kalau test checkout, verifikasi juga response `/api/midtrans/create-token` (status, `orderId`, `token`) — jangan cuma assert redirect terjadi.
- [ ] **File upload test pakai fixture kecil** di `e2e/fixtures/` (PNG/PDF < 1MB) — jangan upload file besar.
- [ ] **Midtrans sandbox only** — intercept/mock Snap popup atau pakai sandbox credentials; JANGAN submit pembayaran real.
- [ ] **WhatsApp CTA** — assert `href` mengarah ke `wa.me/6281299435019` dengan message yang benar (cek `src/lib/wa.ts`), bukan membuka WhatsApp beneran.
- [ ] Tidak ada `waitForTimeout()`; gunakan assertion/response/network wait.
- [ ] Tidak ada `test.describe.configure({ mode: "serial" })` tanpa komentar alasan.
- [ ] **Mobile viewport check** — minimal satu spec per flow jalan di `devices["Pixel 7"]` atau viewport 375px, karena mayoritas traffic UMKM dari mobile.
