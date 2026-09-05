# Rules: QA Audit, QC Testing & Status Tracking Workflow

Rules ini berlaku always-on untuk semua task yang berhubungan dengan business gap analysis, penulisan test scenario, dan eksekusi testing di project ini.

## Definisi Istilah (Wajib Dipahami Sebelum Kerja)

- **QA (Quality Assurance)** = proses pencegahan. Analisis kode mendalam untuk menemukan flow/fitur yang BELUM ada atau belum lengkap (business gap), sebelum ditest. Contoh: "sistem tidak punya flow refund padahal ada skenario dimana itu dibutuhkan" → ini temuan QA.
- **QC (Quality Control)** = verifikasi hasil jadi. Menulis skenario test dan menjalankannya untuk memastikan flow yang SUDAH ada berjalan benar sesuai spesifikasi. Ini baru dilakukan SETELAH gap dari QA sudah diputuskan/di-fix.

**JANGAN PERNAH mencampur kedua mode ini dalam satu batch kerja.** Audit gap analysis dan test execution adalah dua task terpisah dengan tujuan berbeda — mencampurnya menyebabkan hasil dangkal di keduanya.

## Struktur Folder Wajib

Semua report harus disimpan dengan struktur berikut, TIDAK BOLEH digabung jadi satu file besar:

```
reports/
├── readme.md                    ← penjelasan struktur reports/
├── status.md                    ← single source of truth, selalu up to date
├── master-reference.md          ← index rules, flow, file patokan
├── workflow/                    ← execution guides: Track A, E2E, Track B/C, Appendix
├── audit/
│   └── [nama-flow].md           ← satu file per flow/critical path
├── cross-audits/                ← audit lintas-flow / cross-cutting
├── page-audits/                 ← audit UI/UX per halaman spesifik
├── test-scenarios/
│   └── [nama-flow].md           ← satu file per flow, skenario test detail
├── test-results/
│   └── [nama-flow].md           ← satu file per flow, hasil eksekusi test
├── coverage/                    ← laporan pure-logic coverage per flow
├── psychotest/                  ← dokumen khusus fitur psychotest
├── screenshots/                 ← evidence UI/UX manual (gitignored)
│   └── [nama-flow]/
│       └── {before|after|state}-{deskripsi}-{viewport}-{tanggal}.png
├── mutation/                    ← output mutation testing (gitignored)
└── archive/                     ← riwayat lama / distributed flow yang tidak aktif
```

**Soal folder `screenshots/` — WAJIB dibedakan dari baseline Playwright:**
- **Baseline regression** (`toHaveScreenshot()`, Kelas Blind Spot ke-6) — itu dikelola OTOMATIS oleh Playwright di lokasi default bawaannya. JANGAN dipindah/dipaksa masuk `reports/screenshots/` — itu bisa merusak mekanisme compare otomatis Playwright.
- **Screenshot manual/evidence** (diambil lewat MCP Playwright `browser_take_screenshot` saat audit/verifikasi, sebagai bukti temuan UI Kategori A/B) — INI yang WAJIB disimpan ke `reports/screenshots/[nama-flow]/`, dengan nama file mengikuti **Konvensi Penamaan Screenshot** di bawah. WAJIB direferensikan nama filenya di laporan audit/test-result yang bersangkutan — bukan cuma dideskripsikan dalam teks tanpa bukti visual yang bisa dicek ulang.

**Konvensi Penamaan Screenshot (WAJIB, tidak boleh variasi):**

Format kanonik:
```
{phase}-{deskripsi-singkat}-{viewport}-{tanggal}.png
```

Aturan setiap segment:
- **{phase}** — WAJIB salah satu dari: `before` (sebelum fix), `after` (sesudah fix), `state` (screenshot kondisi umum, bukan before/after). JANGAN pakai prefix lain (`uxw-`, nomor urut, dll).
- **{deskripsi-singkat}** — WAJIB, kebab-case, deskriptif dan spesifik. JANGAN sertakan nama flow (folder sudah menunjukkan flow-nya). Contoh: `checkout-payment-methods`, `notif-dropdown-kepotong`, `register-validation-errors`.
- **{viewport}** — WAJIB salah satu dari: `desktop` (1440px), `tablet` (768px), `mobile` (375px). TIDAK BOLEH kosong. Kalau screenshot tidak spesifik viewport (misal full-page), tetap pakai viewport terdekat.
- **{tanggal}** — WAJIB, format `YYYY-MM-DD` (ISO 8601). TIDAK BOLEH kosong.

Contoh nama file yang BENAR:
```
before-checkout-payment-methods-desktop-2026-07-31.png
after-checkout-payment-methods-mobile-2026-08-03.png
state-dashboard-empty-booking-list-tablet-2026-08-03.png
```

Contoh nama file yang SALAH (dan harus direname):
```
01-booking-url-404-desktop.png              ❌ pakai nomor, tidak ada phase, tidak ada tanggal
uxw-01-home-logged-out-navbar-desktop.png   ❌ pakai prefix uxw-, tidak ada phase, tidak ada tanggal
after-booking-cancel-dialog-2026-07-31.png  ❌ tidak ada viewport
after-register-full-page-desktop-2026-07-31.png  ❌ sertakan "register" (redundan, folder sudah auth-flow)
```

**Aturan tambahan:**
- JANGAN sertakan nama flow di filename — folder sudah menunjukkan flow-nya. `before-checkout-...` di folder `booking-lifecycle/` sudah jelas ini booking flow.
- Kalau satu temuan punya multiple screenshot (before + after di 3 viewport), semua WAJIB pakai deskripsi yang SAMA, cuma beda phase dan viewport. Contoh: `before-notif-dropdown-desktop-2026-07-31.png` + `after-notif-dropdown-mobile-2026-08-03.png`.
- File duplikat (deskripsi + viewport + tanggal sama tapi di-rename atau di-take ulang) WAJIB dihapus. Hanya simpan 1 versi.
- Kalau menemukan screenshot lama yang tidak mengikuti konvensi saat mulai audit flow, WAJIB rename ke format kanonik SEBELUM ambil screenshot baru. Lihat "Screenshot Cleanup" di `reports/workflow/execution-guide-track-c.md` (Track C).

**Kenapa ini wajib (bukan opsional):** temuan UI (Kategori A bug objektif maupun Kategori B advisory) itu klaimnya soal TAMPILAN — deskripsi teks doang ("dropdown kepotong di kanan") itu tidak bisa di-cross-check user tanpa bukti visual asli. Screenshot yang tersimpan permanen itu setara dengan "bukti dari code" yang sudah diwajibkan untuk temuan lain — versi visualnya.

Penamaan `[nama-flow]` harus konsisten di ketiga folder untuk flow yang sama (misal: `booking-flow.md`, `payment-flow.md`, `auth-flow.md`).

## reports/status.md — Single Source of Truth

`reports/status.md` adalah file WAJIB yang harus selalu mencerminkan kondisi terkini seluruh project. Format tabel terbaru:

| Flow | Tier | Scope | Audit | Fix | Vitest | E2E | Track B | Track C | Final | Last Update | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [nama flow] | Core / Supporting / Distributed | Done / Belum | Done / In Progress / Belum | Done / In Progress / Belum | Done / In Progress / Belum | Done / Pending / Belum / N/A | Done / Pending / Belum / N/A | Done / Pending / Belum / N/A | AMAN / CLEAR / IN PROGRESS / ADA ISU / BELUM | YYYY-MM-DD | link ke audit |

- **Tier**: Core (11 flow utama), Supporting (6 flow pelengkap), Distributed (6 flow yang logikanya didistribusikan ke flow lain).
- **Scope**: Tahap 0 — apakah boundary flow sudah dibekukan.
- **Audit / Fix / Vitest**: Track A.
- **E2E**: integration testing — terpisah dari Track A.
- **Track B / Track C**: optional, dipicu dari Track Gate.
- **Final**: `AMAN` (semua track yang dibutuhkan selesai), `CLEAR` (Track A selesai, track opsional belum/tidak perlu), `IN PROGRESS`, `ADA ISU` (masih ada gap), `BELUM` (belum mulai).

**Kapan tiap kolom di-update:**
- Update **Scope** setelah Tahap 0 (Scope Freeze) selesai.
- Update **Audit** setelah Tahap 1 selesai.
- Update **Fix** setelah Tahap 2 selesai / sedang berjalan.
- Update **Vitest** setelah Tahap 3 selesai.
- Update **E2E** setelah eksekusi E2E Playbook.
- Update **Track B / Track C** setelah deep dive selesai.
- Update **Final** HANYA setelah verifikasi akhir flow.
- Jangan biarkan file ini basi — kalau ragu, update lebih sering.

**Panduan eksekusi detail ada di `reports/workflow/execution-guide.md` dan panduan terkait (`reports/workflow/execution-guide-e2e-playbook.md`, `reports/workflow/execution-guide-track-b.md`, `reports/workflow/execution-guide-track-c.md`, `reports/workflow/execution-guide-appendix-maintenance.md`)."

## Kelas Blind Spot Testing yang Wajib Dicek di Setiap Audit

Ditemukan dari audit metodologi testing (28 Jul 2026): metodologi testing kita punya 5 asumsi struktural yang bikin kelas bug tertentu SELALU lolos meskipun semua test PASS. Setiap audit (Tahap 1) WAJIB eksplisit cross-check flow yang sedang diaudit terhadap 5 kelas ini, bukan cuma dari sudut pandang flow itu sendiri:

1. **Stale Reference** — apakah ada kode yang asumsikan suatu entity (user, booking, consultant) masih ada/valid, padahal bisa saja sudah dihapus/diubah statusnya di tempat lain? (Test biasanya selalu pakai data fresh yang baru dibuat, jadi referensi yang jadi stale tidak pernah ketest.)
2. **Concurrent/Race Condition** — apakah ada state transition yang bisa dipicu dua aksi bersamaan (dua user klik di waktu sama, webhook + cron jalan bersamaan), dan apakah ada guard/locking yang mencegah itu jadi rusak? (Test biasanya jalan sequential satu-satu, race condition tidak pernah ketest.)
3. **Time-Based State Transition** — apakah ada logic yang bergantung ke jeda waktu (expiry, timeout, idle session), dan apakah ada test yang benar-benar mensimulasikan waktu berlalu (bukan instant)?
4. **Partial Failure di Multi-Step Process** — kalau suatu proses multi-langkah (transaction, side effect seperti notifikasi/email) gagal DI TENGAH, apakah ada test yang verifikasi konsekuensinya? (Test biasanya cuma verify hasil akhir yang sukses, bukan kegagalan di tengah.)
5. **Cross-User Cache/State Staleness** — kalau user A mengubah sesuatu, apakah user B yang sedang online melihat perubahan itu dalam waktu wajar, atau melihat data lama karena cache/tidak ada propagasi? (Test biasanya dari sudut pandang satu user per test, tidak verify efek ke user lain yang sedang online bersamaan.)

Untuk tiap kelas di atas yang relevan dengan flow yang sedang diaudit, WAJIB dicek eksplisit dan dicatat di laporan audit — bahkan kalau kesimpulannya "tidak relevan untuk flow ini", itu tetap harus dinyatakan (bukan diam-diam dilewati).

**Penting — bedakan dua akibat temuan dari 5 kelas ini:**
- Kalau ternyata ada BUG NYATA di code (bukan cuma gap testing) — misal, state benar-benar bisa jadi salah karena race condition/stale reference — itu masuk kategori **bug prioritas tinggi**, harus di-fix SEGERA sebagai bagian dari Tahap 1/2, bukan ditunda sampai fase testing.
- Kalau code-nya sudah benar tapi memang belum pernah diverifikasi lewat test — itu masuk sebagai **gap coverage test**, ditulis sebagai skenario test tambahan di Tahap 3.

**Catatan alur — temuan ini mengalir otomatis lewat tahap normal, tapi butuh 1 checkpoint khusus di Tahap 3B:** temuan dari 5 kelas ini yang teridentifikasi di Tahap 1 otomatis jadi skenario di Tahap 3, lalu jadi test code di Tahap 3B — tidak perlu proses pengecekan ulang terpisah di tiap tahap. TAPI, khusus di Tahap 3B, ada risiko implementasi teknis dilemahkan diam-diam: skenario "race condition" gampang ditulis di markdown, tapi test code yang BENERAN menguji race condition itu butuh teknik khusus (dua browser context paralel untuk Playwright, `page.clock`/fake timer untuk time-based, mock `Date.now()` untuk Vitest) — kalau ini disederhanakan jadi test sequential biasa, test itu KELIHATAN cover kelas itu tapi SEBENARNYA TIDAK. Self-check di Tahap 3B WAJIB eksplisit verifikasi ini untuk tiap skenario yang berasal dari 5 kelas blind spot, bukan cuma cek "ada test case-nya atau tidak".

## Standar Kekuatan Assertion (WAJIB untuk SEMUA Test — E2E, Unit, Semua Kategori)

**Ini prinsip akar, ditemukan setelah kejadian: test bilang "layout tidak break" padahal layout MEMANG rusak secara visual.** Root cause-nya bukan cuma soal "kurang test visual" — itu gejala dari masalah yang lebih dalam: **tidak ada standar eksplisit soal apa yang membuat assertion itu kuat vs lemah**, jadi assertion lemah bisa muncul di kategori APAPUN (bukan cuma visual), dan test tetap "PASS" tanpa benar-benar membuktikan apa yang dijanjikan skenario.

**Pola assertion LEMAH yang WAJIB dihindari di semua test (E2E maupun unit):**

1. **Existence-only assertion** — `toBeVisible()`, `toBeInTheDocument()`, `toBeTruthy()` dipakai SENDIRIAN tanpa verifikasi isi/state/nilai spesifik. Elemen "ada" tidak sama dengan elemen "benar".
2. **Selector kelewat umum/longgar** — assertion secara teknis "lolos" karena selector match elemen yang salah/banyak elemen sekaligus, bukan elemen spesifik yang dimaksud skenario. Selalu pakai selector paling spesifik yang tersedia (`data-testid`, role + name spesifik), bukan tag generic (`div`, `span`).
3. **Negative assertion menyamar jadi bukti positif** — "tidak ada error muncul" atau "tidak crash" BUKAN bukti "hasil yang benar terjadi". Assertion harus verifikasi POSITIF apa yang SEHARUSNYA terjadi, bukan cuma ketiadaan hal buruk.
4. **Assertion parsial/tidak lengkap** — skenario menjanjikan sesuatu (misal "redirect ke halaman konfirmasi dengan detail booking yang benar"), tapi assertion cuma cek SATU bagian (URL berubah) tanpa cek bagian lain yang dijanjikan (isi halaman, data yang ditampilkan). Assertion harus membuktikan SELURUH klaim skenario, bukan sebagian.
5. **Side effect tidak diverifikasi** — kalau skenario melibatkan efek di luar UI (data tersimpan di DB, notifikasi terkirim, email terkirim, cache ter-invalidate), assertion WAJIB verifikasi itu juga (query DB langsung, cek mock notification service dipanggil, dll) — bukan cuma percaya dari respons UI yang terlihat sukses.
6. **Fixed sleep/timeout menutupi masalah asli** — `waitForTimeout(3000)` dipakai untuk "nunggu" tanpa alasan jelas itu tanda ada race condition/timing issue yang disembunyikan, bukan diselesaikan. Pakai wait yang presisi (`waitFor` dengan kondisi spesifik), bukan sleep buta.
7. **Assertion visual yang sebenarnya tidak visual** — assertion terhadap DOM/teks/URL TIDAK BISA membuktikan tampilan visual benar (layout, CSS, responsive) — DOM bisa struktural benar tapi tampilannya rusak. Untuk skenario yang klaimnya soal tampilan/layout, WAJIB pakai `toHaveScreenshot()` atau verifikasi visual manual (lihat Kelas Blind Spot ke-6 di atas) — assertion DOM tidak cukup untuk klaim ini.

**Cara pakai standar ini:** Setiap kali menulis atau self-check assertion (Tahap 3B, atau saat menambah test dari Tahap 4 loop-back), tanyakan: **"Kalau assertion ini PASS, apakah itu benar-benar MEMBUKTIKAN klaim skenario, atau cuma KEBETULAN tidak gagal?"** Kalau jawabannya ragu-ragu, assertion itu kemungkinan lemah — perbaiki sampai jawabannya jelas "ya, ini benar-benar membuktikan".

## Verifikasi Objektif: Mutation Testing Ringan (Beda dari Checklist Assertion di Atas)

**Kenapa ini perlu, padahal sudah ada Standar Kekuatan Assertion:** semua checklist di atas itu Devin MENILAI SENDIRI apakah assertion-nya kuat — tapi kejadian layout break kemarin membuktikan penilaian sendiri itu BISA SALAH, walaupun sudah "mengikuti checklist". Satu-satunya cara membuktikan SECARA OBJEKTIF (bukan sekadar merasa yakin) bahwa suatu test benar-benar kuat: **sengaja RUSAKKAN behavior yang diklaim ditest, jalankan test-nya, dan pastikan test itu GAGAL.** Kalau test tetap PASS meski behavior-nya sudah sengaja dirusak, itu bukti konkret test-nya lemah — terlepas dari seberapa lengkap assertion-nya kelihatan di kode.

**Wajib dilakukan untuk:**
1. **Test yang baru ditulis untuk skenario finansial/auth/critical** (bukan semua test, terlalu mahal kalau semua — fokus ke yang risikonya tinggi).
2. **Setiap kali ditemukan kasus "test bilang aman tapi ternyata tidak"** (seperti kasus layout kemarin) — test yang gagal mendeteksi itu WAJIB diperbaiki DAN diverifikasi ulang pakai teknik ini sebelum dianggap selesai.
3. **Sampling periodik saat Verifikasi Final** — pilih 1-2 test secara acak per flow (bukan semua, cukup sampel) untuk di-mutation-test sebagai spot-check kesehatan keseluruhan test suite.

**Cara kerja (prosedur konkret):**
1. Identifikasi test yang mau diverifikasi dan behavior spesifik yang diklaim ditest-nya.
2. **Sengaja rusak** behavior itu di code (contoh: hapus sementara validasi yang seharusnya mencegah bug, comment out logic yang seharusnya jalan, atau untuk kasus layout — sengaja hapus/ubah CSS class yang bikin layout benar).
3. Jalankan test yang bersangkutan. **Test HARUS FAIL** — kalau tetap PASS, itu bukti test-nya tidak benar-benar mendeteksi apa yang diklaim.
4. **Revert perubahan sengaja-rusak tadi**, jalankan test lagi, pastikan PASS normal seperti semula.
5. Kalau di langkah 3 test ternyata TIDAK FAIL (lolos padahal behavior-nya rusak) — test itu harus ditulis ulang dengan assertion yang lebih kuat, sesuai Standar Kekuatan Assertion di atas, lalu diverifikasi ulang dengan teknik yang sama sampai benar-benar terbukti FAIL saat behavior dirusak.

