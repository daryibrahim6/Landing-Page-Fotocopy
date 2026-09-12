# APPENDIX: CROSS-FLOW & MAINTENANCE

> **Ini bukan track biasa — ini Appendix Maintenance.** Kumpulan tugas periodik untuk maintenance, discovery, dan re-orientasi.
> Jalanin setelah semua flow selesai Track A/B/C, atau saat ada update rules yang signifikan.

Bukan alur per-flow — ini buat mastiin nggak ada yang kelewat secara keseluruhan project, dan buat nyamain flow lama ke standar terbaru.

---

## Discovery Check — Pastikan Tidak Ada Flow yang Kelewat Sama Sekali

Jalankan ini SEKALI, setelah kelihatan semua flow yang direncanakan sudah dikerjakan, untuk memastikan tidak ada flow yang sama sekali belum ada auditnya.

```
Analisis ulang seluruh codebase project ini. Bandingkan dengan daftar
flow yang sudah ada di reports/audit/ (list semua file yang ada di
folder itu). Cari apakah ada critical path/flow lain yang SAMA SEKALI
belum punya audit — termasuk area yang "cuma tersentuh flow lain tapi
tidak punya audit sendiri" (contoh potensial di BisaPrint: upload-file,
midtrans-webhook, tracking/analytics, seo-metadata — sesuaikan dengan
temuan yang pernah ada).

Untuk setiap flow yang ditemukan belum punya audit sama sekali,
list dan urutkan berdasarkan kritikalitas. JANGAN mulai audit apapun
dulu — laporkan dulu, saya yang putuskan urutan pengerjaan berikutnya.
```

## Delta Re-Verification — Untuk Flow Lama yang Belum Kena Rules Versi Terbaru

**Kapan dipakai:** kalau rules/EXECUTION_GUIDE diupdate dengan konsep baru (kelas blind spot baru, standar assertion, security checklist, dll) SETELAH suatu flow sudah selesai diaudit/ditest dengan versi lama — flow itu perlu di-delta-check, BUKAN diulang dari Tahap 1 dari nol (audit/skenario/test code lama tetap valid untuk apa yang mereka cover, cuma perlu diperiksa terhadap konsep yang belum ada saat itu dikerjakan).

**Ini beda dari Prompt Verifikasi Final biasa** — Verifikasi Final itu re-run test dan cross-flow regression, TAPI tidak otomatis cross-check audit lama terhadap konsep BARU yang lahir belakangan (5+1 Kelas Blind Spot, Security Checklist, Standar Kekuatan Assertion). Delta Re-Verification ini yang eksplisit melakukan itu.

```
Flow [NAMA_FLOW] sudah selesai diaudit/ditest sebelumnya, tapi
menggunakan versi .devin/rules/qa-qc-workflow-and-status-tracking.md
yang lebih lama — beberapa konsep berikut belum ada saat itu
dikerjakan: [sebutkan konsep baru yang relevan, misal: 5+1 Kelas
Blind Spot Testing, Security Checklist (authorization boundary +
input validation finansial), Standar Kekuatan Assertion, Cross-Flow
Regression Check].

Tolong lakukan DELTA RE-VERIFICATION (bukan audit ulang dari nol):

1. Baca ulang reports/audit/[NAMA_FLOW].md yang sudah ada. Untuk
   SETIAP konsep baru yang disebutkan di atas, cross-check apakah
   sudah ter-cover di audit lama itu atau belum. Kalau belum,
   tambahkan sebagai temuan baru (format sama seperti biasa: bukti,
   risiko, opsi solusi) — JANGAN tulis ulang audit yang sudah ada,
   cukup TAMBAHKAN yang kurang.

2. Review (BUKAN tulis ulang dari nol) test code yang sudah ada di
   e2e/[NAMA_FLOW]/ terhadap Standar Kekuatan Assertion — cek 7 pola
   lemah yang mungkin ada di assertion lama yang ditulis sebelum
   standar ini ada. Kalau ketemu assertion lemah, catat dan perbaiki
   assertion-nya saja (bukan tulis ulang seluruh test).

2B. **Cek juga apakah flow ini sudah pernah di-UX Walkthrough (Track C)
   atau belum** — buka reports/status.md, cek kolom "Track C"
   untuk flow ini. Kalau belum ada/kosong, itu juga bagian dari delta
   yang perlu dikerjakan — beritahu saya, itu perlu masuk antrian
   Tahap UX-1 (Audit) terpisah, TIDAK usah dikerjakan otomatis di
   dalam delta-check ini (beda alur, beda urutan prioritas).

3. Setelah langkah 1-2 selesai dan gap (kalau ada) sudah difix,
   jalankan Prompt Verifikasi Final yang biasa (coverage completeness,
   cross-flow regression, mutation testing sampling, dst) seperti
   flow lainnya.

4. Laporkan: apa saja yang ditambahkan/diperbaiki dari delta-check
   ini, dan apakah flow ini sekarang genuinely setara levelnya dengan
   flow yang sudah dikerjakan pakai rules versi terbaru.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI? (termasuk: apakah ada audit/test
code yang ditulis ulang dari nol padahal seharusnya cuma ditambahkan
deltanya?): [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

**Catatan biaya:** ini tetap butuh effort per flow (bukan gratis), tapi jauh lebih murah daripada restart Tahap 1-4 dari nol, karena audit/skenario/test code yang sudah ada TETAP DIPAKAI, cuma diperiksa dan ditambal bagian yang kurang.


## Kalau Lo Lupa Lagi Posisi Terakhir

Prompt ini yang dipakai buat "orientasi ulang" tiap kali lo buka sesi baru dan lupa terakhir ngapain:

```
Baca reports/status.md sekarang. Kasih tau gue:
1. Flow mana yang statusnya IN PROGRESS, dan tahap terakhir apa yang
   sudah selesai untuk flow itu (audit/scenario/test)
