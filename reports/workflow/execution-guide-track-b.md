# TRACK B: VITEST DEEP DIVE

> **Track ini opsional / dipicu dari Track A.** Jangan dijalankan untuk setiap flow. Buka panduan ini kalau Track Gate memutuskan "butuh Track B" atau lu lihat test shallow / mutation lemah di flow tersebut.

Alur ini untuk mengaudit KUALITAS TEST ITU SENDIRI — bukan "apakah sistem jalan" (itu Track A), tapi "apakah test ini benar-benar valuable, atau cuma noise yang memberikan false sense of security?". Test yang gaguna lebih berbahaya dari tidak ada test, karena membuat tim berpikir sudah aman padahal tidak.

**Mindset wajib Track B (Senior Test Engineer, 100 tahun pengalaman):** Bukan cuma "test pass" — tapi "apakah test ini benar-benar membuktikan klaimnya, atau cuma memberikan illusion of safety?" Seorang test engineer senior tidak cuma ngecek apakah test ada dan pass. Dia mikir: "kalau saya mengubah satu baris logic di function ini, apakah test ini akan FAIL? Kalau tidak, test ini tidak catch bug — test ini cuma noise yang membuat tim merasa aman padahal tidak." Setiap test file harus punya JUSTIFIKASI EKSPLISIT kenapa dia ada, dan apa yang akan FAIL kalau behavior benar-benar break.

**Prinsip tambahan untuk Senior Test Engineer:**
- **Test yang tidak catch bug adalah liability, bukan asset.** Test yang selalu PASS bahkan saat code rusak lebih berbahaya dari tidak ada test, karena menciptakan false confidence. Hapus atau rewrite test yang tidak valuable.
- **Coverage percentage adalah vanity metric.** 100% coverage dengan shallow assertion = 0% confidence. Yang penting adalah mutation score — berapa persen mutation yang tertangkap, bukan berapa persen line yang dieksekusi.
- **Test harus isolated dan deterministic.** Test yang depend on test order, shared state, atau timing = test yang akan flaky. Flaky test mengurangi kepercayaan terhadap seluruh test suite.
- **Jangan test implementation detail yang tidak matter.** Test yang ngecek "function dipanggil 3 kali" bukan test behavior — itu test implementation. Kalau implementation berubah tapi behavior sama, test harus tetap PASS.
- **Setiap test harus punya satu alasan untuk FAIL.** Test yang bisa FAIL karena banyak alasan sekaligus = test yang susah di-debug saat fail. One test, one assertion focus.

**Referensi wajib sebelum mulai:**
- Kent C. Dodds — "Write tests. Not too many. Mostly integration."
- Martin Fowler — Test Pyramid (unit vs integration vs E2E ratio)
- IEEE 829 — Test documentation standard
- `.devin/rules/qa-qc-workflow-and-status-tracking.md` section "Vitest Quality Audit"

---

## VB-0 — Vitest Sweep (One-Time, Seluruh Project)

Jalankan SEKALI untuk seluruh project, SEBELUM VB-1 per-flow. Tujuan: identifikasi semua vitest file yang gaguna, stub, shallow, outdated, atau missing — DENGAN tag criticality, risk score, tier, execution time, dan 9 health indicators.