**Ini bukan proses yang mahal kalau di-scope dengan benar** — bukan untuk semua test, cuma untuk yang high-risk atau yang baru terbukti pernah gagal mendeteksi sesuatu. Tapi WAJIB dilakukan untuk kategori itu, karena ini satu-satunya cara pembuktian objektif yang tidak bergantung pada penilaian subjektif seberapa "kelihatan lengkap" assertion-nya.

## Kelas Blind Spot ke-6: Visual/Layout Regression (Beda Jenis dari 5 Kelas di Atas)

5 kelas di atas semuanya soal STATE (data, timing, konkurensi) — bisa dites lewat assertion terhadap DOM/URL/teks. **Visual/layout regression itu beda jenis masalah**: halaman bisa PASS semua assertion (elemen ada, teks benar, URL benar) tapi TAMPILANNYA rusak secara visual (elemen overlap, CSS berantakan, responsive breakpoint patah, komponen ke-cut). Assertion berbasis DOM/teks TIDAK PERNAH bisa menangkap ini karena DOM-nya secara struktural tetap "benar" — cuma tampilannya yang salah.

**Kenapa ini penting:** kejadian nyata — test bilang "layout tidak break" (karena semua assertion DOM/teks lolos), tapi secara visual layout memang rusak. Ini murni karena test-nya tidak pernah benar-benar "melihat" halaman, cuma cek state abstrak.

**Cara mitigasi (WAJIB untuk flow dengan komponen visual signifikan — form kompleks, grid/card layout, dashboard):**
1. **Automated screenshot regression** — pakai fitur bawaan Playwright `await expect(page).toHaveScreenshot()` untuk skenario kritis yang layoutnya kompleks. Ini generate baseline screenshot pertama kali, lalu compare otomatis di run berikutnya — kalau ada perubahan visual signifikan, test FAIL meski semua assertion DOM/teks lolos.
2. **Verifikasi visual manual pakai Playwright MCP** — kalau MCP Playwright tersedia (connected, sesuai tools yang ada: `browser_take_screenshot`, `browser_snapshot`), WAJIB dipakai untuk verifikasi visual SETELAH aksi penting (submit form, navigasi ke halaman baru, resize viewport) — ambil screenshot dan BENAR-BENAR PERIKSA hasilnya secara visual, jangan cuma ambil screenshot lalu diabaikan. Ini terutama penting untuk audit (Tahap 1) dan self-check (Tahap 3B/4) di flow yang punya UI kompleks. **Setiap screenshot yang jadi bukti temuan (bukan sekadar cek rutin yang hasilnya normal) WAJIB disimpan ke `reports/screenshots/[nama-flow]/` dan direferensikan di laporan** — lihat aturan folder di atas.
3. Assertion DOM/teks/URL tetap WAJIB ada seperti biasa — screenshot regression itu TAMBAHAN, bukan pengganti.

## UI/UX: Pisahkan Bug Objektif dari Preferensi Desain Subjektif

Saat menemukan masalah UI/UX (baik saat audit, testing, atau screenshot verification), WAJIB bedakan dua kategori berikut — jangan disamaratakan:

### Kategori A — Bug UI Objektif (WAJIB difix, masuk temuan audit biasa, BUKAN advisory)

Ini masalah yang secara fungsional nyata rusak/tidak bisa dipakai, bukan opini — contoh: konten terpotong keluar layar (dropdown/popup yang tidak auto-flip arah saat ruang di satu sisi tidak cukup — dikenal sebagai *collision detection*, pattern standar di library seperti Radix UI/Floating UI), elemen saling menimpa sehingga tidak bisa diklik, teks tidak terbaca karena kontras nyaris nol, tombol yang area kliknya tidak sesuai tampilan. **Ini treatment-nya SAMA seperti bug biasa** — masuk `reports/audit/[nama-flow].md` dengan format standar (skenario, bukti, risiko, opsi solusi), WAJIB diperbaiki, dan idealnya dapat test coverage (screenshot regression dari Kelas Blind Spot ke-6) supaya tidak regresi lagi.

### Kategori B — Preferensi Desain Subjektif (Advisory, TIDAK Boleh Jadi Blocker Status AMAN)

Ini soal selera/pendekatan desain yang bisa didebat — contoh: layout konten di-center dengan max-width sempit vs fit lebar penuh, spacing, pemilihan warna, hierarki visual. **JANGAN PERNAH campur dengan Kategori A** — test/status AMAN tidak boleh terganggu hanya karena preferensi desain, karena itu bukan sesuatu yang "pasti salah".

**PENTING — cek dulu scope `design-taste.md` sebelum dipakai:** file itu (kalau isinya sesuai skill "anti-slop frontend" yang umum) secara eksplisit ditujukan untuk **landing page, portfolio, dan redesign marketing** — BUKAN untuk dashboard, data table, atau multi-step product UI. KonsulExpert sebagian besar adalah dashboard (admin/consultant/client) dan booking flow multi-step — itu di LUAR scope `design-taste.md`. Cek baris deskripsi/scope di awal file itu dulu, JANGAN asumsikan otomatis applicable ke semua halaman.

- **Kalau halaman yang diaudit itu marketing/landing-page-style** (homepage publik, halaman "cara kerja", halaman promosi) — `design-taste.md` applicable, WAJIB dibaca dan diikuti (termasuk dial `DESIGN_VARIANCE`/`MOTION_INTENSITY`/`VISUAL_DENSITY` kalau file itu punya konsep itu).
- **Kalau halaman yang diaudit itu dashboard/admin panel/booking flow multi-step** (di luar scope file itu) — JANGAN paksa pakai `design-taste.md`. Pakai kerangka usability umum di bawah ini (CRAP, Fitts's Law, Hick's Law, Consistency, Visibility of System Status) sebagai acuan utama, karena project ini belum punya rules desain khusus untuk tipe UI ini.

**Di luar apa yang ada di `design-taste.md`, evaluasi Kategori B juga WAJIB merujuk ke kerangka usability yang sudah mapan (bukan opini bebas)** — supaya observasinya presisi dan bisa dipertanggungjawabkan, bukan sekadar "kelihatannya kurang bagus". Yang applicable untuk review UI yang SUDAH JADI (bukan proses desain dari nol seperti riset/wireframing — itu di luar scope QA/QC, harus dilakukan di fase desain terpisah sebelum coding):