2. Tahap berikutnya apa yang harus dikerjakan untuk flow itu
3. Flow apa saja yang masih BELUM MULAI, urutkan dari prioritas
   tertinggi
```

## Cara Lo Baca Bagian "Self-Report Checkpoint" (Wajib Dilakukan, Bukan Dilewatin)

Tiap laporan Devin masuk, JANGAN langsung scroll ke kesimpulan. Cari dulu 4 baris ini di akhir:

```
INSTRUKSI YANG DIMINTA: ...
YANG SAYA LAKUKAN: ...
ADA PENYIMPANGAN DARI INSTRUKSI?: ...
LANGKAH SELANJUTNYA: ...
```

- Kalau **"Ya, jelaskan..."** di bagian penyimpangan → itu OTOMATIS jadi hal pertama yang lo respons, sebelum lo approve/lanjut ke tahap berikutnya. Baca alasannya, putuskan apa itu penyimpangan yang bisa diterima atau harus di-revert.
- Kalau **"Tidak"** tapi pas lo baca "YANG SAYA LAKUKAN" itu kedengeran lebih luas dari "INSTRUKSI YANG DIMINTA" — itu tanda Devin sendiri nggak sadar dia menyimpang. Tanya balik eksplisit, jangan percaya declare "Tidak"-nya mentah-mentah.
- **"LANGKAH SELANJUTNYA" itu yang lo ikutin buat tau harus ngapain** — kalau di situ bilang "lanjut langsung", lo tinggal copy prompt tahap berikutnya dari guide ini. Kalau bilang "perlu review/putuskan dulu", BACA dulu apa yang perlu diputuskan sebelum lanjut — jangan skip bagian ini cuma karena pengen cepat lanjut.
- Kalau bagian ini **nggak ada sama sekali** di jawaban (Devin lupa/skip salah satu dari 4 baris ini) — itu sendiri red flag. Minta dia isi ulang sebelum lo lanjut approve apapun.

## Urutan Prioritas Flow (Rujukan Cepat)

1. `checkout-flow` — paling berisiko finansial (Midtrans payment)
2. `design-simulator-flow` — imposition math, output produksi
3. `whatsapp-notification-flow` — notifikasi order ke admin
4. `landing-page-flow` — konversi utama
5. `production-dashboard-flow` — backlog (belum ada, ops internal)

---

## 🚀 Production Readiness (Cross-Cutting / Appendix)

Production readiness adalah checklist yang TIDAK per-flow, tapi cross-cutting — dijalankan setelah semua flow Track A/B/C selesai, atau saat mendekati deploy. Mindset: "Senior DevOps Engineer, 100 tahun pengalaman" — bukan cuma "app jalan", tapi "app survive kalau banyak user pakai bersamaan, kalau service eksternal mati di tengah transaksi, kalau ada celah keamanan."

---

### D-1: Multi-Step Failure Test (Vitest, no new tools)

**Tujuan:** Verifikasi proses multi-step tidak meninggalkan state "setengah jadi" saat error di tengah jalan.

**Kapan:** Setelah Track A flow selesai untuk endpoint multi-step (`/api/midtrans/create-token`, `/api/midtrans/webhook`, `/api/upload`).

**Prompt eksekusi:**
```
Untuk SETIAP endpoint/function dengan ≥2 operasi berurutan yang punya
side effect (buat order → simpan storage → panggil Midtrans;
verifikasi signature → update order → notifikasi):
1. Identifikasi semua endpoint multi-step di flow ini
2. Untuk setiap endpoint, tulis test Vitest yang:
   - Mock salah satu step untuk throw error
   - Verify endpoint return error yang benar (tidak hang/crash)
   - Verify operasi SETELAH error point TIDAK dijalankan
   - Verify state akhir tidak "setengah jadi" (order tanpa token,
     file terupload tapi order tidak tercatat, dll)