```
Sebelum mulai, WAJIB baca section "Vitest Quality Audit" di
.devin/rules/qa-qc-workflow-and-status-tracking.md.

Lakukan Vitest Quality Sweep untuk seluruh project BisaPrint:

1. INVENTARISASI SEMUA VITEST FILE — list semua *.test.ts, *.test.tsx,
   *.spec.ts di seluruh project (src/, root).

2. UNTUK SETIAP FILE, klasifikasikan ke salah satu kategori:
   - ✅ VALUABLE — test yang ngetest business logic penting dengan
     assertion yang bermakna (bukan cuma happy path)
   - ⚠️ SHALLOW — test yang ada tapi assertion-nya dangkal (happy path
     only, trivial assertion, tidak test edge case)
   - ❌ USELESS — stub/dummy test (expect(true).toBe(true)), test yang
     ngetest hal trivial (getter/setter tanpa logic), test yang tidak
     ngetest apapun
   - 🗑️ OUTDATED — test yang ngetest function yang udah gak dipakai,
     udah berubah behavior, atau import path yang broken
   - 📝 MISSING — feature penting yang TIDAK punya vitest sama sekali
     (grep function name → cek apakah ada test file yang ngetest itu)

3. TAG CRITICALITY untuk setiap file (WAJIB):
   - CRITICAL: payment (Midtrans), order storage, pricing calc (bug = uang hilang / order salah)
   - HIGH: upload file, notifikasi WA admin (bug = order tanpa file / admin tidak tahu)
   - MEDIUM: simulator imposition math, tracking (bug = hasil export salah)
   - LOW: utility, formatting, display helper
   Priority matrix: Criticality × Test Quality. Critical + Shallow = fix pertama.

4. UNTUK SETIAP KATEGORI (⚠️/❌/🗑️/📝), tulis:
   - File path
   - Kategori + Criticality
   - Masalah spesifik (apa yang shallow/useless/outdated/missing)
   - Risk: dampak kalau test ini dipertahankan apa adanya
   - Rekomendasi: hapus / rewrite / tambah edge case / pindah ke E2E
   - Effort: kecil / sedang / besar

5. KHUSUS UNTUK 📝 MISSING — identifikasi function/logic penting yang
   tidak punya vitest:
   - grep semua export function di src/lib/ (pricing, midtrans,
     order-storage, paper-sizes, wa) → cek apakah ada test file yang
     ngetest function itu
   - grep semua utility function di src/lib/utils.ts → cek apakah ada test file
   - grep semua schema validation (Zod) → cek apakah ada test file
   - grep semua API route handler → cek apakah ada test file

6. KHUSUS UNTUK ⚠️ SHALLOW — untuk setiap file shallow, cek 12 KATEGORI
   GAP (bukan cuma 6):
   1. Stub & Dummy Test
   2. Shallow Assertion
   3. Missing Edge Case
   4. Outdated Test
   5. Coverage Gap
   6. Duplikasi dengan E2E
   7. Over-Mocked Test (mock setiap collaborator, cuma assert mock dipanggil)
   8. Test Order Dependency (pass berurutan, fail acak)
   9. Shared State Leakage (modify global state tanpa cleanup)
   10. Assertion-Free Test (exercise code tanpa assertion bermakna)
   11. Magic Numbers in Assertions (literal value tanpa penjelasan)
   12. Test Logic in Production Code (NODE_ENV === 'test' branch di production)

7. CATAT EXECUTION TIME per file (WAJIB):
   - Jalankan `npx vitest run --reporter=verbose` dan catat waktu per file
   - File dengan >5s execution = candidate untuk optimize
   - Total suite time = baseline untuk tracking
   - Target: full `npx vitest run` < 60 detik

8. COVERAGE CONFIG — coverage config sudah ada di vitest.config.mts.
   Jalankan `npx vitest run --coverage` dan catat file dengan 0% coverage
   sebagai candidate 📝 MISSING.

9. TAG RISK SCORE + TIER untuk setiap file (WAJIB):
   - Risk Score = Impact × max(Technical, Historical)
   - Impact: 1-5 (how badly failure affects users/revenue)
   - Technical: 1-5 (complexity, dependencies, code churn)
   - Historical: 1-5 (past defect frequency)
   - Tier: T1 (score 15-25, every PR), T2 (8-14, nightly), T3 (1-7, weekly)
   - Risk matrix untuk BisaPrint sudah di rules file sebagai baseline

10. CEK NEXT.JS APP ROUTER BOUNDARY COMPLIANCE:
    - Async Server Components (pakai await) TIDAK BOLEH di-test dengan Vitest
      → harus Playwright E2E
    - Sync Server Components dan Client Components OK dengan Vitest + RTL
    - Server Actions: cek apakah punya 4-scenario test matrix
      (anonymous, invalid input, wrong owner/IDOR, admin override)
    - Route Handlers: cek apakah di-test dengan Vitest direct invocation

11. CATAT 9 TEST SUITE HEALTH INDICATORS (I0-I8):
    - I0 Flakiness, I1 Low Coverage, I2 Pseudo-Testedness,
      I3 Low Mutation Score, I4 Long-Running, I5 Low Test Diversity,
      I6 High Brittleness, I7 Low Realism, I8 High Variability
    - Catat trade-off yang relevant per file
      (misal: high mocking = low realism, few assertions = high pseudo-testedness)

Simpan hasil ke reports/cross-audits/vitest-quality-sweep.md dengan format:
- Header: tanggal, scope, jumlah file diaudit, total execution time
- Summary table: jumlah file per kategori (✅/⚠️/❌/🗑️/📝) + per criticality + per tier
- Detail per file dengan klasifikasi, criticality, risk score, tier, execution time, health indicators, dan rekomendasi
- Next.js boundary compliance: file yang violate boundary (async RSC di-test dengan Vitest)
- Server Action test matrix: protected actions yang tidak punya 4-scenario coverage
- Priority list: file mana yang harus dikerjakan dulu (Tier × Quality matrix)
- Coverage summary: file dengan 0% coverage
- 9 Health Indicators summary: status per indikator + trade-off yang teridentifikasi

Update reports/status.md — tambahkan baris "Vitest Quality Sweep (VB-0)"
dengan status sesuai.

JANGAN fix apapun di tahap ini — murni scan dan lapor.
Setelah lapor, saya yang putuskan file mana yang dieksekusi dulu.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

## VB-1 — Vitest Deep Dive (Per-Flow)

Setelah VB-0 selesai dan file-file prioritas sudah diidentifikasi, lakukan deep dive per-flow. Ini BUKAN sekadar "cek apakah test pass" — itu kerjaan Track A. Ini audit KUALITAS test.

```
Kerjain VB-1 (Vitest Deep Dive) untuk flow [NAMA_FLOW], sesuai
.devin/rules/qa-qc-workflow-and-status-tracking.md section "Vitest
Quality Audit".