- **Visual hierarchy** — apakah elemen paling penting (CTA utama seperti "Bayar"/"Book Now") paling menonjol secara visual (ukuran, warna, posisi), atau tenggelam sama elemen lain yang kurang penting?
- **CRAP principles** — Contrast (elemen beda fungsi harus beda tampilan jelas), Repetition (pola visual konsisten di seluruh app), Alignment (elemen sejajar rapi, tidak berantakan), Proximity (elemen yang berhubungan dikelompokkan dekat, yang tidak berhubungan dipisah jelas).
- **Fitts's Law** — target yang sering diklik (tombol aksi utama) harus cukup besar dan posisinya masuk akal (tidak terlalu kecil/jauh dari alur natural user), khususnya untuk aksi finansial (bayar, konfirmasi booking).
- **Hick's Law** — terlalu banyak pilihan/opsi sekaligus (dropdown panjang tanpa grouping, form dengan banyak field tanpa step) meningkatkan waktu keputusan dan potensi error user.
- **Consistency (Jakob's Law)** — komponen SEJENIS harus berperilaku dan terlihat SAMA di seluruh aplikasi. Kalau ditemukan komponen sejenis (misal beberapa jenis dropdown/modal) dibangun dengan cara berbeda-beda (bukan dari satu wrapper/primitive yang sama), itu sendiri temuan yang WAJIB dicatat — ini juga sumber kenapa bug Kategori A (seperti dropdown yang tidak auto-flip) bisa muncul berulang di tempat berbeda dengan pola yang mirip.
- **Visibility of system status** — apakah user selalu dapat feedback jelas untuk aksi yang dilakukan (loading state, sukses, gagal)? (Ini beririsan dengan TMB-04 Partial Failure yang sudah dibahas di 5 Kelas Blind Spot Testing — kalau notifikasi gagal terkirim diam-diam, itu juga pelanggaran prinsip ini dari sisi UX.)
- **Task-completion friction (beda dari visual, ini soal ALUR tugas)** — apakah user bisa menyelesaikan tugas realistis tanpa bingung/nyasar? Anchor ke heuristik Nielsen yang relevan: *recognition rather than recall* (opsi harus terlihat jelas, user tidak perlu mengingat-ingat cara), *user control and freedom* (ada jalan keluar/opsi manual, bukan cuma alur otomatis yang kaku), *match between system and real world* (istilah yang dipakai jelas maknanya bagi user, bukan istilah teknis/ambigu). Ini BEDA dari masalah visual (footer salah tempat) — ini soal seluruh ALUR terasa berbelit meskipun setiap elemen individualnya terlihat "benar" secara visual.

## Kelengkapan Struktural & Detail yang Sering Terlewat (Beda dari CRAP/Task-Friction di Atas)

Selain prinsip di atas, ada dimensi evaluasi lain yang sering kelewat kalau cuma fokus ke CRAP dan alur tugas — checklist ini WAJIB dicek juga, terutama saat UX Walkthrough atau screenshot verification (Kelas Blind Spot ke-6):

- **Kelengkapan struktural dibanding halaman sejenis** — apakah halaman ini kehilangan komponen yang SEHARUSNYA ada, dibandingkan halaman lain yang sejenis/setara (contoh: halaman dashboard lain punya sidebar, halaman ini tidak — apakah itu disengaja atau kelewat)? Ini beda dari inkonsistensi visual biasa — ini soal ADA/TIDAK ADA komponen struktural, bukan soal gaya komponen yang ada.
- **Proporsi/skala relatif ke ruang tersedia** — apakah elemen (bukan cuma tombol, tapi juga card/konten/gambar) terasa terlalu kecil dibanding ruang kosong di sekitarnya, atau sebaliknya terlalu besar sampai terasa sesak? Ini beda dari Fitts's Law (yang spesifik ke target klik) — ini soal proporsi visual elemen apapun terhadap ruang yang ada.

**Peningkatan struktural proaktif untuk area interaksi UTAMA (beda dari sekadar nyari deficiency):** untuk area yang jadi INTI dari tugas yang sedang di-walkthrough (contoh: jendela chat di flow sesi konsultasi, form booking di flow booking) — WAJIB mikir proaktif seperti UX designer senior dengan dua pertanyaan wajib:

1. **"Apakah alokasi ruang/layout ini benar-benar OPTIMAL untuk tugas ini, atau cuma 'tidak rusak'?"** — Jangan cuma tunggu sampai sesuatu terasa jelas salah. Usulkan peningkatan struktural kalau ada potensi (contoh: area kerja utama diperluas, elemen periferal dibuat collapsible/minimizable, 2-column layout dengan sticky summary di flow booking/checkout).
2. **"Kalau saya mendesain ini dari awal sebagai UX designer senior, apa versi TERBAIKnya — bukan cuma versi yang tidak rusak?"** — Untuk SETIAP temuan, jangan cuma pikirkan "cara memperbaiki yang janggal". Pikirkan: kalau ini desain dari nol, bagaimana solusi optimalnya? Contoh: bukan cuma "tambah stepper", tapi spesifikkan — horizontal di desktop dengan labeled steps, compact "Step 2 of 4" di mobile, completed/current/future states yang jelas. Bukan cuma "tambah empty state", tapi 3 elemen: context (kenapa kosong) + direction (apa yang harus dilakukan) + CTA button.

Usulan ini masuk sebagai temuan dengan opsi solusi + trade-off (sama seperti temuan lain), BUKAN otomatis diimplementasi — kecuali memenuhi kriteria "boleh GAS langsung" yang sudah ada.
- **Whitespace/jarak antar elemen** — terlalu sesak (elemen saling berhimpitan) atau terlalu longgar (jarak berlebihan yang bikin elemen terkait terasa terpisah)?
- **Responsive di berbagai breakpoint** — screenshot verification (Kelas Blind Spot ke-6) WAJIB dicek di MINIMAL 3 ukuran viewport (mobile ~375px, tablet ~768px, desktop ~1440px), bukan cuma satu ukuran default. Layout yang benar di desktop bisa rusak total di mobile atau sebaliknya.
- **Typography readability** — paragraf yang terlalu lebar (baris teks kepanjangan bikin susah dibaca), ukuran/berat font yang tidak konsisten antar elemen yang seharusnya sejenis (misal semua judul card ukurannya beda-beda tanpa alasan).
- **Empty state (WAJIB 3 elemen)** — bagaimana tampilan halaman saat belum ada data (list booking kosong, belum ada review, dll)? Sering terlewat sehingga terlihat seperti "rusak" padahal cuma belum ada data. Empty state yang baik WAJIB punya 3 elemen: (1) **Context** — kenapa area ini kosong ("Belum ada booking"), (2) **Direction** — apa yang harus user lakukan selanjutnya ("Booking konsultasi pertama Anda"), (3) **CTA** — tombol/link yang actionable untuk mulai mengisi area itu. Referensi: Nielsen Norman Group dashboard research — users spend <3 seconds deciding whether to keep looking at a screen; blank white space dengan no explanation membuat user assume something is broken.
- **Loading state** — bukan cuma "apakah ada indikasi loading" (itu prinsip Visibility of System Status di atas), tapi apakah tampilan loading-nya sendiri rapi (skeleton/spinner yang konsisten) atau blank/berkedip aneh. **Skeleton screen lebih baik dari spinner** untuk data yang populate structural component (table, card, metric panel) — skeleton maintain spatial continuity dan reduce perceived wait time. Spinner boleh untuk inline action (submit button loading state).
- **Interactive states (hover/focus/disabled)** — apakah tombol/input punya styling yang jelas untuk state selain default (hover, focus saat navigasi keyboard, disabled saat tidak bisa diklik)? Sering cuma state default yang didesain, sisanya default browser mentah yang terlihat tidak konsisten dengan desain sistem. **Disabled button WAJIB punya helper text** yang menjelaskan kenapa disabled ("Pilih paket untuk melanjutkan"), bukan cuma grayed out tanpa konteks.
- **Native browser dialog (`confirm()`/`alert()`/`prompt()`) dipakai untuk konfirmasi penting** — ini masuk Kategori A (bug objektif, bukan preferensi), karena dialog native TIDAK bisa di-styling, tampilannya beda-beda antar browser/OS, dan blocking (freeze halaman). Kalau ditemukan, catat sebagai temuan yang perlu diganti custom modal/toast yang konsisten dengan desain sistem. **Kalau ada E2E test untuk aksi yang mentrigger dialog native ini, WAJIB cek apakah test-nya menangani dengan benar lewat `page.on('dialog')`** — kalau tidak ditangani dengan benar, dialog bisa "auto-accept/reject" diam-diam tanpa test benar-benar verifikasi isi/perilaku dialog itu, ini pola assertion lemah lagi (lihat Standar Kekuatan Assertion) dalam bentuk berbeda.
- **Konten/copy standards** — konsistensi kapitalisasi (title case vs sentence case, jangan campur tanpa aturan jelas), tanda baca yang terlihat seperti AI-generated (contoh: em dash `—` dipakai berlebihan) kalau itu bukan gaya penulisan yang diinginkan, terminologi yang konsisten (jangan sebut entity yang sama dengan istilah berbeda-beda di halaman berbeda). Ini beda dari visual styling — ini soal teks/copy itu sendiri.
- **Kebenaran destinasi navigasi/link** — breadcrumb, menu, tombol "kembali", dan link lain WAJIB diverifikasi benar-benar mengarah ke halaman yang valid dan sesuai konteks (bukan cuma ada link-nya, tapi destinasinya benar). Contoh bug nyata: breadcrumb di halaman dashboard user mengarah ke `/dashboard` generic padahal seharusnya ke path spesifik role user itu (`/dashboard/[role]`). Klik dan verifikasi hasil akhirnya, jangan cuma cek link-nya "ada".
- **Breadcrumb context di multi-step flow** — flow multi-step (booking, checkout, registrasi) WAJIB punya breadcrumb atau context indicator yang menunjukkan: user ada di flow mana, konsultan/kategori mana, dan bisa kembali ke step sebelumnya. Tanpa ini, user tidak tahu context-nya dan harus pakai browser back button (poor UX). Referensi: SaaSUI Navigation Patterns — "Once users drill into nested records, breadcrumb navigation shows them where they are and gives them a one-click path back up the hierarchy."
- **Information Architecture (IA) navigation** — sidebar/menu WAJIB dicek: (1) apakah item di-group by user goal atau flat list tanpa grouping? Flat list 6+ item tanpa grouping = cognitive overload (Hick's Law). (2) apakah label sesuai user mental model, bukan internal org chart? (3) apakah active state cukup distinct (bukan cuma beda shade warna, tapi genuinely different visual treatment — background + border + icon fill)? Referensi: SaaS Navigation Design — "Navigation items should reflect how users think about the product, not how it's built internally. Group features by user goal." Active state: "not just a different shade of the same color, but a genuinely different visual treatment."
- **Mobile navigation pattern** — JANGAN cuma cek "apakah ada mobile nav". Cek apakah pattern-nya appropriate: (1) `<details>`/`<summary>` HTML element BUKAN pattern SaaS standar — pakai Sheet/drawer (slide-over) atau bottom tab bar. (2) Touch target minimum 44px. (3) Hamburger icon jelas di top bar, bukan cuma text label. (4) Bottom tab bar cocok untuk ≤5 item nav (client sidebar). Referensi: Nextcraft SaaS Dashboard Patterns — "Move the sidebar to a bottom tab bar on small screens — thumbs can't reach a left sidebar easily."
- **Trust signals di flow finansial** — checkout/payment page WAJIB menampilkan trust signals: security badge, "Pembayaran Aman", encryption icon. Tanpa ini, conversion drop karena user ragu keamanan transaksi. Khusus untuk platform yang menyentuh uang seperti KonsulExpert.
- **Keyboard navigation** — verifikasi Tab, Enter, Escape berfungsi di form/flow utama. Focus indicator visible (bukan cuma rely pada color). Referensi: UX Patterns Guide Step Navigation — "Use aria-current on the current labeled step. Do not rely on color alone; combine shape, text, icon, or status copy with accessible contrast."
- **Flow redundancy check (Ditemukan dari UX-1 booking-lifecycle 4 Aug 2026)** — apakah user harus melakukan aksi yang sama di 2 tempat berbeda? Contoh: pilih paket di consultant profile page → ke booking page → harus pilih paket lagi. Ini bukan cuma "inefficient" — ini confusing karena user tidak tahu apakah pilihan pertamanya berpengaruh atau tidak. Cek: (1) apakah ada action yang dilakukan di page A lalu harus diulang di page B? (2) apakah ada query param atau state yang dikirim dari page A tapi tidak dikonsumsi di page B? (3) kalau ada redundansi, apakah ini intentional (user bisa ubah pilihan) atau bug (pilihan pertama hilang)? Referensi: NN/g Task Flow — "Users should not have to repeat information they already provided."
- **Proactive availability display (Ditemukan dari UX-1 booking-lifecycle 4 Aug 2026)** — untuk flow yang melibatkan pencarian slot/jadwal/tanggal: apakah sistem PROAKTIF menampilkan opsi yang tersedia, atau user harus menebak/trial-and-error? Contoh buruk: date picker kosong, user pilih tanggal → "tidak ada slot" → user harus pilih tanggal lain → repeat. Contoh baik: calendar dengan tanggal yang punya slot di-highlight, atau list "tanggal tersedia" dengan jumlah slot. Cek: (1) apakah user bisa melihat opsi tersedia SEBELUM input? (2) apakah ada feedback "slot tersedia mulai tanggal X" yang actionable? (3) apakah user harus trial-and-error untuk menemukan opsi valid? Referensi: Baymard Calendar UX — "Show available dates proactively, don't make users guess."
- **Cross-role component consistency (Ditemukan dari UX-1 booking-lifecycle 4 Aug 2026)** — komponen yang sejenis (star rating, booking card, status badge) WAJIB konsisten tidak hanya antar-page, tapi juga antar-role. Client review form dan consultant rating modal pakai star rating — apakah icon, warna, size, dan interaksi SAMA? Walkthrough dari 1 role saja TIDAK akan menangkap inkonsistensi cross-role. WAJIB walkthrough dari minimal 2 role yang berinteraksi di flow yang sama, lalu bandingkan komponen sejenis.
- **Focus Not Obscured (Riset: WCAG 2.2 SC 2.4.11, NEW in 2.2)** — saat user Tab ke interactive element, apakah focus indicator terlihat atau terhalang sticky header / sticky bottom bar / floating banner? Focus yang di belakang sticky element = user tidak tahu dimana focus-nya. Cek khusus pada page dengan sticky navbar, sticky filter bar, atau floating action button.
- **Consistent Help Location (Riset: WCAG 2.2 SC 3.2.6, NEW in 2.2)** — help mechanism (help link, contact, FAQ link, support chat) WAJIB muncul di lokasi yang konsisten across halaman. Kalau help link ada di footer di page A tapi di sidebar di page B, user tidak bisa menemukan help dengan cepat. Cek: apakah help link/button ada di lokasi yang sama di semua page?
- **Form Data Preservation on Error (Riset: SaaS UX #60, NN/g H9)** — kalau form submit gagal (validation error, API error, network timeout), apakah data yang user sudah input tetap ada? Atau form reset dan user harus ketik ulang semua? User WAJIB tidak pernah harus re-enter information yang sudah diketik. Test: isi form → submit → trigger error → cek apakah field masih berisi data sebelumnya.
- **Network Failure Handling (Riset: SaaS UX edge case, NN/g H9)** — apa yang terjadi saat network drop di tengah action? (1) submit form → network timeout → data hilang atau ada retry? (2) upload file → network drop → file corrupt atau ada resume? (3) payment → network timeout → user charged tapi tidak ada confirmation? Test dengan Chrome DevTools Network throttling (offline mode). Setiap action WAJIB graceful degrade: toast error + data preserved + retry option.
- **Loading vs Empty vs Error Distinction (Riset: SaaS UX #69)** — user WAJIB bisa membedakan 3 state: (1) "still loading" — content sedang datang (skeleton/spinner), (2) "nothing here" — tidak ada data (empty state dengan context + CTA), (3) "something broke" — error terjadi (error message dengan recovery). Ketiga state BUTUH visual treatment yang berbeda. Blank page = ambigu, user tidak tahu apakah loading, kosong, atau error.
- **Flexibility & Efficiency (Riset: NN/g H7)** — apakah ada accelerator untuk power user? (1) keyboard shortcut untuk frequent action (Ctrl+Enter submit, Esc close modal), (2) quick path untuk returning user (skip onboarding, direct search), (3) bulk action untuk repetitive task (select multiple → action). Tidak harus ada semua, tapi WAJIB dicek apakah flow punya user yang akan frustrated karena tidak ada shortcut.
- **Help & Documentation (Riset: NN/g H10)** — apakah user bisa menemukan help saat stuck? (1) FAQ page accessible dari navigation? (2) contextual help (tooltip, help icon) di form/flow yang complex? (3) error message yang langsung kasih link ke solusi? Help WAJIB contextual, searchable, dan task-oriented — bukan generic "Contact support".
- **Jargon Check (Riset: NN/g H2 Match System & Real World)** — apakah semua istilah di UI user-facing atau technical jargon? Cek: (1) label form — "Email" bukan "Email Address Identifier", (2) status — "Menunggu Pembayaran" bukan "PENDING_PAYMENT", (3) error — "Email tidak valid" bukan "Validation failed for field: email (pattern mismatch)". User tidak harus belajar istilah teknis untuk pakai platform.
- **Modal focus retention (Ditemukan dari manual test UX-0 5 Aug 2026)** — saat user mengetik di form field (input/textarea) di dalam Modal/Dialog, apakah focus tetap di field tersebut? Atau focus lompat ke elemen lain setiap ketik? Root cause umum: Modal `useEffect` dengan function prop di dependency array → re-run setiap parent re-render → `firstFocusable.focus()` lompat ke first button. **Test WAJIB:** buka modal yang punya form, ketik 1 huruf di textarea → focus harus tetap di textarea. Kalau focus lompat, itu bug Kategori A (user tidak bisa mengetik dengan benar di form di dalam modal).
- **Toggle switch knob containment (Ditemukan dari manual test UX-0 5 Aug 2026)** — toggle/switch knob WAJIB tetap di dalam track saat on maupun off. Knob yang keluar dari track = visual bug Kategori A. Cek: (1) apakah knob punya `left-0` atau `left-0.5` anchor? (2) apakah `translate-x` value benar untuk track width? (3) apakah posisi on dan off simetris (margin kiri = margin kanan)? Test di 3 viewport untuk pastikan tidak ada layout shift.
- **Flex fixed-size child preservation (Ditemukan dari manual test UX-0 5 Aug 2026)** — elemen dengan fixed `h-*` dan `w-*` (circle, icon container, avatar) di dalam flex container WAJIB punya `shrink-0`. Tanpa itu, elemen ke-squish saat container sempit (text panjang, viewport mobile) dan kehilangan aspect ratio. Circle jadi oval, icon jadi distorted. **Test WAJIB:** di viewport mobile (375px), cek semua flex container dengan fixed-size child + text — child harus maintain size. Lihat juga Scan 21 untuk grep pattern.

**Aturan cakupan WAJIB untuk semua poin checklist di atas (ini yang sering jadi penyebab temuan kelewat, bukan checklist-nya yang kurang):**
- **Cek SEMUA instance dari komponen sejenis yang berulang, bukan cuma 1 contoh representatif.** Kalau ada 10 card FAQ dengan badge angka, cek border-radius/styling di SEMUA 10, bukan cuma card pertama — inkonsistensi biasanya baru ketauan kalau dibandingkan across instance, bukan dari 1 instance yang dilihat sendirian.
- **Cek di MINIMAL 3 ukuran viewport, bukan 2** — mobile sempit (~375px), tablet (~768px), desktop (~1440px). Bug yang cuma muncul di lebar tertentu (misal teks kehilangan spasi di breakpoint spesifik) sering kelewat kalau cuma dicek di 2 ukuran umum (mobile besar + desktop).

## Functional Completeness Audit (Beda dari Anti-Pattern Scan dan Kelengkapan Struktural)

Anti-Pattern Scan di bawah nangkap yang **bisa di-grep** (text-based known patterns). Kelengkapan Struktural di atas ngecek **yang sudah ada tapi janggal** (visual, interaction, state). **Functional Completeness Audit ngecek yang SEHARUSNYA ADA TAPI TIDAK ADA** — fitur/kemampuan/opsi yang user masuk akal butuhin tapi tidak ada di sistem.

Ini blind spot paling berbahaya karena: auditor cuma bisa ngecek yang ada di code. Kalau sesuatu tidak ada sama sekali, tidak ada file untuk di-grep, tidak ada komponen untuk di-screenshot, tidak ada halaman untuk di-walkthrough. Gap ini cuma terlihat kalau auditor mikir proaktif: "apa yang seharusnya ada di sini?"

### Persona-Needs Matrix (WAJIB sebelum walkthrough per-flow)

Untuk SETIAP role di platform (Client, Consultant, Admin), buat matriks: apa saja hal yang user role ini masuk akal butuhin? Grounding ke:
- **Competitor analysis** — platform sejenis (BetterHelp, Talkspace untuk mental health; Kalibrr, Upwork untuk marketplace profesional; Shopify admin untuk admin panel)
- **Design system established** — Material Design, Apple HIG, Polaris (Shopify admin), Carbon (IBM) untuk komponen/pattern yang expected
- **Usability research** — NN/g, Baymard untuk expected features per product type
- **Platform convention** — apa yang user sudah expect dari platform sejenis (profile photo, settings page, user management, dll)

Format matriks:

| Role | Need | Status | Priority | Source |
|------|------|--------|----------|--------|
| Consultant | Upload foto profil/avatar | ❌ Missing | High | Marketplace convention (Upwork, BetterHelp) |
| Admin | Edit profil sendiri | ❌ Missing | High | Admin panel convention (Checklist Design, Polaris) |
| Admin | Manajemen user (create/edit/suspend) | ❌ Missing | High | SaaS admin standard (Netguru, SaaS UX Audit) |
| Client | Lihat riwayat booking | ✅ Ada | — | — |

**Aturan prioritas:**
- **Critical (Blocker)** — blocking user flow utama, tidak bisa pakai platform tanpa ini
- **High** — user bisa pakai tapi pengalaman terdegradasi signifikan, atau admin tidak bisa kelola platform dengan benar
- **Medium** — nice-to-have yang improve UX tapi tidak blocking
- **Low** — future enhancement

### Kategori Gap yang WAJIB Dicek (Universal, Bukan Case-by-Case)

List kategori ini bukan dari contoh konkret yang user sebut, tapi dari riset platform marketplace + SaaS admin + profile UX. Setiap kategori WAJIB dicek untuk setiap role — jawaban "tidak ada gap" untuk suatu kategori WAJIB dinyatakan eksplisit, bukan diam-diam dilewati.

**1. Profile & Identity Completeness**
- Avatar/foto profil upload — untuk marketplace, ini trust signal kritis (Wall & Fifth: "profile communicates credibility")
- Edit informasi dasar akun (nama, email, phone, password) — terpisah dari profil profesional
- Profil completeness indicator — menunjukkan kelengkapan profil (% atau checklist)
- Privacy/visibility controls — field mana yang public vs private
- Delete account / data export — GDPR-like self-service
- Referensi: UX Patterns Guide Profile Setup, NN/g Form Design

**2. Admin Panel Completeness**
- User management — view/search/create/edit/suspend/activate users (Checklist Design Admin Panel, SaaS Admin Panel Design — "5 standard actions: viewing, creating, editing, activating/deactivating, bulk import")
- Admin profile & settings — admin bisa edit profil sendiri, ganti password
- System settings — konfigurasi platform (commission rate, payment settings, dll)
- Danger zone — destructive actions dengan typed confirmation (delete workspace, transfer ownership)
- Bulk operations — bulk activate/deactivate/export
- Referensi: Checklist Design Admin Panel, Polaris Admin, Netguru Admin Panel Design

**3. Settings & Preferences**
- Notification preferences — user bisa kontrol notifikasi apa yang diterima (email, push, in-app)
- Account settings — ganti password, 2FA, delete account
- Language/locale settings — kalau platform support multi-bahasa
- Referensi: SaaS UX Audit Checklist (Desisle), setting.page

**4. Marketplace-Specific (KonsulExpert)**
- Trust signals di profile konsultan — verification badge, jumlah sesi, response time, rating display
- Profile completeness untuk konsultan — foto, bio, kredensial, specialization — semua terisi?
- Search & filter completeness — filter by specialization, price range, availability, rating, location
- Booking flow completeness — cancel policy, reschedule, refund policy visibility
- Two-sided review system — client review consultant, consultant review client
- Referensi: Wall & Fifth Marketplace UX, Baymard Checkout Usability, Olha Bahaieva Marketplace UX

**5. Communication & Support**
- In-app messaging/chat — antara client dan consultant sebelum/sesudah booking
- Help/support access — FAQ, contact support, help center
- Notification center — in-app notification dropdown/page
- Referensi: NN/g Communication Patterns, SaaSUI Support Patterns

**6. Data & Analytics**
- Export data — booking history, earnings, transactions (CSV/PDF)
- Date range filter — di dashboard, di list pages
- Search functionality — global search atau per-section search
- Referensi: SaaS UX Audit Checklist, Polaris Data Export

### Cara Eksekusi Functional Completeness Audit

1. **Identifikasi SEMUA role** di platform (Client, Consultant, Admin, dan sub-role kalau ada)
2. **Untuk setiap role**, buat Persona-Needs Matrix dengan 6 kategori di atas
3. **Cross-reference dengan code** — grep/read file untuk konfirmasi benar-benar tidak ada (bukan cuma "tidak kelihatan")
4. **Klasifikasi gap**: Critical / High / Medium / Low
5. **Untuk setiap gap**, tulis: apa yang missing, kenapa penting, referensi sumber, opsi solusi
6. **Gap yang menyentuh data model** (butuh schema change) → WAJIB approval, tidak boleh GAS-fix
7. **Gap yang murni UI** (komponen belum dibuat tapi data sudah ada) → boleh GAS-fix kalau cost kecil

### Senior UX Designer Mindset (WAJIB untuk Functional Completeness, 100 tahun pengalaman)

Jangan cuma ngecek "apa yang broken?" — tanyakan:
1. **"Kalau saya mendesain platform ini dari awal sebagai UX designer senior dengan 100 tahun pengalaman di marketplace, apa yang pasti saya sertakan?"**
2. **"Apa yang user expect dari platform sejenis dan tidak menemukan di sini?"**
3. **"Apa yang admin butuh untuk mengelola platform ini dengan efektif dan tidak punya?"**
4. **"Apa trust signals yang hilang yang membuat user ragu untuk transaksi?"**
5. **"Apa settings/preferences yang user masuk akal want to control tapi tidak bisa?"**
6. **"Apa friction yang user tidak sadari tapi mengurangi conversion/retention?"**
7. **"Apa yang akan break di scale (10x user, 100x data) yang saat ini masih 'jalan'?"**

Pertanyaan-pertanyaan ini bukan opsional — ini WAJIB dijawab untuk setiap role sebelum walkthrough per-flow dimulai. Jawaban "tidak ada gap" untuk suatu kategori WAJIB dinyatakan eksplisit, bukan diam-diam dilewati.

**Prinsip tambahan:**
- **Setiap rekomendasi WAJIB punya referensi.** Bukan "saya rasa lebih bagus begini" — tapi "NN/g bilang X, Baymard bilang Y, jadi rekomendasi saya Z". Opini tanpa referensi = bukan standar senior.
- **Jangan batasi ke yang user sebut.** Kalau user sebut 3 masalah, cari 10 masalah lain yang user TIDAK sebut. Senior UX designer tidak nunggu user complaint baru act.
- **Micro-interactions matter.** Button hover, focus state, loading skeleton, empty state, error state — setiap state punya UX impact. Senior tidak skip ini karena "kecil".
- **Accessibility bukan nice-to-have.** WCAG compliance adalah baseline, bukan opsi.

### Anti-Pattern List yang Bisa Tumbuh

List kategori di atas bukan daftar tertutup. Kalau saat sweep ditemukan kategori gap baru yang tidak ter-cover 6 kategori di atas (misal: "onboarding flow gap", "SEO/meta tag gap", "internationalization gap"), **WAJIB tambahkan ke list ini** sebagai kategori baru untuk sweep berikutnya. Format: nama kategori + kenapa penting + referensi sumber.

## Anti-Pattern Scan (Grep-Based, WAJIB Sebelum Walkthrough Manual)

Checklist di atas sudah komprehensif, tapi banyak item yang terlewat karena terlalu abstrak untuk di-enforce — AI interpretasi "cek konsistensi kapitalisasi" sebagai "lihat 1-2 contoh", bukan "grep semua label di project". Section ini mengubah anti-pattern yang **known dan text-based** jadi perintah grep konkret yang bisa dieksekusi langsung, bukan diinterpretasi.

**Jalankan SEMUA scan berikut sebelum mulai walkthrough manual per-flow. Hasil scan jadi input untuk audit per-flow — kalau ada hit, masuk sebagai temuan, bukan ditunggu sampai ketemu secara manual.**

### Scan 1: AI Slop Punctuation
```
grep -rn " — " features/ --include="*.tsx" --include="*.ts"
```
Em dash (` — `) adalah tanda tanda baca yang sangat sering dipakai AI-generated text. Ganti dengan hyphen biasa (` - `), rephrase, atau koma — kecuali kalau em dash memang sengaja untuk dialog/quote (sangat jarang di UI text). **TIDAK perlu riset** — ini consensus anti-pattern, bukan preferensi desain.

### Scan 2: Breadcrumb Dead Links
```
grep -rn 'href.*"/dashboard"' features/ --include="*.tsx"
```
`/dashboard` adalah route redirect, bukan page yang user bisa lihat langsung. Setiap breadcrumb yang link ke `/dashboard` (tanpa role suffix) WAJIB diganti ke `/dashboard/client`, `/dashboard/consultant`, atau `/dashboard/admin` sesuai role user di page itu. **Cek juga** apakah route target ada di `app/` directory — kalau tidak ada, itu dead link.

### Scan 3: Capitalization Inconsistency
```
grep -rn 'label:.*"' features/ --include="*.tsx" | grep -i 'breadcrumb\|nav\|sidebar\|menu'
```
List semua label di Breadcrumb/Navigation component, bandingkan dalam tabel. Flag yang inkonsisten (misal: `"konsultan"` lowercase di satu file, `"Klien"` title case di file lain). Aturan: **title case** untuk semua label yang user-facing (Proper Noun, Page Title, Navigation Item). **TIDAK perlu riset** — ini consensus style guide.

### Scan 4: Inconsistent Border-Radius pada Komponen Sejenis
```
grep -rn 'rounded-\[' features/ --include="*.tsx"
```
List semua `rounded-[...]` custom values, bandingkan dengan `rounded-full`, `rounded-lg`, dll yang dipakai di komponen sejenis (misal: badge angka FAQ, avatar, icon container). Flag yang pakai custom value beda untuk komponen yang seharusnya sama. **Riset: Material Design Shape System** untuk guideline border-radius consistency.

### Scan 5: Missing aria-label pada Icon-Only Buttons
```
grep -rn '<button' features/ --include="*.tsx" | grep -v 'aria-label'
```
Icon-only button (tombol yang cuma punya icon, no text) WAJIB punya `aria-label`. Filter manual hasil grep untuk yang benar-benar icon-only (bukan button yang punya text tapi kebetulan tidak ada aria-label). **Riset: WCAG 2.1 SC 4.1.2 Name, Role, Value**.

### Scan 6: Native confirm()/alert()/prompt()
```
grep -rn 'confirm(\|alert(\|prompt(' features/ --include="*.tsx" --include="*.ts"
```
Native dialog WAJIB diganti custom modal/toast. Sudah ada di checklist atas, tapi grep ini tangkap semua instance sekaligus.

### Scan 7: Emoji & Unicode Symbol in UI (Ditemukan dari UX-1 booking-lifecycle 4 Aug 2026)
```
# Windows (PowerShell) — utama, karena MinGW grep tidak support \x{} unicode range:
Get-ChildItem -Path features/ -Recurse -Include "*.tsx","*.ts" | Select-String -Pattern "[\u23F3\u23F0\u2713\u2605\u2715\u26A0\u2610\u2717\u2714]" | Select-Object Path, LineNumber, Line

# Untuk emoji (surrogate pair range), pakai .NET regex:
Get-ChildItem -Path features/ -Recurse -Include "*.tsx","*.ts" | Select-String -Pattern "[\uD83D-\uD83E]" | Select-Object Path, LineNumber, Line

# Linux/Mac (grep -P works):
grep -rnP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}]' features/ --include="*.tsx" --include="*.ts"
```
Juga cek unicode symbols yang dipakai sebagai icon: `⏳ ⏰ ✓ ★ ✕ ⚠ ☐ 🚫 📄 🖼️ 🔗 💡`. Project ini pakai Lucide icons (`lucide-react`) sebagai icon library standar — semua icon di UI WAJIB pakai Lucide component (`<Star>`, `<Clock>`, `<Check>`, dll), BUKAN unicode character atau emoji. Unicode symbol kelihatan beda antar OS/browser (Android vs iOS vs Windows vs Mac), tidak bisa di-style (size, color, weight), dan tidak konsisten dengan Lucide icon set yang sudah dipakai di tempat lain. **TIDAK perlu riset** — ini consensus design system, bukan preferensi.

**Cek juga unicode checkmark `✓` di stepper/badge** — ganti ke `<Check className="h-5 w-5" />`. Unicode `★` di rating/button — ganti ke `<Star>` Lucide.

### Scan 8: Flex Layout Without Gap (Ditemukan dari UX-1 booking-lifecycle 4 Aug 2026)
```
grep -rn 'flex.*justify-between' features/ --include="*.tsx" | grep -v 'gap'
```
`flex justify-between` tanpa `gap` adalah root cause spacing bug pattern: elemen kiri dan kanan saling nempel di viewport sempit (mobile). WAJIB tambah `gap-4` (atau minimal `gap-2`) di parent flex. **TIDAK perlu riset** — ini CSS fundamentals, bukan preferensi.

**Juga cek pattern serupa:** `<dl>` / `<dt>` / `<dd>` yang dipakai dengan `flex` tanpa vertical stacking fallback untuk mobile. Label dan value yang bersebelahan di `flex justify-between` WAJIB punya `flex-col sm:flex-row` fallback kalau value bisa panjang.

### Scan 9: Table Cell Without Horizontal Padding (Ditemukan dari UX-1 booking-lifecycle 4 Aug 2026)
```
grep -rn '<th\|<td' features/ --include="*.tsx" | grep -v 'px'
```
`<th>` dan `<td>` tanpa `px` (horizontal padding) menyebabkan text dari cell bersebelahan nempel langsung tanpa jarak. Pattern ini sering kelewat karena `py-3` atau `pb-2` sudah ada (vertical padding), tapi horizontal padding lupa ditambah. WAJIB tambah minimal `px-3` di semua `th` dan `td`. **TIDAK perlu riset** — ini HTML/CSS fundamentals.

### Scan 10: Component Variant Inconsistency (Ditemukan dari UX-1 booking-lifecycle 4 Aug 2026)
```
grep -rn 'Star\|star\|rating\|Rating' features/ --include="*.tsx" | grep -v 'test\|spec\|\.md'
```
Cari semua implementasi komponen sejenis (star rating, badge, card, button) dan bandingkan: apakah pakai icon library yang sama? Warna sama? Size sama? Interaksi sama? Multiple implementasi dari komponen yang seharusnya identik adalah sumber inkonsistensi visual dan behavioral.

**Contoh nyata yang ditemukan:** Star rating punya 3 implementasi berbeda — Lucide `<Star>` dengan `fill-yellow-400` (client review form), Unicode `★` dengan `bg-yellow-100` (consultant rating modal), Lucide `<Star>` dengan `fill-amber-400` (RatingStars display component). Warna, icon, dan interaksi semua beda.

### Scan 11: Query Param Read But Not Consumed (Ditemukan dari UX-1 booking-lifecycle 4 Aug 2026)
```
grep -rn 'searchParams\|searchParams' app/ --include="*.tsx" --include="*.ts"
```
Cek setiap page yang baca `searchParams` — apakah value-nya benar-benar dikonsumsi (dipass ke component, dipakai untuk fetch, dll) atau cuma di-read lalu diabaikan? Query param yang di-read tapi tidak dikonsumsi = broken flow (user klik link dengan param, tapi param tidak berpengaruh di destination page).

**Contoh nyata yang ditemukan:** `PackagePricingCard` link ke `?package=${pkg.id}`, booking page baca `s.package` set ke state `packageId`, tapi `packageId` tidak pernah dipass ke `<BookingFlow>` — user klik "Pilih Paket Standard" tapi di booking page harus pilih paket lagi dari awal.

### Scan 12: Missing Loading State (Riset: NN/g H1 Visibility of System Status, SaaS UX #41)
```
grep -rn 'loading\|isLoading\|setLoading' features/ --include="*.tsx" | grep -v 'Skeleton\|animate-spin\|animate-pulse\|skeleton'
```
Cek hasil grep — file yang sudah pakai `animate-pulse`/`animate-spin`/`Skeleton` sudah ada loading state yang baik. File yang pakai `isLoading`/`setLoading` TAPI tidak punya skeleton/spinner = loading state cuma text "Loading..." atau blank. Skeleton screen WAJIB untuk structural component (table, card, metric panel) — maintain spatial continuity dan reduce perceived wait time. Spinner boleh untuk inline action. Blank/berkedip = bug. **TIDAK perlu riset** — ini consensus UX, NN/g dan SaaS UX checklist sama.

### Scan 13: Missing aria-live pada Dynamic Feedback (Riset: WCAG 2.2 4.1.3 Status Messages)
```
grep -rn 'toast\|Toast\|notification\|Notification\|error.*message\|setError' features/ --include="*.tsx" | grep -v 'aria-live\|role="alert"\|role="status"'
```
Cek hasil grep — file yang sudah pakai `aria-live`/`role="alert"`/`role="status"` sudah accessible. File yang pakai toast/notification/setError TAPI tidak punya aria-live = dynamic feedback tidak accessible untuk screen reader user. Toast/notification/error message yang muncul dinamis WAJIB punya `aria-live` agar screen reader user tahu ada feedback. **Riset: WCAG 2.2 SC 4.1.3 Status Messages (Level AA).**

### Scan 14: Missing prefers-reduced-motion (Riset: WCAG 2.3.3 Animation from Interactions)
```
grep -rn 'motion\|animate\|transition\|framer' features/ --include="*.tsx" | grep -v 'prefers-reduced-motion\|test\|spec'
```
Project ini pakai Framer Motion (`motion/react`) dan memiliki **0 file** yang respect `prefers-reduced-motion`. User dengan vestibular disorder bisa mengalami motion sickness dari animasi yang tidak bisa di-disable. WAJIB tambah `@media (prefers-reduced-motion: reduce)` fallback atau Framer Motion `useReducedMotion()` hook. **Riset: WCAG 2.2 SC 2.3.3 Animation from Interactions (Level AAA, tapi best practice untuk AA).**

### Scan 15: Missing autoComplete pada Auth Forms (Riset: WCAG 2.2 3.3.8 Accessible Authentication)
```
grep -rn '<input' features/auth/ --include="*.tsx" | grep -v 'autoComplete'
```
Auth forms (`LoginForm`, `RegisterForm`, `forgotPassword`) tidak punya `autoComplete` attribute. Browser autofill tidak akan bekerja optimal — user harus manual ketik email/password setiap kali. WCAG 2.2 3.3.8 Accessible Authentication menyatakan: login tidak boleh depend pada memorization tanpa accessible alternative. Autofill adalah alternative tersebut. WAJIB tambah `autoComplete="email"`, `autoComplete="current-password"`, `autoComplete="new-password"`, dll. **Riset: WCAG 2.2 SC 3.3.8 Accessible Authentication (Level AA).**

### Scan 16: Missing maxLength pada Text Input (Riset: SaaS UX #53 Inline Validation)
```
grep -rn '<textarea\|<input type="text"' features/ --include="*.tsx" | grep -v 'maxLength\|maxlength'
```
Cek hasil grep — file yang sudah pakai `maxLength` sudah punya client-side length limit. File yang punya `<textarea>` atau `<input type="text">` TAPI tidak punya `maxLength` = tidak ada client-side length limit, bisa cause layout break (review 500 kata, bio 2000 karakter) dan tidak memberikan feedback sebelum submit. Zod schema mungkin validasi server-side, tapi user tidak tahu batas sampai submit gagal. WAJIB tambah `maxLength` yang sesuai dengan Zod schema. **Riset: SaaS UX #53, NN/g H5 Error Prevention.**

### Scan 17: Placeholder-Only Labels (Riset: SaaS UX #51, WCAG 2.2 1.3.1 Info and Relationships)
```
grep -rn 'placeholder=' features/ --include="*.tsx" | grep -v '<label\|htmlFor\|aria-label\|aria-labelledby'
```
Input yang cuma punya `placeholder` tanpa `<label>` adalah masalah karena: (1) placeholder hilang saat user mulai ketik — user kehilangan context, (2) screen reader tidak membaca placeholder sebagai label, (3) browser autofill tidak map field dengan benar. WAJIB setiap input punya `<label>` yang visible (di atas field, bukan di dalam). Floating label pattern acceptable. **Riset: SaaS UX #51, WCAG 2.2 SC 1.3.1 (Level A).**

### Scan 18: Drag Without Pointer Alternative (Riset: WCAG 2.2 2.5.7 Dragging Movements)
```
grep -rn 'onDrag\|draggable\|onDrop' features/ --include="*.tsx" | grep -v 'onClick\|onKeyDown\|onKeyPress'
```
WCAG 2.2 2.5.7 menyatakan: setiap fungsi yang pakai dragging WAJIB punya alternative dengan single pointer (click/tap). User dengan motor impairment mungkin tidak bisa drag. File upload dropzone sering drag-only — WAJIB punya "Browse file" button alternative. **Riset: WCAG 2.2 SC 2.5.7 Dragging Movements (Level AA, NEW in 2.2).**

### Scan 19: Modal useEffect Deps Trap (Ditemukan dari manual test UX-0 5 Aug 2026)
```
grep -rn "useEffect" components/ features/ --include="*.tsx" | grep -i "modal\|dialog\|drawer"
```
Cari Modal/Dialog/Drawer components yang punya `useEffect` dengan dependency array. Pattern bug: `useEffect(..., [open, onClose])` dimana `onClose` adalah function prop yang dibuat baru setiap parent render. Setiap parent re-render (misal: user ketik di form di dalam modal) → `onClose` reference berubah → useEffect re-run → focus lompat ke first focusable element → **user kehilangan focus dari input/textarea yang sedang diketik**. 

**Cek manual WAJIB:** buka modal yang punya form, ketik 1 huruf di textarea/input → apakah focus tetap di field itu? Kalau focus lompat ke elemen lain (biasanya first button), itu bug ini.

**Fix pattern:** hapus function props dari deps array, pakai `useCallback` di parent, atau pakai `useRef` untuk menyimpan latest callback. **TIDAK perlu riset** — ini React hooks pitfall yang documented (React docs: "useEffect dependency array should only contain reactive values").

### Scan 20: Toggle Knob Without Left Anchor (Ditemukan dari manual test UX-0 5 Aug 2026)
```
grep -rn "absolute.*translate-x\|translate-x.*absolute" features/ --include="*.tsx"
```
Cari toggle/switch components yang pakai `absolute` positioning dengan `translate-x` untuk knob movement. Pattern bug: knob pakai `absolute top-0.5` tapi **tidak punya `left-0` atau `left-0.5`** — tanpa anchor horizontal, browser default ke `auto` (center content), jadi knob mulai dari tengah button, bukan dari kiri. `translate-x` geser dari titik yang salah → **knob keluar dari button track**.

**Cek manual WAJIB:** klik toggle on/off → apakah knob tetap di dalam track? Kalau knob overflow atau posisi tidak simetris, itu bug ini.

**Fix pattern:** selalu pakai `left-0` atau `left-0.5` sebagai horizontal anchor, lalu `translate-x-[Npx]` untuk gerakan. Tambah `overflow-hidden` ke track sebagai safety. **TIDAK perlu riset** — ini CSS positioning fundamentals.

### Scan 21: Flex Fixed-Size Child Without shrink-0 (Ditemukan dari manual test UX-0 5 Aug 2026)
```
grep -rn "flex.*items-center\|flex.*gap" features/ --include="*.tsx" | grep "h-[0-9].*w-[0-9]"
```
Cari flex container yang punya child dengan fixed `h-*` dan `w-*` (misal: number circle, icon container, avatar) tetapi **tidak punya `shrink-0`**. Flex item default `flex-shrink: 1` — kalau container sempit (text panjang, viewport mobile), fixed-size child ke-squish dan kehilangan aspect ratio-nya. 

**Cek manual WAJIB:** di viewport mobile (375px), cek semua flex container yang punya fixed-size child + text — apakah child tetap maintain size-nya? Kalau circle jadi oval atau icon ke-squish, itu bug ini.

**Fix pattern:** tambah `shrink-0` ke setiap fixed-size flex child. **TIDAK perlu riset** — ini CSS flexbox fundamentals (`flex-shrink: 0` prevents shrinking).

### Scan 22: Playwright `waitForTimeout` Abuse (Audit Test Suite Quality 14 Aug 2026)
```
grep -rn "waitForTimeout" e2e/ --include="*.spec.ts"
```
Cari hardcoded `page.waitForTimeout()` di E2E test. Ini anti-pattern #1 menurut Playwright official docs, Currents.dev, dan QASkills 2026. Hard wait tidak menunggu state aplikasi — menunggu waktu fixed. Test jadi 2x lebih lambat + flaky di CI (slow network = timeout kelewat).

**Fix pattern:** ganti dengan `await expect(locator).toBeVisible()` atau `await expect(locator).toHaveText()`. Kalau menunggu API response, pakai `page.waitForResponse()`. Kalau menunggu state update, pakai `expect.poll()` atau `expect.toPass()`. **Sumber:** Playwright official docs (anti-patterns section), Currents.dev "Playwright Anti-Patterns" May 2026, QASkills 2026 guide.

### Scan 23: Playwright Serial Mode (Order-Dependent Tests) (Audit Test Suite Quality 14 Aug 2026)
```
grep -rn "test\.describe\.configure.*serial" e2e/ --include="*.spec.ts"
```
Cari `test.describe.configure({ mode: "serial" })` yang memaksa test jalan berurutan. Test dalam serial mode share state (bookingId, dll) dan bergantung urutan. Kalau test ke-3 fail, test ke-4 sampai ke-10 ikut fail (cascading failure). Tidak bisa run test tunggal dengan andal.

**Fix pattern:** setiap test create + cleanup data sendiri. Hapus serial mode. Pakai `beforeEach` untuk reset state. **Sumber:** Currents.dev "Tests That Depend on Execution Order", Playwright official docs "Test Isolation".

### Scan 24: Playwright CSS/XPath Selectors (Fragile Locators) (Audit Test Suite Quality 14 Aug 2026)
```
grep -rn "page\.locator(" e2e/ --include="*.spec.ts" | grep -v "getByRole\|getByLabel\|getByText\|getByTestId\|getByPlaceholder\|getByAltText\|getByTitle"
```
Cari selector yang pakai CSS class atau XPath (`div.rounded-xl`, `aside button:has(svg.lucide-bell)`, `div.absolute.right-0.top-full.z-50`). Selector ini break saat UI refactor, walaupun behavior tidak berubah. Playwright official docs: "Prefer user-facing attributes to XPath or CSS selectors."

**Fix pattern:** pakai `getByRole()`, `getByLabel()`, `getByText()`, atau `getByTestId()`. Kalau tidak ada role/label yang suitable, tambah `data-testid` ke komponen. **Sumber:** Playwright official docs (locators guide), Currents.dev "Fragile CSS Selectors", QASkills 2026.

### Scan 25: Playwright `networkidle` Usage (Audit Test Suite Quality 14 Aug 2026)
```
grep -rn "networkidle" e2e/ --include="*.spec.ts"
```
Cari `waitUntil: "networkidle"` atau `waitForLoadState("networkidle")`. Playwright official docs melarang ini untuk app dengan WebSocket, polling, atau analytics. Project ini punya Socket.IO + polling — `networkidle` bisa never fire atau fire di waktu unpredictable.

**Fix pattern:** ganti dengan `await expect(locator).toBeVisible()` atau `page.waitForResponse()`. **Sumber:** Playwright official docs, Currents.dev "Over-Reliance on waitForLoadState('networkidle')".

### Scan 26: Playwright Dev Mode Server (Audit Test Suite Quality 14 Aug 2026)
```
grep -n "npm run dev" playwright.config.ts
```
Cari `webServer.command` yang pakai `npm run dev`. Dev mode punya HMR, unoptimized images, extra React warnings, different hydration timing. Test yang pass di dev bisa fail di production.

**Fix pattern:** pakai `npm run build && npm run start` untuk CI. Dev mode boleh untuk local development dengan `reuseExistingServer: true`. **Sumber:** Next.js docs (production testing), Playwright docs (webServer config).

### Scan 27: Playwright No Auth Setup Project (Audit Test Suite Quality 14 Aug 2026)
```
grep -n "storageState\|setup.*project\|globalSetup.*auth" playwright.config.ts
```
Cari apakah ada auth setup project yang authenticate sekali dan save `storageState`. Kalau tidak, setiap test login via UI — waste ~3-5 detik per test + login flow bisa fail dan bikin test lain ikut fail.

**Fix pattern:** tambah setup project yang login sekali, save `storageState` ke file, lalu project lain pakai `storageState` itu. **Sumber:** Playwright official docs (authentication), QASkills 2026 "Authenticate Once with a Setup Project".

### Scan 28: Playwright `workers: 1` (Disabled Parallelism) (Audit Test Suite Quality 14 Aug 2026)
```
grep -n "workers:" playwright.config.ts
```
Cari `workers: 1` yang memaksa semua test jalan sequential. Currents.dev: "Disabling Parallelism to Hide Isolation Problems." Full E2E suite butuh ~40 menit dengan 1 worker, vs ~10 menit dengan 4 workers.

**Fix pattern:** fix test isolation dulu (Scan 23), lalu enable `workers: process.env.CI ? 4 : 2`. Jangan enable parallelism sebelum isolation fix — akan expose hidden state sharing bugs. **Sumber:** Currents.dev, Playwright official docs (parallelism).

### Anti-Pattern List yang Bisa Tumbuh
List scan di atas bukan daftar tertutup. Kalau saat walkthrough manual ditemukan anti-pattern baru yang text-based dan bisa di-grep (misal: inconsistent placeholder text, missing `rel="noopener"` di external link, hardcoded color hex instead of design token), **WAJIB tambahkan ke list ini** sebagai scan baru untuk flow berikutnya. Format: nama scan + grep command + kenapa anti-pattern + butuh riset atau tidak.

### Visual Consistency Checklist (untuk Playwright Visual Snapshot)
Saat melakukan visual snapshot di Tahap UX-0 atau UX-1, gunakan checklist berikut untuk setiap pasangan halaman yang dibandingkan. Tidak boleh dilewati — cek SETIAP item:

- [ ] **Button styling** — primary/secondary/ghost variant konsisten? Same padding, border-radius, font-size?
- [ ] **Card styling** — border-radius, shadow, padding, border color konsisten antar card sejenis?
- [ ] **Spacing pattern** — gap antar section, gap antar elemen dalam card, margin pattern konsisten?
- [ ] **Typography hierarchy** — heading size ratio, body text size, label size konsisten antar halaman?
- [ ] **Icon size** — icon di button, icon di card header, icon di nav konsisten?
- [ ] **Color usage** — primary color untuk action utama, secondary untuk action sekunder, status color (success/warning/error) konsisten?
- [ ] **Form input styling** — border, border-radius, focus ring, error state konsisten antar halaman?
- [ ] **Empty state pattern** — illustration + message + CTA format konsisten?
- [ ] **Loading state** — skeleton vs spinner usage konsisten?
- [ ] **Mobile layout** — sidebar → drawer/bottom nav pattern, touch target size, content reflow konsisten?

Setiap inkonsistensi yang ditemukan WAJIB dibarengi screenshot evidence (nama file + halaman + viewport).

## Riset & Referensi untuk Rekomendasi UX

**Riset WAJIB untuk SEMUA rekomendasi Kategori B, bukan cuma yang ambigu.** Beda dari versi sebelumnya yang cuma wajibkan riset untuk keputusan genuinely ambigu — sekarang SETIAP rekomendasi UX harus grounding ke referensi nyata, karena tujuannya bukan cuma "fix yang rusak" tapi "kasih solusi terbaik dari terbaik".

**Yang TIDAK perlu riset:** bug objektif (Kategori A) yang sudah jelas salah dari heuristik yang ada (CRAP, Fitts's Law, Consistency, dll) — itu buang waktu.

**Yang WAJIB riset:** setiap rekomendasi Kategori B (advisory), termasuk yang tidak ambigu. Tujuannya: bukan cuma membenarkan "ini lebih baik", tapi memastikan "ini adalah pendekatan TERBAIK yang available", bukan pendekatan pertama yang terpikir.

Sumber referensi yang qualified (urut prioritas):
1. **Design system established** — Material Design, Atlassian Design System, Apple HIG, Polaris (Shopify), Carbon (IBM) — untuk komponen/pattern spesifik
2. **Usability research** — Nielsen Norman Group, Baymard Institute, UX Patterns Guide — untuk heuristik dan data-driven recommendation
3. **Pattern library production** — SaaSUI, shadcn/ui blocks, Nextcraft — untuk contoh implementasi nyata di produk sejenis
4. **Artikel UX professional** — yang merujuk ke research/study, bukan opini blog random

### Tabel Riset per-Kategori Temuan (Bukan Generic)

Daripada "riset dari web" yang terlalu vague, gunakan tabel berikut untuk tahu **APA yang harus diriset** untuk setiap jenis temuan:

| Kategori Temuan | Riset Ke Sumber Ini | Cari Pattern/Angka Spesifik |
|---|---|---|
| Capitalization & copy standards | Material Design Typography Guidelines, Apple HIG Capitalization Rules, Chicago Manual of Style | Title case vs sentence case convention untuk UI labels |
| Breadcrumb navigation | SaaSUI Navigation Patterns, Polaris Breadcrumb component, Atlassian Design System Breadcrumbs | Breadcrumb hierarchy depth, link target conventions, mobile breadcrumb pattern |
| AI slop patterns | "stop-slop" skill (lihat `.devin/skills/`), artikel UX tentang AI-generated text patterns | Common AI text tells: em dash, "delve into", "leverage", "seamless", "robust" |
| Empty state design | NN/G Empty States research, Baymard Institute Empty State Guidelines | 3-element pattern (context + direction + CTA), illustration tone, tone of voice |
| Loading state (skeleton vs spinner) | NN/G Loading Performance research, Lukas Wolschlager "The Design of Loading" | When to use skeleton vs spinner, perceived wait time, animation timing |
| Mobile navigation pattern | Nextcraft SaaS Dashboard Patterns, Material Design Navigation Patterns | Bottom tab bar vs drawer, touch target sizing, hamburger placement |
| Trust signals in checkout | Baymard Checkout Usability research, NN/G Trust Signals in E-commerce | Security badge placement, "Pembayaran Aman" copy, encryption icon position |
| Form & input UX | NN/G Form Design Guidelines, Polaris Form Patterns, Baymard Form Usability | Field grouping, error message placement, required field indicators |
| Color & contrast | WCAG 2.1 SC 1.4.3 Contrast (Minimum), WebAIM Contrast Checker | Minimum contrast ratio 4.5:1 untuk text, 3:1 untuk large text/UI components |
| Keyboard navigation | WCAG 2.1 SC 2.1.1 Keyboard, WCAG 2.1 SC 2.4.3 Focus Order | Tab order, focus indicator visibility, skip link pattern |
| Information Architecture | NN/G IA research, "Information Architecture for the Web" by Donna Spencer | Navigation grouping by user goal, flat vs hierarchical, label clarity |
| Responsive layout | Material Design Responsive Layout Grid, TailwindCSS Breakpoint System | Breakpoint conventions, content reflow, touch target sizing per breakpoint |

**Kalau kategori temuan tidak ada di tabel ini**, cari sumber yang paling qualified dari list 4 sumber di atas. Kalau tetap tidak nemu, WAJIB nyatakan eksplisit: "rekomendasi ini tidak punya referensi established, berdasarkan penilaian profesional saya".

Sebutkan sumber referensi yang dipakai di laporan Kategori B (bukan cuma "menurut saya sebaiknya begini"). Kalau tidak nemu referensi yang qualified untuk suatu rekomendasi, WAJIB nyatakan eksplisit: "rekomendasi ini tidak punya referensi established, berdasarkan penilaian profesional saya" — jangan pura-pura ada backing kalau tidak ada.

## Resolusi Kendala Teknis Sendiri (Selama UX Walkthrough)

**Kalau ada halaman/komponen yang tidak bisa diakses/di-screenshot** (gagal load, butuh re-login, error sementara, dll) — JANGAN langsung lapor dan berhenti. Coba dulu resolusi wajar sendiri: retry, cek console error, cek apakah butuh re-autentikasi, tunggu loading lebih lama. **Hanya laporkan kalau setelah usaha wajar tetap tidak bisa diakses** — itu baru jadi blocker genuine yang perlu diketahui user.

**DB State Setup (WAJIB untuk page yang butuh specific booking/session state):** Banyak page di project ini butuh specific DB state untuk diakses — misal: session room butuh booking `IN_PROGRESS`, report page butuh booking `COMPLETED`, review page butuh booking `COMPLETED` tanpa review existing. Kalau page tidak bisa diakses karena DB state tidak sesuai:
1. **Identifikasi** page state yang dibutuhkan (baca route handler / page component untuk tau condition apa yang harus true).
2. **Buat Prisma script** (`__set-[state].ts` di root project) untuk set booking/session ke state yang dibutuhkan. Gunakan pattern: `import { PrismaClient } from "./lib/generated/prisma/client"` + `import { PrismaPg } from "@prisma/adapter-pg"`.
3. **Jalankan script** via `npx tsx __set-[state].ts`.
4. **Akses page** lewat Playwright MCP.
5. **Setelah selesai, restore DB state** ke kondisi semula via script restore.
6. **Hapus temp script** setelah selesai — jangan tinggalkan file `__*.ts` di root project.

**JANGAN skip page hanya karena tidak bisa diakses di first try.** Buat script, set state, akses page. Kalau setelah itu tetap gagal, baru lapor sebagai blocker.

**Laporan akhir WAJIB ringkas dan fokus ke yang penting** — jangan laporkan proses/progress rutin (retry berhasil, halaman X aman-aman saja setelah dicoba ulang). Laporan cukup berisi: temuan yang genuinely perlu diketahui/diputuskan user, dan blocker yang genuinely tidak bisa diselesaikan sendiri. Detail proses penyelesaian kendala teknis kecil tidak perlu masuk laporan utama.

## UX Walkthrough — Aktivitas Terpisah dari Audit Fungsional Biasa

**Beda dari Tahap 1 (audit fungsional) dan Kategori A/B (observasi visual pas kebetulan ambil screenshot):** UX Walkthrough adalah Devin BENERAN mencoba menyelesaikan tugas realistis dari flow yang sedang dievaluasi, seperti user pertama kali pakai — bukan cuma menganalisis code atau melihat screenshot statis, tapi benar-benar klik-klik lewat MCP Playwright dan mencatat SENDIRI di mana muncul kebingungan/friksi, dari sudut pandang pengguna.

**Cara kerja:**
1. Pilih 1 tugas realistis yang representatif untuk flow ini (contoh: "consultant membuat jadwal ketersediaan baru", bukan cuma "buka halaman jadwal").
2. Coba selesaikan tugas itu dari awal sampai akhir lewat MCP Playwright, TANPA membaca dulu code implementasinya — supaya benar-benar mensimulasikan first-time user, bukan orang yang sudah tahu logic-nya.
3. Catat SETIAP titik dimana Devin sendiri harus berhenti/bingung/nebak-nebak apa yang harus dilakukan, istilah yang tidak jelas maknanya, atau opsi yang seharusnya ada tapi tidak ditemukan.
4. Setelah selesai (atau gagal menyelesaikan), analisis kenapa titik-titik itu terjadi — rujuk ke heuristik di atas.
5. **Verifikasi sebelum klaim** — kalau mau melaporkan "komponen X tidak ada", WAJIB cek code dulu (grep, read file) untuk konfirmasi benar-benar tidak ada, bukan cuma karena tidak terlihat di screenshot. Komponen mungkin ada tapi tidak ter-render di page tertentu, atau collapsed/hidden. Laporkan kondisi aktual ("tidak ter-render di page X" vs "tidak ada sama sekali"), bukan asumsi.
6. **Pikirkan versi TERBAIK untuk setiap temuan** — untuk SETIAP titik friksi/issue yang ditemukan, jangan cuma pikirkan "cara memperbaiki". Pikirkan: "kalau saya mendesain ini dari awal sebagai UX designer senior, apa versi terbaiknya?" Riset referensi (lihat section "Riset & Referensi untuk Rekomendasi UX") untuk setiap rekomendasi, bukan cuma yang ambigu. Tujuannya: solusi terbaik dari terbaik, bukan solusi pertama yang terpikir.
7. **Analisis Information Architecture (IA)** — sebagai bagian wajib walkthrough, periksa: (1) sidebar/navigation grouping — apakah item dikelompokkan by user goal atau flat list? (2) active state distinctness — apakah current page cukup menonjol? (3) mobile nav pattern — apakah pattern-nya appropriate untuk SaaS? (4) label clarity — apakah istilah sesuai user mental model? Lihat checklist IA di section "Kelengkapan Struktural" di atas untuk detail.

**Temuan dari walkthrough ini WAJIB dipisah berdasarkan jenis, treatment beda-beda:**
- **Perbaikan UI kecil yang jelas salah** (kayak footer salah posisi, layout tidak fit) → Kategori A, fix langsung + lapor, sama seperti biasa.
- **Fitur/opsi yang ternyata kurang** (kayak tidak ada opsi tambah slot manual) → JANGAN otomatis dianggap butuh approval. Gunakan kriteria khusus UX Walkthrough ini (lebih longgar dari trivial/signifikan biasa di Tahap 4, karena konteksnya perbaikan UX proaktif, bukan penemuan bug/gap fungsional):

  **Boleh GAS langsung, implementasikan seperti UI/UX designer proaktif (TIDAK perlu approval dulu):**
  - Tidak mengubah data model/skema database.
  - Tidak menyentuh business logic finansial/keamanan.
  - Cost implementasi kecil (bukan redesign besar/banyak file yang saling terkait).
  - Tidak konflik dengan pattern desain yang sudah ada di tempat lain (tidak butuh keputusan "mana yang benar" di antara beberapa pendekatan).
  - Reversible dengan mudah kalau ternyata kurang tepat.
  
  Contoh: menambahkan opsi "buat slot manual" di sebelah opsi "buat slot berulang" yang sudah ada, memperjelas label yang membingungkan, menambah empty state yang informatif — ini semua boleh langsung dikerjakan, laporkan sesudahnya (bukan sebelum).

  **WAJIB approval dulu (pakai format opsi solusi seperti biasa):**
  - Butuh ubah data model/skema database.
  - Menyentuh business logic/finansial (misal: mengubah cara sistem menghitung/memvalidasi paket harga).
  - Cost implementasi besar (redesign signifikan, banyak file saling terkait).
  - Ada 2+ pendekatan dengan trade-off yang genuinely tidak jelas mana yang lebih baik — butuh keputusan produk, bukan cuma soal UX.

  **Kalau ragu masuk kategori mana, default ke WAJIB APPROVAL** — sama seperti prinsip default-ke-aman di bagian lain dokumen ini.
- **Istilah/copy yang membingungkan** (kayak "paket" tidak jelas maksudnya) → catat sebagai temuan Kategori B (advisory), kasih opsi rewording.

**Di luar scope dokumen ini (tidak applicable untuk QA/QC atas code yang sudah jadi):** UX research & strategy, wireframing, prototyping, user journey mapping — itu semua proses SEBELUM implementasi, harus dilakukan di fase desain terpisah, bukan sesuatu yang bisa "diaudit mundur" dari code yang sudah ada.

Format observasi Kategori B tetap sama seperti opsi solusi audit (beberapa opsi + trade-off, bukan satu rekomendasi mutlak), ditandai eksplisit **"Catatan UX (opsional, bukan bug)"**:
- **Observasi**: apa yang diperhatikan
- **Prinsip yang dilanggar**: sebutkan eksplisit (misal "melanggar Fitts's Law — tombol konfirmasi terlalu kecil untuk aksi sepenting ini") dan/atau rujukan ke `design-taste.md`
- **Opsi perbaikan** (kalau ada lebih dari satu pendekatan): trade-off masing-masing
- **Prioritas**: nice-to-have, user yang putuskan

## Definisi "Selesai" untuk UX Walkthrough Satu Flow

Beda dari Definisi Selesai flow fungsional (E2E/Vitest) di atas. UX Walkthrough satu flow baru dianggap selesai (kolom "Track C" di `reports/status.md` diisi "Done") kalau:
- Tahap UX-1 (Audit) sudah dilakukan — task-completion walkthrough sudah dicoba, screenshot "before" sudah tersimpan untuk setiap temuan.
- Semua temuan yang butuh approval sudah diputuskan (approve/tolak), bukan menggantung.
- Tahap UX-2 (Fix) sudah dieksekusi untuk semua temuan yang di-approve DAN yang GAS-fix.
- **Tahap UX-3 (Verify) sudah dilakukan untuk SEMUA temuan** — termasuk yang GAS-fix, bukan cuma yang approval. Setiap temuan berstatus VERIFIED (bukan cuma FIXED), dengan bukti before/after screenshot.
- Kalau flow ini punya baseline `toHaveScreenshot()` (Kelas Blind Spot ke-6) yang terdampak, baseline itu sudah diupdate dan test regresinya sudah dikonfirmasi jalan normal lagi.

**Status "Selesai" TIDAK BOLEH diberikan kalau ada temuan yang masih OPEN atau FIXED-tapi-belum-VERIFIED** — sama seperti prinsip di Track fungsional, jangan klaim selesai tanpa bukti eksplisit.

## Definisi "Selesai" untuk UX-0 (Cross-Flow Sweep)

UX-0 dianggap selesai kalau:
- Screenshot cleanup sudah dijalankan (semua file di reports/screenshots/ sudah mengikuti konvensi penamaan).
- Layer 1 (grep): SEMUA 6 scan sudah dijalankan, hasil tercatat di laporan.
- Layer 2 (visual snapshot): screenshot sudah diambil di 3 viewport untuk setiap flow, inkonsistensi tercatat.
- Layer 3 (interaction spot-check): sudah dijalankan untuk setiap flow, temuan tercatat.
- Laporan tersimpan di `reports/cross-audits/cross-flow-ux-sweep.md` dengan format yang sudah didefinisikan di EXECUTION_GUIDE.
- **UX-0 TIDAK termasuk eksekusi fix** — fix dilakukan setelah user approve batch fix, terpisah dari UX-0. UX-0 selesai = laporan selesai, bukan fix selesai.

## Definisi "Selesai" untuk UX-0.5 (Functional Completeness Sweep)

UX-0.5 dianggap selesai kalau:
- Persona-Needs Matrix sudah dibuat untuk SEMUA role (Client, Consultant, Admin)
- SEMUA 6 kategori gap sudah dicek untuk setiap role
- Setiap gap sudah di-cross-reference dengan code (bukan cuma asumsi "tidak ada")
- 7 pertanyaan Senior UX Designer Mindset sudah dijawab untuk setiap role
- Laporan tersimpan di `reports/cross-audits/functional-completeness-sweep.md`
- **UX-0.5 TIDAK termasuk eksekusi fix** — fix dilakukan setelah user approve, terpisah dari UX-0.5. UX-0.5 selesai = laporan selesai, bukan fix selesai.

## Vitest Quality Audit (Track B — Optional, dipicu dari Track A Track Gate)

Track A (Functional Testing) ngecek "apakah sistem jalan?" — ngetest function dan lihat PASS/FAIL. Track B (Vitest Deep Dive) ngecek "apakah test ITU SENDIRI berkualitas?" — apakah test itu valuable, atau cuma noise yang memberikan false sense of security.

Test yang gaguna lebih berbahaya dari tidak ada test, karena membuat tim berpikir sudah aman padahal tidak. Test yang happy-path-only, assertion shallow, atau test trivial things tapi miss business logic kompleks = false security.

### Senior Test Engineer Mindset (WAJIB untuk Vitest Quality Audit, 100 tahun pengalaman)

Jangan cuma ngecek "test pass" — tanyakan:
1. **"Apakah test ini benar-benar membuktikan klaimnya?"** — kalau function under test di-break, apakah test FAIL? Kalau tidak, test tidak valuable.
2. **"Apakah test ini ngetest behavior yang penting, atau hal trivial?"** — getter/setter tanpa logic = tidak perlu test. Business logic kompleks = WAJIB ada test.
3. **"Apakah edge case ter-cover?"** — empty, null, boundary value, special character, concurrency. Happy path saja = tidak cukup.
4. **"Apakah assertion cukup dalam?"** — cek value spesifik, bukan cuma "tidak error" atau "ada return".
5. **"Apakah test ini duplicative dengan E2E?"** — kalau E2E sudah ngetest hal yang sama dengan value tambahan (UI interaction), apakah vitest version masih perlu?
6. **"Apakah test ini akan flaky di CI?"** — depend on timing, shared state, test order, atau external service? Flaky test mengurangi kepercayaan terhadap seluruh suite.
7. **"Kalau saya hapus test ini, apa yang hilang?"** — kalau jawabannya "tidak ada", test itu tidak valuable. Hapus.

**Prinsip tambahan:**
- **Test yang tidak catch bug adalah liability, bukan asset.** Hapus atau rewrite test yang tidak valuable.
- **Coverage percentage adalah vanity metric.** 100% coverage dengan shallow assertion = 0% confidence. Mutation score yang penting. Target mutation score per criticality: CRITICAL (payment, auth, booking logic) ≥80%, HIGH (notification, review, admin actions) ≥70%, MEDIUM (consultant profile, session logic) ≥60%, LOW (utility, formatting) ≥50%. Source: StrykerJS benchmark 2025-2026 — 75-90% healthy, <60% poor.
- **Test harus isolated dan deterministic.** Test yang depend on test order, shared state, atau timing = test yang akan flaky.
- **Jangan test implementation detail yang tidak matter.** Test behavior, bukan implementation.
- **Setiap test harus punya satu alasan untuk FAIL.** Test yang bisa FAIL karena banyak alasan = susah di-debug.

### Kategori Klasifikasi Test File (Universal)

Setiap vitest file WAJIB diklasifikasikan ke salah satu:

- **✅ VALUABLE** — test ngetest business logic penting dengan assertion bermakna (bukan cuma happy path). Test akan FAIL kalau function break.
- **⚠️ SHALLOW** — test ada tapi assertion dangkal: happy path only, trivial assertion (cek "tidak error" bukan cek value), tidak test edge case.
- **❌ USELESS** — stub/dummy test (`expect(true).toBe(true)`), test hal trivial (getter/setter tanpa logic), test yang tidak ngetest apapun.
- **🗑️ OUTDATED** — test ngetest function yang udah gak dipakai, udah berubah behavior, atau import path broken.
- **📝 MISSING** — feature/function penting yang TIDAK punya vitest sama sekali.

### Kategori Gap yang WAJIB Dicek (Universal)

**1. Stub & Dummy Test Detection**
- `expect(true).toBe(true)` atau assertion yang selalu true
- Test yang hanya import function tapi tidak memanggilnya
- Test yang `describe` tanpa `it`/`test` block
- Test yang `it.skip` / `test.skip` tanpa alasan documented
- Referensi: Kent C. Dodds — "A test that doesn't test anything is worse than no test"

**2. Shallow Assertion Detection**
- Assertion hanya cek "tidak throw" bukan cek value benar
- Assertion hanya cek "ada return" bukan cek return value spesifik
- Happy path only — tidak ada error case, edge case, boundary value
- Test yang `expect(result).toBeDefined()` tanpa cek property spesifik
- Referensi: Martin Fowler — "Tests should assert specific outcomes, not just absence of errors"

**3. Missing Edge Case Coverage**
- Boundary value: empty string, null, undefined, very long input, special character
- Error case: input invalid, API gagal, race condition, concurrent access
- State transition: initial state → mid-state → final state
- Referensi: IEEE 829 — Test documentation standard, boundary value analysis

**4. Outdated Test Detection**
- Import path yang broken (function udah dipindah/renamed)
- Function yang udah gak dipakai (grep usage → 0 hit)
- Test yang ngetest behavior lama yang udah berubah
- Mock yang tidak match implementasi terkini
- Referensi: Martin Fowler — "Test rot: tests that become unreliable over time"

**5. Coverage Gap Analysis**
- Function penting di `features/*/services/` yang tidak punya test
- Utility function di `lib/` yang tidak punya test
- Schema validation (Zod) yang tidak punya test
- API route handler yang tidak punya test
- Referensi: Test Pyramid — unit test untuk logic murni, integration test untuk API, E2E untuk user flow

**6. Duplicasi dengan E2E**
- Test yang ngetest hal yang sama dengan E2E Playwright
- Kalau duplicative: apakah vitest version memberikan value tambahan (lebih cepat, lebih presisi)?
- Kalau tidak ada value tambahan → kandidat untuk dihapus atau disederhanakan
- Referensi: Kent C. Dodds — "Don't test the same thing in multiple layers unless each layer adds unique value"

**7. Over-Mocked Test Detection**
- Test yang mock setiap collaborator dan cuma assert mock dipanggil dengan argumen spesifik — mutating actual logic between calls = invisible
- Test yang tidak assert observable outcomes, hanya assert internal call patterns
- High mutation scores correlate with tests that assert on observable outcomes, bukan internal call patterns
- Referensi: StrykerJS research 2025-2026 — "over-mocked tests punya mutation score terendah"

**8. Test Order Dependency**
- Test yang pass kalau run berurutan, fail kalau run acak (Vitest default parallel)
- Test yang modify global/shared state tanpa cleanup di afterEach/afterAll
- Test yang depend pada test sebelumnya untuk setup state
- Referensi: Martin Fowler — "Test isolation is non-negotiable"

**9. Shared State Leakage**
- Test yang modify global/shared state (database, cache, env) tanpa cleanup
- Test berikutnya dapat state polluted → flaky atau false positive
- Deteksi: run test suite dengan `--shuffle` atau `--randomize` — kalau ada yang fail, ada shared state dependency
- Referensi: IEEE 829 — test isolation requirement

**10. Assertion-Free Test**
- Test yang exercise code tapi tidak ada assertion (just "doesn't throw")
- Test dengan `expect(result).toBeDefined()` tanpa cek property spesifik
- Test yang hanya cek "tidak error" bukan cek value benar
- Referensi: Kent C. Dodds — "A test without an assertion is just a function call"

**11. Magic Numbers in Assertions**
- Assertion dengan literal value yang tidak dijelaskan kenapa angka itu (misal `expect(result).toBe(150000)` tanpa comment/test name yang explain)
- Susah debug saat fail — reviewer tidak tau apakah angka salah atau test salah
- Deteksi: review assertion dengan literal number/string, tanya "kenapa angka ini?"
- Referensi: Clean Code — "magic numbers should be named"

**12. Test Logic in Production Code**
- `if (process.env.NODE_ENV === 'test')` branch di production code yang cuma serve test
- Conditional logic di production code yang hanya executed during testing
- Deteksi: grep `NODE_ENV.*test`, `process.env.*TEST`, `__test__` di production code (bukan test files)
- Referensi: Testing Pyramid anti-pattern — "production code should not know about tests"

### Cara Eksekusi Vitest Quality Audit

### Criticality Dimension (WAJIB untuk VB-0 prioritization)

Setiap test file WAJIB diberi tag criticality:
- **CRITICAL**: payment, auth, booking logic (bug = uang hilang / unauthorized access)
- **HIGH**: notification, review, admin actions (bug = wrong state / data integrity)
- **MEDIUM**: consultant profile, session logic (bug = UX degradation)
- **LOW**: utility, formatting, display helper

Priority matrix: **Criticality × Test Quality**. Critical + Shallow = fix pertama. Low + Shallow = fix terakhir.

### Mutation Testing Tooling

**StrykerJS** (`@stryker-mutator/core` + `@stryker-mutator/vitest-runner`) adalah industry standard untuk JS/TS mutation testing. Keunggulan:
- Otomatis: generate ratusan mutant (boundary, boolean, return value, statement removal)
- Reproducible: hasil bisa di-track over time
- HTML report: drill-down ke setiap surviving mutant, persis baris mana yang test tidak catch
- Vitest runner dengan `coverageAnalysis: "perTest"` — hanya run test yang cover line yang di-mutate

Manual mutation testing (ubah code, run test, cek FAIL) masih valid sebagai quick check di VB-1, tapi StrykerJS WAJIB untuk VB-3 verification yang thorough. Untuk project skala ini, jalankan StrykerJS per-file critical, bukan full suite (performance concern).

**Setup StrykerJS (kalau dipilih):**
- Install: `npm i -D @stryker-mutator/core @stryker-mutator/vitest-runner`
- Config: `stryker.conf.json` dengan `testRunner: "vitest"`, `coverageAnalysis: "perTest"`, `thresholds.break: 60`
- Jalankan: `npx stryker run` (full) atau `npx stryker run --mutate features/payment/services/duitku.ts` (per-file)
- Mutation score target lihat prinsip tambahan di atas (CRITICAL ≥80%, HIGH ≥70%, MEDIUM ≥60%, LOW ≥50%)

### Test Maintainability Dimension (WAJIB dicek di VB-1)

Selain "valuable" (apakah test catch bug), WAJIB cek "maintainable" (apakah test mudah dirawat):
- **Brittle assertions** — test implementation detail yang bisa berubah tanpa behavior berubah (e.g., "function dipanggil 3 kali")
- **Excessive setup** — test butuh >20 baris setup untuk 1 assertion. Susah baca, susah modify.
- **Test duplication** — same setup di-repeat across multiple tests tanpa shared fixtures. Kalau setup berubah, harus update banyak test.
- **Snapshot abuse** — `toMatchSnapshot()` untuk object kompleks yang tidak dibaca manusia. Snapshot yang tidak pernah di-review = noise.

Test bisa valuable tapi unmaintainable = tetap masalah. Tandai sebagai temuan terpisah di VB-1.

### Test Suite Performance Tracking (WAJIB dicatat di VB-0)

Catat execution time per file di VB-0. File dengan >5s execution = candidate untuk optimize atau parallelize. Target: full `npx vitest run` < 60 detik. Kalau test suite lambat, tim akan skip run test = test suite menjadi liability.

### Next.js App Router Testing Boundary (WAJIB untuk KonsulExpert)

KonsulExpert pakai Next.js 16+ App Router. Ada boundary tegas antara apa yang bisa di-test dengan Vitest vs Playwright. Boundary ini ditentukan oleh `await` di async Server Component.

**Aturan boundary:**

| Component Type | Tool | Environment | Catatan |
|----------------|------|-------------|--------|
| Client Component (`"use client"`) | Vitest + RTL | jsdom | Full render support, fast feedback |
| Sync Server Component | Vitest + RTL | jsdom | Tidak ada async/await, render sebagai function biasa |
| **Async Server Component** | **Playwright E2E** | Real browser | Vitest TIDAK BISA render async RSC. `await` = boundary line. |
| Server Actions | Vitest (logic) + Playwright (integration) | node/jsdom | Test business logic di Vitest, test form submission di Playwright |
| Route Handlers (`route.ts`) | Vitest direct invocation | node | Mock Prisma, test request/response handling |
| Full user flows | Playwright | Real browser | Real network, real rendering |

**Yang WAJIB di-mock untuk Vitest (sudah di vitest.setup.ts):**
- `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`, `redirect`)
- `next/headers` (`cookies()`, `headers()`)
- Prisma client (per test file, untuk service tests)

**Referensi:** codewithseb.com, nextjslaunchpad.com, sitepoint.com, devcheolu.com, stacknotice.com (5 sources konfirm 2026).

### Server Action Test Matrix (WAJIB untuk protected server actions)

Setiap server action yang protected WAJIB di-test dengan 4 scenario (codewithseb.com pattern):

1. **Anonymous** (no auth) → should reject dengan 401/403
2. **Invalid input** → should validate dan reject dengan error message spesifik
3. **Wrong owner** (IDOR test) → user A tidak bisa modify resource user B
4. **Admin override** → admin bisa akses resource manapun

4 test ini run dalam milliseconds, catch IDOR-shaped bugs yang sering lolos ke production. IDOR = Insecure Direct Object Reference, salah satu OWASP Top 10.

### 9 Test Suite Health Indicators + Trade-off Awareness (McMinn et al. ICSE 2025)

Test suite health bukan cuma flakiness. Ada 9 indikator yang WAJIB dipantau (McMinn, Roslan, Kapfhammer, ICSE 2025):

| # | Indikator | Sudah di rules? | Deskripsi |
|---|-----------|-----------------|-----------|
| I0 | Flakiness | ✅ (Mergify patterns) | Test pass/fail tidak deterministic |
| I1 | Low Code Coverage | ✅ (coverage config) | Region code tidak di-execute test |
| I2 | **Pseudo-Testedness** | ❌ BARU | Code di-execute tapi bisa dihapus tanpa test FAIL. Eksekusi tanpa assertion. |
| I3 | Low Mutation Score | ✅ (StrykerJS) | Test tidak sensitive terhadap fault |
| I4 | Long-Running Suite | ✅ (performance tracking) | Test suite lambat → developer skip run |
| I5 | **Low Test Diversity** | ❌ BARU | Test menjalankan program path yang sama berulang |
| I6 | High Brittleness | ⚠️ (maintainability) | Test coupled ke implementation, break saat refactor |
| I7 | **Low Realism** | ❌ BARU | Test mock terlalu banyak, tidak realistis dengan production |
| I8 | **High Variability** | ❌ BARU | Indikator health berubah signifikan antar run tanpa code change |

**Trade-off antar indikator (WAJIB dipahami, bukan di-ignore):**
- ↓Flakiness ↔ ↑Pseudo-testedness: Test dengan fewer assertions = less flaky TAPI more pseudo-tested
- ↑Mutation score ↔ ↑Brittleness: Test yang tightly coupled ke implementation = high mutation TAPI brittle
- ↑Speed (mocking) ↔ ↓Realism: Mock untuk speed = test tidak realistis dengan production behavior
- ↑Assertions ↔ ↑Flakiness: More assertions = more chance untuk flaky karena more things to break

**Aturan praktis:** Jangan optimize 1 dimensi dengan blind. Kalau tambah assertions untuk kill mutation, cek apakah assertions itu brittle atau tidak. Kalau mock untuk speed, cek apakah test masih realistis.

### Risk-Based Testing Tier System (Upgrade dari Criticality Dimension)

Criticality dimension di-upgrade menjadi full risk-based tier system (TestRail, qtrl.ai, TestMatick, Rex Black, testingmind.com — 5 sources konfirm 2026).

**Risk Score = Impact × max(Technical, Historical)**

- **Impact** (1-5): How badly failure affects users/revenue
- **Technical** (1-5): Likelihood of failure based on complexity, dependencies, code churn
- **Historical** (1-5): Frequency of past defects in this module

**3-Tier Execution Cadence:**

| Tier | Risk Score | Cadence | Coverage Approach |
|------|-----------|---------|-------------------|
| T1 — Critical | 15-25 | Every PR | Deep: full functional, edge cases, negative paths, regression, mutation testing |
| T2 — Significant | 8-14 | Nightly/release | Standard: happy path + key negative scenarios |
| T3 — Low | 1-7 | Weekly/pre-release | Light: smoke/sanity only |

**Effort allocation:** T1 = 60-70% effort, T2 = 20-30%, T3 = 10%.

**Risk matrix untuk KonsulExpert (baseline, reassess setiap major release):**

| Module | Impact | Technical | Historical | Score | Tier |
|--------|--------|-----------|------------|-------|------|
| Payment (Duitku) | 5 | 4 | 3 | 20 | T1 |
| Auth (NextAuth) | 5 | 3 | 2 | 15 | T1 |
| Booking logic | 5 | 4 | 3 | 20 | T1 |
| Admin dashboard | 3 | 3 | 2 | 9 | T2 |
| Consultant profile | 3 | 2 | 2 | 6 | T2 |
| Notification | 2 | 2 | 1 | 4 | T3 |
| FAQ/Home | 1 | 1 | 1 | 1 | T3 |

**Reassessment:** Review risk map setiap major release atau monthly. Look at: production bugs yang escape, code churn per module, tests yang catch real issues vs yang cuma run green.

### Vitest-Specific Flaky Patterns (Mergify 2026, Sub-Bullet untuk Kategori 8-9)

8 pattern spesifik Vitest yang cause flaky tests. Ini detail dari kategori 8 (Test Order Dependency) dan 9 (Shared State Leakage):

**Kategori 8 sub-patterns (Test Order Dependency):**
- 8a. **Thread-pool state leakage** — module-scope mutable state survive between tests in same worker thread. Fix: `pool: 'forks'` di vitest.config.ts atau reset di `beforeEach`
- 8b. **`isolate: false` module cache** — top-level side effects survive into next file. Fix: keep `isolate: true` (default)
- 8c. **`globals: true` config drift** — setup file yang disagree dengan config silently breaks tests. Fix: audit setup file consistency
- 8d. **Watch vs CI cache divergence** — test pass di watch mode, fail di CI. Fix: CI harus run dari clean cache

**Kategori 9 sub-patterns (Shared State Leakage):**
- 9a. **`vi.mock()` hoisting traps** — factory closure tidak bisa reference variables declared later. Fix: pakai `vi.hoisted()`
- 9b. **Snapshot races in `test.concurrent`** — concurrent snapshot tests race. Fix: keep snapshot tests sequential
- 9c. **Fake-timer leakage** — `vi.useFakeTimers()` tidak auto-restore. Fix: `vi.useRealTimers()` di `afterEach` (sudah mitigated oleh `restoreMocks: true` di config)
- 9d. **Retry config hiding bugs** — `retry: 2` di config hide flaky tests. Fix: jangan pakai retry config, fix root cause

### Alur Eksekusi

1. **VB-0 (One-time sweep):** Inventarisasi semua vitest file, klasifikasi per kategori + tag criticality + risk score + tier + catat execution time, simpan ke `reports/cross-audits/vitest-quality-sweep.md`. Coverage config sudah di vitest.config.ts (coverage 0% = candidate 📝 MISSING).
2. **VB-1 (Per-flow deep dive):** Untuk file prioritas (Tier × Quality matrix), baca test + function berdampingan, jalankan mutation testing (manual sampling atau StrykerJS per-file), cek duplicasi, cek test maintainability, cek 12 kategori gap + 8 Vitest flaky sub-patterns, cek Next.js App Router boundary compliance, cek Server Action test matrix coverage
3. **VB-2 (Fix):** Hapus useless/outdated, rewrite shallow menjadi deep, tambah missing, sederhanakan duplicative, perbaiki unmaintainable, tambah Server Action test matrix untuk protected actions
4. **VB-3 (Verify):** Confirm fix benar-benar meningkatkan kualitas — StrykerJS mutation score untuk T1 files (target sesuai criticality), atau manual mutation testing dengan dokumentasi mutation yang di-test, test isolation check (--shuffle), execution time comparison

### Anti-Pattern List yang Bisa Tumbuh

List kategori di atas bukan daftar tertutup. Kalau saat audit ditemukan kategori gap baru yang tidak ter-cover 12 kategori di atas, WAJIB tambahkan ke list ini sebagai kategori baru untuk sweep berikutnya.

## Definisi "Selesai" untuk VB-0 (Vitest Quality Sweep)

VB-0 dianggap selesai kalau:
- Semua vitest file sudah diinventarisasi dan diklasifikasi (✅/⚠️/❌/🗑️/📝)
- Setiap file sudah diberi tag criticality (CRITICAL/HIGH/MEDIUM/LOW) + risk score + tier (T1/T2/T3)
- Semua 12 kategori gap sudah dicek (6 original + 6 tambahan: over-mocked, test order dependency + 4 Vitest sub-patterns, shared state leakage + 4 Vitest sub-patterns, assertion-free, magic numbers, test logic in production)
- 9 Test Suite Health Indicators sudah dipantau (I0-I8, termasuk trade-off awareness)
- Next.js App Router boundary compliance sudah dicek (async RSC tidak di-test dengan Vitest, Server Actions punya test matrix)
- Execution time per file sudah dicatat (target: full suite < 60 detik)
- Coverage config sudah di vitest.config.ts dan coverage report sudah di-generate
- Function penting yang missing vitest sudah teridentifikasi
- Priority list sudah dibuat berdasarkan Tier × Quality matrix
- Laporan tersimpan di `reports/cross-audits/vitest-quality-sweep.md`
- **VB-0 TIDAK termasuk eksekusi fix** — fix dilakukan setelah user approve, terpisah dari VB-0. VB-0 selesai = laporan selesai, bukan fix selesai.

## Re-Audit Rule untuk Cross-Flow Fixes

Kalau fix dari Cross-Flow UX Sweep (Tahap UX-0) menyentuh file yang tersebar di multiple flow (misal: em dash di 19 file across 8 flow), tidak perlu full re-walkthrough per-flow. Yang perlu dilakukan:

1. **Identifikasi flow yang terkena** — cek file mana yang diubah, map ke flow mana yang punya file itu.
2. **Per flow yang terkena:** ambil screenshot "after" di viewport yang sama dengan screenshot "before" yang sudah ada (kalau ada), verify fix area + cek tidak ada regression di sekitarnya.
3. **Update audit report per-flow** — tambah section "Cross-Flow Sweep Fix" dengan status VERIFIED untuk temuan yang sudah diverifikasi.
4. **Kalau screenshot "before" tidak ada** (flow lama yang belum pernah di-walkthrough), cukup verify via code inspection + screenshot "after" — tidak perlu buat "before" retroaktif.
5. **Tidak perlu re-run E2E test** untuk cross-flow fix yang murni text/visual (em dash, capitalization) — kecuali kalau fix mengubah struktur DOM yang di-assert di test.

## Keterbatasan Struktural yang Tidak Bisa Dihilangkan dengan Rules (Wajib Dipahami)

**Devin menulis code DAN menulis test untuk code itu sendiri — ini conflict of interest struktural yang tidak bisa dihilangkan hanya dengan menambah aturan/checklist.** Sebanyak apapun instruksi self-check ditambahkan, penulis dan penguji yang sama orangnya (secara struktural) punya bias yang sama. Ini BUKAN masalah yang "bisa diselesaikan" dengan dokumen ini — ini keterbatasan yang harus dikompensasi dengan REVIEW MANUSIA yang genuinely independen (user dan/atau mentor), bukan dianggap hilang kalau checklist-nya lengkap.

**Konsekuensi praktis:** spot-check oleh user (2-3 temuan paling kritis, sesuai kriteria di atas) itu BUKAN langkah opsional/formalitas — itu satu-satunya lapisan verifikasi yang genuinely independen dari bias penulis. Semakin kritis suatu flow (finansial, auth), semakin penting spot-check ini benar-benar dilakukan dengan teliti, bukan di-skip karena "kelihatannya udah lengkap dari laporan Devin".

**Mutation testing sebagai objective mitigation:** StrykerJS (atau manual mutation testing) adalah ukuran mekanis yang tidak bisa di-game tanpa benar-benar menulis test yang kuat. Meskipun penulis dan tester orang yang sama, mutation score adalah verifikasi objektif — jika test tidak catch mutant, mutant survive, terlepas dari siapa yang menulis test. Ini mitigation yang concretely actionable, bukan cuma "harap user cek manual".

## Bug/Error Insidental (Ditemukan Di Luar Task yang Sedang Dikerjakan)

**Kalau saat mengerjakan task apapun (fix, audit, UX Walkthrough, dll) ketemu bug/error LAIN yang tidak berhubungan dengan task itu — JANGAN cuma disebut sepintas lalu dilupakan.** Ini sering kejadian dan berisiko hilang kalau cuma jadi komentar di chat — tidak ada yang akan balik baca riwayat chat lama untuk mencarinya nanti. Pakai kerangka yang sama seperti temuan UX (GAS vs approval), sekarang berlaku universal untuk SEMUA jenis bug insidental:

**Kalau kecil** (tidak menyentuh data model/business logic/finansial/keamanan, cost fix rendah, reversible) → **WAJIB fix langsung**, laporkan terpisah jelas di checkpoint (contoh: "Selain task utama, saya juga fix [bug X] yang ditemukan tidak sengaja — [alasan kenapa aman di-fix langsung]"). JANGAN didiamkan hanya karena "di luar scope".

**Kalau signifikan/berisiko** (butuh keputusan produk, menyentuh finansial/keamanan, cost tinggi) → JANGAN fix langsung, TAPI JUGA JANGAN cuma disebut sepintas dan dilupakan. **WAJIB dicatat sebagai temuan baru berstatus OPEN di `reports/audit/[nama-flow-yang-relevan].md`** — supaya nanti otomatis muncul lagi saat flow itu diaudit/di-delta-check, bukan hilang begitu saja. Sebutkan eksplisit di laporan bahwa ini ditemukan secara insidental saat mengerjakan task lain, dan flow mana yang seharusnya menanganinya.

**Kalau tidak yakin bug ini kecil atau signifikan** → default ke signifikan (catat sebagai temuan, jangan fix langsung) — sama seperti prinsip default-ke-aman di bagian lain dokumen ini.

## Production Bug Loop-Back (Wajib)

**Kalau ada bug yang ditemukan SETELAH deploy (bukan saat development/testing) — itu WAJIB ditelusuri balik ke sistem QA/QC ini, bukan cuma di-fix lalu dilupakan.** Untuk setiap bug production yang ditemukan:
1. Fix bug-nya seperti biasa.
2. **WAJIB tambahkan entry baru di `reports/audit/[nama-flow].md`** yang menjelaskan bug ini — kenapa sampai lolos dari QA/QC yang sudah ada, apa yang perlu diperbaiki dari SKENARIO TEST-nya (bukan cuma app code-nya) supaya kelas bug yang sama tidak lolos lagi.
3. Tulis test baru (unit dan/atau E2E) yang secara spesifik meng-cover skenario bug production ini, verifikasi dengan mutation testing (lihat section di atas) — pastikan test barunya benar-benar akan FAIL kalau bug yang sama muncul lagi.
4. Kalau bug ini mengindikasikan ada KELAS blind spot baru yang belum tercatat (seperti kejadian awal 5+1 kelas blind spot ditemukan) — pertimbangkan apakah perlu dicatat sebagai kelas baru di dokumen ini, TAPI sesuai prinsip governance di atas: harus dari bukti nyata (bug production ini adalah bukti nyata), bukan spekulasi.

**Ini best-practice paling tinggi ROI-nya di software engineering** — setiap kegagalan production yang tidak "diubah jadi test" itu kesempatan yang hilang untuk mencegah bug SERUPA muncul lagi.

## Alur Kerja Per Flow (Wajib Diikuti Berurutan)

### Senior QA Engineer Mindset (WAJIB untuk Track A, 100 tahun pengalaman)

Sebelum mulai Tahap 1-4, internalisasi mindset ini:
1. **"Apakah test ini benar-benar membuktikan sistem aman untuk dipakai user real?"** — bukan cuma "test pass", tapi "kalau 10.000 user pakai sistem ini bersamaan, apa yang break?"
2. **"Kalau behavior ini rusak, apakah test ini FAIL?"** — kalau tidak, test tidak valuable. Mutation testing adalah satu-satunya verifikasi objektif.
3. **"Apakah saya cuma test yang di-spec, atau juga skenario yang user masuk akal akan lakukan?"** — spec tidak pernah 100% lengkap.
4. **"Apakah skenario yang di-skip punya alasan documented?"** — skip tanpa alasan = lubang hitam.
5. **"Apakah test data deterministic?"** — flaky test karena data tidak deterministic = test yang tidak reliable.
6. **"Apakah saya ngetest behavior atau implementation?"** — test behavior, bukan implementation detail yang bisa berubah tanpa behavior berubah.
7. **"Kalau saya hapus test ini, apa yang hilang?"** — kalau jawabannya "tidak ada", test itu tidak valuable.

**Prinsip tambahan:**
- **Jangan percaya test yang PASS tanpa mutation testing.** Mutation testing adalah satu-satunya cara objektif untuk membuktikan test catch bug.
- **Jangan skip skenario karena "susah di-test".** Kalau penting tapi susah, improve test infra. Kalau masih tidak bisa, catat sebagai KNOWN LIMITATION.
- **Test data harus deterministic.** Flaky test tidak ditolerir.

Kerjakan **satu flow dalam satu waktu**, jangan langsung semua flow sekaligus (untuk menghindari analisis dangkal/halusinasi).

### Tahap 1 — QA: Audit & Gap Analysis (Analysis Only)
1. Analisis kode mendalam untuk flow yang dipilih, telusuri behavior aktual (bukan asumsi dari nama fitur/komponen).
2. Cari gap dengan kerangka pertanyaan: "kalau sistem ini dipakai oleh banyak user dalam jangka waktu lama (bertahun-tahun), hal apa yang bisa gagal atau belum terhandle di titik ini?" — termasuk edge case kecil (elemen UI duplikat dengan behavior beda, redirect/URL tidak sesuai, state tidak ter-reset, notifikasi yang seharusnya ada tapi tidak dikirim).
3. Jangan batasi diri ke kategori yang sudah ditentukan sebelumnya — eksplorasi bebas dari hasil analisis kode.
3B. **Kalau flow yang diaudit menyentuh auth/payment/admin/data pribadi user, WAJIB tambahkan security checklist minimal ini** (bukan full security testing, cukup yang paling murah dan paling kritis untuk project skala ini):
   - **Authorization boundary** — apakah user A bisa akses/modifikasi resource milik user B hanya dengan mengubah ID di URL/request (IDOR)? Cek endpoint yang terima parameter ID (`bookingId`, `userId`, dll) apakah ada verifikasi kepemilikan, bukan cuma cek "user login" doang.
   - **Input validation di endpoint finansial** — apakah ada validasi server-side untuk amount/harga (tidak bisa negatif, tidak bisa dimanipulasi dari client), bukan cuma validasi di UI yang bisa di-bypass.
   - Accessibility (a11y) dan performance/load testing SENGAJA tidak dimasukkan sebagai kewajiban di tahap project ini (skala solo developer + bimbingan mentor) — dicatat sebagai backlog untuk fase production-readiness nanti, bukan blocker sekarang.
4. **Sebelum declare audit ini selesai, lakukan self-recheck dulu:** baca ulang temuan yang sudah dikumpulkan, tanya ke diri sendiri "apa ada sudut yang saya lewatkan — failure case, dampak ke role lain, UI/redirect/state?" Kalau nemu tambahan, masukkan dulu sebelum lapor final. **Cross-check juga secara eksplisit terhadap 5 Kelas Blind Spot Testing + Kelas ke-6 (Visual/Layout Regression) di atas** — untuk masing-masing kelas, tentukan apakah relevan untuk flow ini, dan kalau relevan, apakah itu bug nyata atau gap coverage test.
5. Simpan hasil ke `reports/audit/[nama-flow].md` dengan format berikut untuk SETIAP temuan:

   - **Skenario**: deskripsi gap yang ditemukan
   - **Status**: OPEN (baru ditemukan) / FIXED (sudah difix, belum diverifikasi test) / VERIFIED (sudah difix DAN ada test yang memverifikasi) / SUPERSEDED (temuan lama yang sudah tidak relevan lagi karena re-audit, jangan dihapus, cukup tandai)
   - **Bukti dari code**: file + behavior
   - **Risiko**: dampak kalau dibiarkan
   - **Opsi Solusi** (WAJIB minimal 2 opsi kalau gap ini butuh keputusan produk/arsitektur, bukan cuma bug kecil yang solusinya jelas tunggal):
     - **Opsi A — [nama pendekatan]**: penjelasan, trade-off (kelebihan/kekurangan, effort, dampak ke bagian lain)
     - **Opsi B — [nama pendekatan]**: penjelasan, trade-off
     - **Opsi C** (kalau ada): sama
     - **Rekomendasi Devin**: opsi mana yang menurut analisis paling sesuai untuk kebutuhan project ini, dan kenapa — tapi tetap sebagai REKOMENDASI, bukan keputusan final.
     - **Untuk temuan dengan risiko TINGGI yang menyentuh finansial/keamanan**: WAJIB tambahkan juga "Kalau rekomendasi ini salah/kurang tepat, apa yang bisa terjadi?" — supaya user punya bahan evaluasi sebelum approve, bukan cuma menerima rekomendasi mentah-mentah.

   Untuk gap yang solusinya memang tunggal/jelas (misal bug kecil, typo, validasi yang jelas kurang), tidak perlu dipaksakan multi-opsi — cukup satu solusi dengan penjelasan singkat.

   **Kenapa harus multi-opsi:** user perlu bahan diskusi konkret untuk dibawa ke mentor/pihak lain, bukan cuma menerima satu rekomendasi mentah. Kalau nanti mentor punya preferensi beda dari rekomendasi Devin, user bisa langsung tau posisi rekomendasi itu dibanding opsi lain yang sudah dipertimbangkan — bukan mulai diskusi dari nol.
5B. **JANGAN eksekusi perubahan apapun di tahap ini.** Tunggu review/approval user, terutama untuk temuan yang butuh keputusan produk (seperti "apakah refund perlu ada atau tidak").
6. Update `reports/status.md` — kolom Audit untuk flow ini jadi "Done".

### Tahap 2 — Fix Gap Prioritas (kalau ada)
**Sebelum mulai fix, deklarasikan "blast radius" — seberapa luas dampak kalau fix ini salah** (bukan cuma pemulihan setelah kejadian, tapi estimasi risiko SEBELUM eksekusi): file/flow apa saja yang berpotensi terpengaruh, dan apakah perubahan ini terisolasi atau menyentuh shared logic. Kalau blast radius-nya luas (menyentuh shared service/util yang dipakai banyak flow), itu sinyal untuk lebih hati-hati dan WAJIB pakai git safety net di bawah.

**Pastikan ada titik aman untuk kembali (git safety net)** — kejadian nyata sebelumnya: fix untuk satu masalah kecil (timezone) ternyata efeknya menyebar dan merusak 100+ skenario lain, sehingga harus di-revert. WAJIB:
1. Pastikan working tree bersih (semua perubahan sebelumnya sudah di-commit) SEBELUM mulai fix baru, supaya kalau perlu revert, jelas titik baliknya.
2. Kalau fix yang akan dilakukan berpotensi menyentuh banyak file/logic yang dipakai flow lain (bukan perubahan kecil terisolasi), commit dulu SEBELUM mulai, dengan pesan yang jelas jadi checkpoint.
3. Kalau setelah fix ternyata scope kerusakannya lebih luas dari yang diperkirakan (banyak test lain jadi FAIL yang sebelumnya PASS), JANGAN lanjut coba benerin lebih jauh — laporkan ke user dulu, opsi revert ke checkpoint itu harus selalu tersedia sebagai pilihan yang mudah, bukan proses ribet.

Setelah user approve rekomendasi dari audit, gap yang perlu di-fix dikerjakan dulu SEBELUM menulis test scenario. Jangan menulis test scenario untuk behavior yang statusnya masih akan berubah.

### Tahap 3 — QC: Penulisan Test Scenario
1. Tulis skenario test yang meng-cover flow ini secara menyeluruh — termasuk assertion yang ketat (cek URL berubah sesuai state, cek elemen duplikat satu-satu, cek state setelah aksi, bukan cuma "apakah halaman tidak crash"). **Wajib mengikuti Standar Kekuatan Assertion di atas** — setiap skenario yang ditulis harus jelas APA yang membuktikan klaimnya benar, bukan cuma "apa yang dicek".
2. Simpan ke `reports/test-scenarios/[nama-flow].md`.
3. Update `reports/test-scenarios/[nama-flow].md`. `reports/status.md` kolom Vitest/E2E/Final di-update saat test dieksekusi, bukan saat penulisan scenario.

### Tahap 4 — QC: Eksekusi Test
1. Jalankan test scenario yang sudah ditulis.
2. **Kalau ada yang error, diagnosis dulu root cause-nya sebelum melakukan perubahan apapun. Ada 3 kemungkinan, bukan cuma 2:**
   - **App code memang bug** (logic salah, tidak sesuai flow seharusnya) → fix app code.
   - **Test menulis expectation berdasarkan flow lama** yang sudah sengaja diubah → update test.
   - **Elemen/fitur yang ditest memang belum ada sama sekali** (bukan bug, bukan test salah — skenarionya valid tapi implementasinya belum dibangun) → treatment beda, lihat poin 3 di bawah.
3. **Untuk kategori "belum ada sama sekali", pisahkan lagi jadi dua level:**
   - **Trivial** (elemen UI kecil yang jelas seharusnya ada dan tidak butuh keputusan produk — tombol yang lupa ditambahkan, label kosong, link yang belum diarahkan, dll): boleh langsung difix + tambahkan, TIDAK perlu approval dulu. Laporkan di hasil test apa yang ditambahkan dan kenapa.
   - **Signifikan** (flow/fitur yang belum ada sama sekali dan butuh keputusan produk/bisnis — contoh: fitur refund, flow reschedule, mekanisme dispute): JANGAN langsung diimplementasi. Treatment-nya SAMA seperti temuan audit (lihat Tahap 1) — laporkan sebagai gap dengan minimal 2 opsi solusi dan trade-off-nya, simpan juga ke `reports/audit/[nama-flow].md` kalau belum pernah tercatat di sana (berarti ini gap yang lolos dari audit awal), lalu tunggu approval user sebelum eksekusi.
   - Kalau ragu suatu temuan itu trivial atau signifikan, defaultnya perlakukan sebagai **signifikan** (lebih aman nanya dulu daripada nambah fitur yang ternyata butuh keputusan bisnis tanpa sepengetahuan user).
4. **JANGAN PERNAH memodifikasi test code hanya untuk memaksa hasil passed tanpa root cause yang jelas.** Ini berlaku untuk ketiga kategori di atas — termasuk jangan melonggarkan assertion supaya "elemen belum ada" itu jadi keliatan PASS.
4B. **Loop-back ke unit test:** kalau saat eksekusi E2E ditemukan bug yang root cause-nya adalah LOGIC ERROR (bukan UI, bukan test outdated) — WAJIB tambahkan unit test (Vitest) untuk edge case itu SEBELUM lanjut ke batch berikutnya, bukan cuma fix app code-nya doang. Ini supaya edge case yang baru ditemukan itu punya coverage permanen, bukan cuma "ketahuan sekali lalu lupa lagi".
5. Laporkan hasil dalam bahasa manusia/naratif per skenario (contoh: "user login dengan email yang tidak terdaftar → FAIL, alasan: ..."), bukan cuma code diff. Untuk temuan kategori "belum ada", laporkan eksplisit itu bukan bug tapi gap fitur, dan trivial/signifikan.
6. Simpan ke `reports/test-results/[nama-flow].md`.
7. Update `reports/status.md` — kolom Vitest/E2E yang relevan dan Final untuk flow ini. Kalau ada gap signifikan yang masih menunggu approval, status flow ini TIDAK BOLEH "AMAN" dulu — tetap "ADA ISU" sampai gap itu diputuskan.

## Cross-Flow Regression Check (Wajib Sebelum Status "AMAN")

Flow di project ini saling terhubung (booking → payment → session → notification, dll berbagi file/service). Fix di satu flow bisa merusak flow LAIN yang sebelumnya sudah AMAN, tanpa ketahuan kalau tidak dicek eksplisit.

**Sebelum menandai flow manapun "AMAN", WAJIB:**
1. Identifikasi flow lain mana yang share file/service dengan flow yang baru di-fix/ditest (cek import, service yang dipanggil lintas-feature).
2. Kalau ada flow lain yang share dependency dan statusnya sudah "AMAN" sebelumnya — jalankan MINIMAL smoke test (1-2 skenario paling kritis) dari flow itu untuk pastikan tidak ada regresi.
3. Kalau shared file yang berubah itu SIGNIFIKAN (bukan cuma cosmetic), jalankan FULL test dari flow yang terdampak, bukan cuma smoke test.
4. Catat di `reports/status.md` atau di file test-result terkait: "Flow X di-re-check tanggal Y karena perubahan di flow Z" — supaya ada jejak kenapa flow itu di-test ulang.

Ini bukan proses berat setiap kali — cukup identifikasi dependency dan smoke test target, bukan re-run semua flow dari nol setiap ada perubahan kecil.

## Definisi "Selesai" untuk Satu Flow

Satu flow baru dianggap benar-benar selesai (status "AMAN" di reports/status.md) kalau:
- Audit sudah dilakukan mendalam (termasuk failure/interrupt case, bukan cuma happy path)
- Semua gap prioritas tinggi dari audit sudah di-fix
- Semua skenario test sudah ditulis dengan assertion ketat
- Semua test sudah dijalankan dan PASSED (atau kalau ada yang gagal, sudah didiagnosis jelas dan dilaporkan ke user, bukan dipaksa passed)
- Cross-Flow Regression Check sudah dilakukan (lihat section di atas)
- User sudah melakukan spot-check terhadap 2-3 temuan/hasil test paling kritis — **"paling kritis" ditentukan pakai kriteria ini** (bukan sekadar urutan pertama di laporan): (1) menyentuh transaksi finansial, (2) berpotensi menyebabkan data loss/corruption, (3) berpotensi menyebabkan unauthorized access. Devin WAJIB merekomendasikan yang mana untuk di-spot-check berdasarkan kriteria ini secara eksplisit.

## Definition of Done — Level Project (Bukan Cuma Per-Flow)

Semua flow individual bisa "AMAN" tapi project belum tentu siap dipresentasikan/deploy production. Project dianggap siap kalau:
- Semua flow kritis (money-flow, booking-lifecycle, auth, session-delivery, admin-access) sudah berstatus AMAN.
- Cross-Flow Regression Check sudah dilakukan untuk semua flow yang saling terhubung, bukan cuma dicek terpisah-pisah per flow.
- Security checklist minimal (authorization boundary + input validation finansial, lihat Tahap 1 poin 3B) sudah dilakukan untuk SEMUA flow yang menyentuh auth/payment/admin.
- Tidak ada temuan berstatus OPEN dengan risiko TINGGI yang masih menggantung tanpa keputusan.

**Catatan tambahan (belum wajib sekarang, dicatat sebagai kesadaran/backlog untuk fase production-readiness nanti, bukan blocker untuk skala project ini):**
- Test data isolation — kalau test dijalankan paralel/bersamaan di masa depan, data seed yang di-share bisa saling mengganggu antar test run. Belum jadi masalah nyata selama test dijalankan sequential seperti sekarang.
- Data realism drift — seed data untuk testing itu "bersih"/ideal, sementara data user asli nanti bisa lebih berantakan (nama dengan karakter khusus, format tidak standar). Test yang PASS di seed data belum tentu representatif untuk data nyata di production.
- Dependency/security audit (`npm audit` atau setara) belum ada cadence rutinnya — worth dilakukan periodik terutama menjelang deploy besar, karena ini platform finansial.
- Keputusan arsitektur besar (seperti pemilihan proxy.ts vs middleware.ts, AUTH_TRUST_HOST) belum ada tempat permanen untuk mendokumentasikan alasannya — worth dicatat di README/PROJECT.md kalau ada keputusan besar ke depan, supaya tidak lupa alasannya beberapa bulan kemudian.
- Load/concurrency testing sengaja di-defer (sudah dibahas di Tahap 1 poin 3B) — kalau mau sanity-check paling murah suatu saat, cukup coba beberapa booking bersamaan secara manual, tidak perlu tooling khusus dulu.

## Dua Jenis Seed Data — WAJIB Dipisah, Jangan Dicampur

Seed data untuk **test otomatis** dan seed data untuk **demo/presentasi ke mentor/orang lain** punya tujuan yang saling bertentangan kalau dicampur jadi satu file — WAJIB dipisah jadi dua:

### `prisma/seed.ts` — untuk test otomatis (E2E, Vitest)
- **Minimal dan deterministic** — jumlah data harus PASTI dan predictable, karena banyak assertion di test meng-cek angka/kondisi spesifik (misal "expect 3 booking pending"). Data yang terlalu banyak/random bisa bikin test salah pilih elemen atau melambat.
- Ini yang dipakai di semua alur Tahap 1-4 di atas — JANGAN pernah diganti dengan data demo yang besar, karena bisa merusak assertion yang mengharapkan state spesifik.

### `prisma/seed-demo.ts` (baru, terpisah) — untuk ditunjukkan ke mentor/orang lain
- **Representasikan pemakaian realistis dalam jangka waktu tertentu** (kira-kira setara 6 bulan–1 tahun pemakaian) — cukup banyak untuk terlihat "hidup"/real, TAPI JANGAN berlebihan (tidak perlu ribuan record, cukup representatif: puluhan booking dengan berbagai status, beberapa review, beberapa notifikasi, dst — mencakup variasi kondisi, bukan volume besar untuk volume semata).
- **WAJIB ada beberapa akun contoh yang LENGKAP SEPENUHNYA** — semua field profil terisi, riwayat lengkap (booking dari berbagai status: selesai, dibatalkan, sedang berjalan; review yang sudah diberikan; dst) — supaya kalau ditunjukkan ke mentor/orang lain, akun itu "enak dilihat" dan mendemonstrasikan seluruh fitur, bukan terlihat kosong/baru daftar.
- **Command terpisah** dari seed test biasa (misal `npm run db:seed:demo`), dan JANGAN PERNAH dijalankan otomatis sebelum test E2E/Vitest — jalankan manual hanya saat memang mau demo, lalu kembalikan ke `seed.ts` biasa sebelum lanjut testing lagi supaya tidak mengganggu assertion yang mengharapkan state minimal.

## Unit Test (Vitest) vs E2E Test (Playwright) — Wajib Dibedakan

Selama ini rules dan template prompt cuma fokus ke E2E (Playwright). Ini menyebabkan unit test (Vitest) sering di-skip karena tidak ada instruksi eksplisit kapan harus dipakai. Ke depan, WAJIB dibedakan:

**Unit Test (Vitest)** — testing fungsi/logic murni secara terisolasi, TANPA browser, TANPA koneksi database/API asli (kalau butuh data, di-mock).

WAJIB ditulis untuk:
- Kalkulasi (harga, komisi, diskon, refund amount, dll)
- Validasi input (format email, password strength, business rule validation)
- Utility function (format tanggal/timezone, parsing, transformasi data)
- Business logic yang bisa diuji tanpa UI (state machine transition logic, permission/role checking logic)

**Integration Test (Vitest + Testing Library)** — testing component/hook behavior dengan mocked dependencies, TANPA full browser. Sweet spot antara unit test (terlalu isolated) dan E2E (terlalu lambat). Project sudah install `@testing-library/react` + `@testing-library/jest-dom` + `@vitejs/plugin-react`.

WAJIB ditulis untuk:
- Component dengan complex state interaction (form validation rendering, modal open/close, multi-step form state)
- Hook dengan async logic (React Query cache invalidation, form state management)
- API route handler dengan mocked Prisma (bukan full browser, tapi bukan pure unit juga)
- Component yang sulit di-test dengan E2E karena state transient (loading state, error state, race condition)

Referensi: Kent C. Dodds — Testing Trophy (integration tests sebagai sweet spot, bukan test pyramid yang menekankan unit).

**E2E Test (Playwright)** — testing alur user LENGKAP lewat browser (klik, isi form, navigasi, integrasi antar komponen).

WAJIB ditulis untuk:
- User flow lintas halaman (booking, checkout, login, dst — yang sudah dicover di workflow Tahap 1-4 di atas)
- Interaksi UI yang tidak bisa diuji tanpa render browser (drag-drop, modal, form multi-step)

**Aturan wajib:** Setiap kali audit (Tahap 1) menemukan business logic/fungsi kalkulasi/validasi yang kritis, WAJIB dicatat juga apakah logic itu punya unit test coverage — kalau belum ada, itu jadi temuan gap tersendiri, terpisah dari gap E2E flow. Jangan asumsikan E2E test yang mencakup flow tersebut sudah cukup — E2E menguji "apakah hasil akhirnya benar dari sudut pandang user", bukan "apakah logic kalkulasinya benar di semua kemungkinan input", yang lebih presisi diuji lewat unit test.

**Kalau Devin melaporkan suatu logic "tidak perlu unit test", WAJIB kasih alasan eksplisit kenapa** (misal: logic-nya trivial/satu baris, atau sudah tercover cukup oleh E2E) — jangan diterima sebagai keputusan default tanpa penjelasan.



## Tingkat Kedalaman Proses (Supaya Tidak Overkill)

Tidak semua temuan/perubahan butuh proses selengkap di atas (audit multi-opsi, self-report checkpoint, update reports/status.md). Pakai panduan ini:

**Proses LENGKAP (semua tahap 1-4 + checkpoint) — WAJIB untuk:**
- Business logic, data/booking/payment flow, auth, apapun yang menyentuh keputusan produk atau uang.
- Perubahan yang berdampak ke lebih dari satu flow/halaman.

**Proses RINGKAS (boleh langsung fix + laporan singkat, skip audit multi-opsi) — untuk:**
- Perubahan UI kecil murni (typo, warna, spacing, teks tombol) yang tidak menyentuh logic/data.
- Bug yang sudah jelas root cause dan solusinya tunggal (tidak ambigu, tidak butuh keputusan produk), DENGAN SYARAT KETAT: (1) tidak menyentuh logic finansial/auth/payment, (2) diff kecil (di bawah ~10 baris), (3) tidak mengubah interface/API contract. Kalau salah satu syarat ini tidak terpenuhi, WAJIB proses LENGKAP meskipun kelihatannya simpel.

**Kalau ragu masuk kategori mana, default ke proses LENGKAP** — lebih aman kelamaan dikit daripada kelewat gap yang sebenarnya penting.

Ini bukan alasan untuk skip self-report checkpoint sepenuhnya — checkpoint tetap dipakai di proses ringkas, cuma versinya boleh lebih singkat (tidak perlu breakdown opsi solusi kalau memang tidak relevan).

## Verifikasi Ulang (Wajib Sebelum Klaim "Aman")

Sebelum melaporkan sebuah flow sebagai "AMAN" di `reports/status.md`, lakukan langkah berikut:
1. Re-cek temuan-temuan sebelumnya terhadap kondisi code TERKINI (bukan asumsi dari laporan lama — kondisi code bisa berubah karena fix di flow lain).
2. Jangan klaim "aman" tanpa bukti eksplisit di setiap sub-bagian — user butuh bisa cross-check sendiri ke code, bukan kesimpulan sepihak.

## Prinsip Perubahan Dokumen Ini Sendiri (Governance)

**Dokumen ini (dan `reports/workflow/execution-guide.md`) HANYA boleh ditambah berdasarkan bukti nyata, bukan spekulasi.** Sebelum menambahkan aturan/checklist/tahap baru ke dokumen ini, harus jelas jawabannya:
- **Apakah ini dari kejadian NYATA** (bug yang benar-benar lolos, kontradiksi yang benar-benar ditemukan, proses yang benar-benar bikin bingung saat dipakai) — BOLEH ditambahkan.
- **Atau ini dari pertanyaan "kira-kira apa yang BISA salah"** tanpa kejadian konkret — TIDAK BOLEH langsung ditambahkan sebagai aturan wajib. Boleh dicatat sebagai catatan/pertimbangan, tapi jangan jadi checklist wajib baru tanpa bukti dari pemakaian nyata.

**Alasan prinsip ini:** dokumen QA/QC yang terus bertambah tanpa batas justru jadi kontraproduktif — makin banyak instruksi simultan, makin gampang ada yang terlewat (termasuk oleh Devin sendiri saat membaca instruksi yang terlalu panjang). Kekuatan dokumen ini ada di PRESISI-nya (tiap aturan ada alasan konkret di baliknya), bukan di JUMLAH aturannya.

**Sebelum menambah aturan baru, tanyakan: "apakah ini genuinely kategori baru, atau variasi dari prinsip yang sudah ada?"** Kalau variasi, cukup tambahkan sebagai contoh di bawah prinsip yang sudah ada — jangan bikin section terpisah baru.

---

## Production Readiness Testing (Cross-Cutting / Appendix)

Section ini berisi test patterns untuk aspek yang TIDAK ter-cover oleh Track A/B/C. Ini adalah gap yang ditemukan saat brainstorming upgrade QA/QC framework (12 Aug 2026), setelah app deploy ke private network `192.168.1.77:30056`.

### PR-1: Database ACID Rollback Testing

**Kapan WAJIB:** Setiap function yang menggunakan `prisma.$transaction` dengan ≥2 write operations. Khususnya money-flow (`cancelAndRefundBooking`, `initiatePayment`, `expirePendingBookings`, webhook PAID/FAILED/REFUND).

**Pattern test (Vitest, no new tools):**
```typescript
it("rollback ketika tx.payment.update throw di tengah transaction", async () => {
  mockPrisma.$transaction.mockImplementation(async (fn) => {
    const tx = { ...mockPrisma, payment: { update: vi.fn().mockRejectedValue(new Error("DB connection lost")) } };
    return fn(tx);
  });
  const result = await cancelAndRefundBooking("booking-1", "test");
  expect(result.success).toBe(false);
  // Verify tidak ada partial commit — booking.update TIDAK dipanggil
  expect(mockPrisma.booking.update).not.toHaveBeenCalled();
  expect(mockPrisma.availability_slot.update).not.toHaveBeenCalled();
});
```

**Aturan:**
- Test WAJIB verifikasi bahwa setelah error di tengah transaction, operasi setelahnya TIDAK dijalankan (tidak ada partial commit).
- Test WAJIB cover setidaknya 1 skenario error per transaction function utama.
- Prisma `$transaction` otomatis rollback kalau callback throw — yang di-test adalah apakah KODE KITA melempar error dengan benar ketika intermediate step gagal.

### PR-2: Idempotency Testing

**Kapan WAJIB:** Setiap endpoint/function yang bisa dipanggil concurrent oleh user (payment initiate, webhook, payout disburse, booking create).

**Pattern test (Vitest, no new tools):**
```typescript
it("hanya 1 request success saat 3 concurrent initiatePayment", async () => {
  mockPrisma.payment.updateMany
    .mockResolvedValueOnce({ count: 1 }) // first call wins
    .mockResolvedValueOnce({ count: 0 }) // second loses (optimistic lock)
    .mockResolvedValueOnce({ count: 0 }); // third loses
  const results = await Promise.all([
    initiatePayment("booking-1", "BCA"),
    initiatePayment("booking-1", "BCA"),
    initiatePayment("booking-1", "BCA"),
  ]);
  const successCount = results.filter(r => r.success).length;
  expect(successCount).toBe(1);
});
```

**Aturan:**
- Test WAJIB simulate concurrent call dengan `Promise.all()`.
- Test WAJIB verifikasi hanya 1 operation success (idempotency guard works).
- Untuk webhook: test duplicate callback dengan signature yang sama → hanya proses sekali.

### PR-3: Security Scan (Basic)

**Tools:** `npm audit` (built-in) + `eslint-plugin-security` (install: `npm i -D eslint-plugin-security`).

**Kapan dijalankan:**
- `npm audit` — setiap sebelum deploy, atau setelah `npm install` package baru.
- `npx next lint` — setiap commit (sudah built-in Next.js).
- `eslint-plugin-security` — otomatis lewat ESLint config, detect anti-patterns (eval, child_process, insecure random, dll).

**Bukan pengganti SonarQube/Snyk** — tapi cukup untuk catch low-hanging fruit tanpa setup server.

### PR-4: Deferred Tools (Aktifkan Saat Milestone Tiba)

| Tool | Kapan Aktifkan | Cara Install | Catatan |
|------|---------------|-------------|---------|
| **Sentry** | 1 hari sebelum deploy ke public/internet | `npm i @sentry/nextjs` + `npx @sentry/wizard@latest -i nextjs` | Free tier 5K errors/bulan. Catch runtime error yang tidak tertangkap. |
| **k6** | Pre-public-launch (load test sebelum buka ke user) | `choco install k6` (Windows) atau download dari k6.io | Kirim ribuan concurrent request, ukur response time + error rate. |
| **Docker** | Setelah CI/CD pipeline ada dan Playwright screenshot flaky cross-OS | Docker Desktop untuk Windows | Standardize environment untuk visual regression test. |
| **SonarQube** | Kalau mau comprehensive SAST + tech debt tracking | Docker container (self-hosted) atau SonarCloud (SaaS) | `npm audit` + ESLint cukup untuk sekarang. |
| **Grafana/Prometheus** | Post-deploy ke dedicated server | Docker container | Monitor CPU/RAM/response time server. Butuh infra. |

**Prinsip:** Right tool, right time. Jangan install semua sekaligus — setiap tool butuh setup + maintenance. Install saat milestone-nya tiba, bukan "just in case".