3. Run tests, confirm PASS
4. Update reports/audit/[flow].md dengan section "Multi-Step Failure Tests"
```

### D-2: Idempotency Test (Vitest, no new tools)

**Tujuan:** Verifikasi concurrent/duplicate request hanya diproses sekali.

**Kapan:** Setelah Track A flow selesai untuk endpoint yang bisa dipanggil concurrent/duplikat (webhook Midtrans — Midtrans bisa kirim callback duplikat; create-token — user double-click bayar).

**Prompt eksekusi:**
```
Untuk SETIAP endpoint yang bisa dipanggil concurrent/duplikat:
1. Identifikasi semua endpoint dengan risiko duplikasi
   (webhook, create-token, upload)
2. Untuk setiap endpoint, tulis test Vitest yang:
   - Simulate duplicate call (sequential await 2x, atau Promise.all())
   - Verify side effect tidak terduplikasi (notifikasi WA admin
     tidak terkirim 2x, order tidak tercreate 2x)
3. Untuk webhook: test duplicate callback dengan signature sama →
   hanya proses sekali
4. Run tests, confirm PASS
5. Update reports/audit/[flow].md dengan section "Idempotency Tests"
```

### D-3: Security Scan (npm audit + eslint-plugin-security)

**Tujuan:** Catch vulnerability di dependency tree dan security anti-patterns di code.

**Prompt eksekusi:**
```
1. Install eslint-plugin-security: npm i -D eslint-plugin-security
2. Add "security" to eslint plugins array in eslint.config
3. Run: npm audit — catat semua vulnerability (critical/high/moderate)
4. Run: npm run lint — catat semua security-related warnings
5. Fix critical/high vulnerabilities (npm audit fix atau update package)
6. Catat hasil di reports/cross-audits/security-scan.md
```

### D-4: Deployment QA Checklist

**Sebelum setiap deploy ke Vercel (preview maupun production):**

```
□ npx tsc --noEmit — 0 errors
□ npm run test (Vitest) — semua pass
□ npx playwright test — semua pass (kalau E2E sudah ada dan ada perubahan UI/route)
□ npm run build — success
□ npm audit — tidak ada critical/high vulnerability unfixed
□ Environment variables di Vercel sudah set (MIDTRANS_SERVER_KEY,
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN, BLOB_READ_WRITE_TOKEN, META_PIXEL_ID,
  GOOGLE_ANALYTICS_ID — sesuai .env.local.example)
□ Payment gateway mode: SANDBOX untuk testing (MIDTRANS_IS_PRODUCTION=false),
  PRODUCTION kalau sudah go-live
□ Webhook URL Midtrans sudah pointing ke domain yang benar
□ SSL/HTTPS aktif (otomatis di Vercel)
□ Test smoke manual: landing → pilih produk → checkout → bayar (sandbox) →
  halaman sukses → admin terima notifikasi
```

### D-5: StrykerJS Mutation Testing — VB-3 Guidance

**Interpretasi hasil StrykerJS untuk project dengan mock-heavy strategy:**

StrykerJS mutate source code baris-per-baris, lalu re-run test. Kalau test masih PASS setelah mutation → mutation "survived" (test tidak catch perubahan itu).

**Known false positive di project ini:**
- **External-client mutations** — StrykerJS ubah argumen pemanggilan Upstash/Blob/Midtrans, tapi karena client di-mock, test tidak peduli isi argumen. Ini BUKAN gap test — ini limitation dari mocking strategy. Mock verify business logic (status mapping, validasi, notifikasi), bukan isi request ke service eksternal.
- **Logger/console mutations** — StrykerJS ubah log message string, tapi console di-mock dan tidak di-assert. Logger adalah observability tool, bukan business logic. Survived logger mutations = acceptable.
- **Error message string mutations** — StrykerJS ubah `"Order tidak ditemukan"` jadi `""`. Test check status code/`success: false` tapi tidak check exact error message. Acceptable untuk non-user-facing errors.

**Yang WAJIB killed (tidak acceptable kalau survived):**
- Status value mutations (`pending`→`paid`, `settlement`→`expire` mapping di webhook)
- Conditional logic mutations (if signature valid → if true)
- Calculation mutations (harga, imposition math `paper-sizes.ts`, gap/mm calculations)
- Signature verification mutations (SHA-512 check di webhook)

**Threshold interpretation:**
- Mutation score < threshold untuk business logic mutations = **REAL GAP** → test perlu diperbaiki
- Mutation score < threshold karena mock-related false positives = **KNOWN LIMITATION** → catat di audit file, tetap VERIFIED dengan catatan
- Untuk file yang di-mock 100% (misal client Upstash di route test), mutation score akan sangat rendah karena StrykerJS tidak bisa reach code yang di-mock. Gunakan `--mutate` pada file yang di-test directly, bukan yang di-mock.

**Command:**
```bash
npx stryker run --mutate [file]
```