Fokus ke vitest file yang terkait dengan flow ini (berdasarkan
hasil VB-0, prioritas: Tier × Quality matrix). Untuk SETIAP file:

1. BACA TEST CODE dan FUNCTION UNDER TEST secara berdampingan.
   Pertanyaan wajib:
   - Apakah test ngetest behavior yang penting, atau hal trivial?
   - Apakah assertion cukup dalam (cek value spesifik) atau dangkal
     (cek "tidak error" / "ada return")?
   - Apakah edge case ter-cover? (empty, null, boundary, special char)
   - Apakah error case ter-cover? (input invalid, API gagal, race)
   - Apakah test ini akan FAIL kalau function under test break? Kalau
     tidak, test itu tidak valuable.

2. CEK 12 KATEGORI GAP + 8 VITEST FLAKY SUB-PATTERNS:
   1-6: Stub/Dummy, Shallow Assertion, Missing Edge Case, Outdated,
        Coverage Gap, Duplikasi E2E
   7. Over-Mocked Test — mock setiap collaborator, cuma assert mock
      dipanggil, tidak assert observable outcomes
   8. Test Order Dependency — pass berurutan, fail kalau run acak
      8a. Thread-pool state leakage (module-scope mutable state survive)
      8b. isolate:false module cache (top-level side effects survive)
      8c. globals:true config drift (setup file disagree dengan config)
      8d. Watch vs CI cache divergence (pass di watch, fail di CI)
   9. Shared State Leakage — modify global state tanpa cleanup
      9a. vi.mock() hoisting traps (factory closure reference issue)
      9b. Snapshot races in test.concurrent
      9c. Fake-timer leakage (vi.useFakeTimers tidak auto-restore)
      9d. Retry config hiding bugs (retry:2 hide flaky tests)
   10. Assertion-Free Test — exercise code tanpa assertion bermakna
   11. Magic Numbers — literal value tanpa penjelasan kenapa angka itu
   12. Test Logic in Production — NODE_ENV === 'test' branch di prod code

3. JALANKAN MUTATION TESTING — untuk 2-3 test file paling penting di
   flow ini (prioritas: CRITICAL criticality):
   - Manual: ubah function under test (break behavior), jalankan test.
     Kalau test masih PASS → test tidak catch bug → tidak valuable.
     Catat mutation yang di-test: "Mutation: changed > to >= at line X,
     test Y FAILED — killed" atau "test still PASS — survived".
   - StrykerJS (kalau terinstall): `npx stryker run --mutate [file]`
     dengan target mutation score sesuai criticality:
     CRITICAL ≥80%, HIGH ≥70%, MEDIUM ≥60%, LOW ≥50%

4. CEK TEST MAINTAINABILITY (WAJIB, terpisah dari value):
   - Brittle assertions: test implementation detail yang bisa berubah
     tanpa behavior berubah?
   - Excessive setup: test butuh >20 baris setup untuk 1 assertion?
   - Test duplication: same setup di-repeat tanpa shared fixtures?
   - Snapshot abuse: toMatchSnapshot() untuk object kompleks yang
     tidak dibaca manusia?
   Test bisa valuable tapi unmaintainable = tetap temuan.

5. CEK DUPLICASI — apakah ada test yang ngetest hal yang sama dengan
   E2E? Kalau ya, apakah vitest version memberikan value tambahan
   (lebih cepat, lebih presisi assertion)? Kalau tidak, tandai sebagai
   kandidat untuk dihapus atau disederhanakan.

6. CEK COVERAGE GAP — function penting di flow ini yang tidak punya
   vitest sama sekali. Catat sebagai temuan 📝 MISSING.

7. CEK INTEGRATION TEST GAP — component/hook di flow ini yang punya
   complex state interaction tapi tidak punya integration test (Vitest
   + Testing Library)? Catat sebagai temuan jika:
   - Component dengan form validation rendering complex
   - Hook dengan async logic (upload state, fetch order status)
   - API route handler yang bisa di-test dengan mocked Upstash/Blob/Midtrans

8. CEK NEXT.JS APP ROUTER BOUNDARY COMPLIANCE:
   - Async Server Components (pakai await) TIDAK BOLEH di-test dengan
     Vitest → harus Playwright E2E. Kalau ada yang violate, tandai.
   - Server Actions: cek apakah punya 4-scenario test matrix
     (anonymous, invalid input, wrong owner/IDOR, admin override)
   - Route Handlers: cek apakah di-test dengan Vitest direct invocation

9. CEK 9 HEALTH INDICATORS + TRADE-OFF untuk file ini:
   - I2 Pseudo-Testedness: code di-execute tapi bisa dihapus tanpa FAIL?
   - I5 Low Test Diversity: test menjalankan path yang sama berulang?
   - I7 Low Realism: mock terlalu banyak, tidak realistis?
   - I8 High Variability: indikator health berubah antar run?
   - Trade-off: apakah optimizing 1 dimensi degrade dimensi lain?

Simpan hasil ke reports/audit/[NAMA_FLOW].md sebagai section terpisah
"Vitest Quality Audit Findings", masing-masing dengan status OPEN.
Format per temuan:
- File path + criticality tag + risk score + tier
- Kategori gap (1-12 + sub-pattern 8a-8d, 9a-9d)
- Masalah spesifik
- Maintainability issue (kalau ada)
- Health indicator issue (I2/I5/I7/I8 + trade-off, kalau ada)
- Next.js boundary violation (kalau ada)
- Server Action test matrix gap (kalau ada)
- Risk + Rekomendasi + Effort
- Mutation testing result (kalau dijalankan)

Update reports/status.md — tambahkan/update kolom "Track B"
untuk flow ini.

JANGAN fix apapun di tahap ini — murni audit.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

## VB-2 — Fix Vitest Quality (Per-Flow)

```
Fix temuan Vitest Quality Audit berikut dari section "Vitest Quality
Audit Findings" di reports/audit/[NAMA_FLOW].md yang sudah gue approve:
[list temuan yang mau difix]

Sebelum mulai, deklarasikan blast radius dan pastikan git safety net
(working tree bersih) sesuai Tahap 2.

Jenis fix yang mungkin:
- HAPUS test file yang useless/outdated (🗑️)
- REWRITE test yang shallow menjadi deep (⚠️ → ✅)
- TAMBAH test untuk function yang missing (📝)
- TAMBAH integration test untuk component/hook dengan complex state (📝)
- SEDERHANAKAN test yang duplicative dengan E2E
- PERBAIKI assertion yang tidak catch bug (berdasarkan mutation testing)
- PERBAIKI test maintainability: extract shared fixtures, reduce setup,
  replace snapshot dengan explicit assertion, hapus brittle assertion
- PERBAIKI test isolation: tambah cleanup di afterEach/afterAll,
  hapus test order dependency, hapus shared state leakage

Untuk setiap fix, VERIFIKASI dulu kondisi aktualnya — baca test code
DAN function under test untuk konfirmasi temuan benar.

Setelah fix, jalankan vitest untuk file yang diubah — confirm masih
PASS (atau expected FAIL kalau memang test baru yang belum diimplementasi).

Update status temuan di reports/audit/[NAMA_FLOW].md dari OPEN jadi
FIXED.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

## VB-3 — Verify Vitest Quality Fix

```
Verifikasi final untuk semua temuan Vitest Quality Audit flow
[NAMA_FLOW] yang sudah di-fix (status FIXED).

Untuk SETIAP temuan:
1. Jalankan test file yang diubah — confirm PASS (atau expected behavior).
2. Jalankan mutation testing verification:
   - StrykerJS (kalau terinstall): `npx stryker run --mutate [file]`
     Confirm mutation score ≥ target criticality:
     CRITICAL ≥80%, HIGH ≥70%, MEDIUM ≥60%, LOW ≥50%
   - Manual: ubah function under test (break behavior), confirm test
     FAIL. Dokumentasikan mutation yang di-test:
     "Mutation: [deskripsi], test [nama] FAILED — killed"
     Kalau masih PASS, test masih tidak valuable → tetap OPEN.
3. Cek tidak ada regression di test file lain yang depend on file ini.
4. Cek tidak ada import path broken atau type error.
5. Cek test isolation: jalankan dengan `--shuffle` (kalau ada), confirm
   tidak ada flaky failure dari test order dependency.
6. Catat execution time per file setelah fix — compare dengan baseline
   VB-0. Kalau fix membuat file >2x lebih lambat, flag untuk review.
7. CEK NEXT.JS BOUNDARY COMPLIANCE: confirm tidak ada async RSC yang
   di-test dengan Vitest. Server Actions yang di-fix sudah punya
   4-scenario test matrix (anonymous, invalid, IDOR, admin).
8. CEK 9 HEALTH INDICATORS POST-FIX: apakah fix meningkatkan 1
   indikator TAPI menurunkan indikator lain (trade-off)?
   Misal: tambah assertions untuk kill mutation → cek apakah
   assertions itu brittle (I6) atau menambah flakiness (I0).

Update status temuan di reports/audit/[NAMA_FLOW].md dari FIXED jadi
VERIFIED (atau tetap OPEN kalau ternyata belum benar-benar teratasi).

Update reports/status.md kolom "Track B" untuk flow ini jadi
"Done" HANYA kalau semua temuan sudah VERIFIED.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
LANGKAH SELANJUTNYA: [...]
```

---
