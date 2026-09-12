# EXECUTION GUIDE — Track A: Functional Core

Ini adalah **track utama** yang dikerjakan untuk setiap flow. Semua flow melewati Track A dulu sebelum E2E/Track B/Track C.

**Track A = 4 tahap:**

```
Tahap 0 (Scope Freeze) → Tahap 1 (Audit) → Tahap 2 (Fix + Re-check) → Tahap 3 (Unit Test + Track Gate)
```

- **Tahap 0**: batasi apa yang masuk dan TIDAK masuk flow.
- **Tahap 1**: cari gap, logic bug, missing edge case — dengan rekomendasi **2+ opsi + trade-off**.
- **Tahap 2**: fix yang di-approve, lalu **re-check** sebelum update status.
- **Tahap 3**: tulis Vitest + track gate (putuskan butuh E2E/Track B/Track C atau tidak).

Untuk E2E, Vitest Deep Dive, UI/UX Walkthrough, dan maintenance lintas flow, lihat link di bagian akhir.

---

## Patokan Sebelum Mulai

1. Baca `reports/master-reference.md` untuk paham flow/page yang ada.
2. Baca `reports/status.md` untuk lihat flow mana yang belum/buta.
3. Pilih flow, lalu ikuti Tahap 0 → 1 → 2 → 3 di bawah.
4. Update `reports/status.md` setelah setiap tahap.

**Mindset wajib (Senior QA Engineer):**
- Apakah fitur ini benar-benar jalan? Apa yang hilang?
- Apa yang bisa bikin user gagal — bahkan skenario yang belum terpikir user?
- Jangan cuma cek yang sudah ada; **cari opsi terbaik**: "eh, ini lebih bagus kalau diginiin".
- Untuk setiap gap, kasih **2+ opsi solusi dengan trade-off** dan rekomendasi opsi terbaik.

---

## Prompt 0 — AI Wajib Baca Dulu

Sebelum jawab prompt apa pun, Devin **WAJIB** baca dan kutip 3 file ini sebagai orientasi:

1. `reports/master-reference.md` — daftar flow, rules, dan prioritas.
2. `reports/status.md` — posisi terakhir flow yang dipilih.
3. `reports/workflow/execution-guide.md` — panduan Track A.

Format tanggapan awal yang WAJIB muncul:

```
Baca: master-reference.md, status.md, execution-guide.md
Flow: [NAMA_FLOW]
Status saat ini: [SCOPE/AUDIT/FIX/VITEST/E2E/TRACK_B/TRACK_C/FINAL]
Tahap berikutnya: [Tahap X / keputusan apa]
Catatan: [link ke reports/audit/[NAMA_FLOW].md atau "-"]
```

Prompt ini menghindari AI "ngasal" atau pakai informasi outdated. Jika ada konflik antara rules/memories dan file patokan, **file patokan yang menang**.

---

## Konsep Track

```
Tahap 0 (Scope) → Track A (Audit → Fix + Re-check → Unit Test) → Track Gate
                                          ↓
                         [E2E] / [Track B] / [Track C] / [Appendix Maintenance]
```

- **Tahap 0**: freeze scope — apa yang masuk dan tidak masuk flow ini.
- **Track A**: verifikasi functional + tulis unit test Vitest.
- **Track Gate**: putuskan apakah perlu E2E, Track B (kualitas test), Track C (UI/UX), atau cross-flow regression.
- **E2E Playbook**: integration testing pakai Playwright. Bukan Track A.
- **Track B**: deep dive kualitas test (mutation, flaky, maintainability). Triggered dari Track A.
- **Track C**: UI/UX walkthrough. Triggered dari Track A.
- **Appendix Maintenance**: Discovery Check, Delta Re-Verification, re-orientasi. Periodik, bukan track.

---

## Tahap 0 — Scope Freeze

**Kapan dipakai:** sebelum audit flow yang belum pernah di-scope atau scope-nya sudah berubah.

**Tujuan:** kontrak scope ringan. Bukan census code.

```
Freeze scope untuk flow [NAMA_FLOW]:

1. User story / business rules kritis:
   - Apa yang user bisa lakukan?
   - Role apa saja yang terlibat?
   - Apa output yang wajib benar?

2. Boundary (IN scope):
   - Halaman/page yang termasuk.
   - API/server action yang termasuk.
   - Event/trigger yang wajib di-handle.

3. Boundary (OUT of scope):
   - Halaman/API yang sekilas mirip tapi bukan bagian flow ini.
   - Fitur yang sengaja ditunda/diurus di flow lain.

4. Risiko & prioritas:
   - Apa skenario paling berisiko untuk flow ini? (uang, data user, akses, state transition)
   - Apa yang wajib di-test di Vitest vs E2E?

Output: simpan scope di `reports/audit/[NAMA_FLOW].md` section "Scope".
Update `reports/status.md` kolom "Scope" jadi "Done".
```

---

## Tahap 1 — Audit

**Kapan dipakai:** scope sudah frozen dan lu mau cari gap.

```
Audit flow [NAMA_FLOW] (Tahap 1 Track A).

Tujuan: cari gap functional, logic bug, missing edge case, incomplete flow — BUKAN fix.

1. Baca `reports/audit/[NAMA_FLOW].md` kalau sudah ada.
2. Trace flow end-to-end: user → UI → API route/client fetch → external service (Midtrans/Upstash/Blob) → response/redirect/notifikasi.
3. Cek 5 Kelas Blind Spot Testing (lihat `.devin/rules/qa-qc-workflow-and-status-tracking.md`):
   - Stale Reference
   - Concurrent/Race Condition
   - Time-Based State Transition
   - Partial Failure di Multi-Step Process
   - Cross-User Cache/State Staleness
4. Cek Quality Radar K1-K27 untuk bagian yang terlihat off.
5. Identifikasi UI/UX gap yang relevant — JANGAN fix di sini, catat aja. Track C yang tangani.
6. Identifikasi apakah test yang ada (Vitest/E2E) cukup — JANGAN deep-dive test quality di sini, catat aja. Track B yang tangani.
7. **Future gap check** — untuk tiap bagian flow, tanyakan:
   - **Scale**: apa yang rusak kalau user/data 10x lipat?
   - **Concurrency**: apa yang rusak kalau 2 user/2 proses jalan bareng?
   - **Infra/Failure**: apa yang rusak kalau Upstash down, Vercel Blob gagal, Midtrans timeout, webhook gagal callback, atau network drop?
   - **Security**: ada boundary/input finansial yang belum strict?
   - **A11y/Mobile**: keyboard, screen reader, touch target, responsive?
   - **Cross-flow**: efek ke flow lain (stale data, state propagation)?
   - **Monitoring**: kalau error di production, bisa ditangkep Sentry/log?
8. **Riset eksternal WAJIB** — jangan cuma lihat ke dalam codebase. Untuk tiap area utama flow (payment/Midtrans, webhook security, upload file, notifikasi WA, UI/UX), lakukan web research: OWASP/ASVS, docs resmi framework/library yang dipakai (Next.js, Midtrans), WCAG 2.2/NNg untuk UI. Bandingkan "current approach vs industry best practice" dan tulis di audit file sebagai tabel `Riset Eksternal`. Detail: `.devin/rules/qa-qc-workflow-and-status-tracking.md` → "Wajib: Riset Eksternal".

Format temuan:
- ID: [FLOW]-A-NN
- Severity: P0 / P1 / P2 / P3 / P4
  - P0 = bug nyata, user bisa rugi/uang/hilang data.
  - P1 = bug fungsional signifikan, recoverable.
  - P2 = UX friction atau gap test yang penting.
  - P3/P4 = advisory/optimasi.
- Skenario: apa yang salah/belum ada
- Bukti: file/line
- Risiko: dampak
- Opsi solusi: 2+ opsi dengan trade-off
- Rekomendasi Devin
- Future gap tag: [scale / concurrency / infra / security / a11y / cross-flow / monitoring / none]
- Status: OPEN / ACK / DEFERRED / FIXED

Simpan semua di `reports/audit/[NAMA_FLOW].md`.
Update `reports/status.md` kolom "Audit" = Done.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya / Tidak]
LANGKAH SELANJUTNYA: [user review/approve gap, atau lanjut Tahap 2]
```

---

## Tahap 2 — Fix

**Kapan dipakai:** ada gap di `reports/audit/[NAMA_FLOW].md` yang lu approve.

```
Fix gap-gap berikut dari `reports/audit/[NAMA_FLOW].md` yang sudah gue approve:
[list gap ID]

Aturan:
- Deklarasikan blast radius sebelum fix.
- Kalau ada 2+ cara fix, kasih trade-off dan pilih yang **paling simpel + paling benar** untuk root cause.
- Kalau fix menyentuh UI/UX, setelah selesai pertimbangkan jalankan Track C.
- Kalau fix menyentuh shared logic atau flow lain, pertimbangkan cross-flow regression (Appendix Maintenance).
- Kalau fix butuh keputusan produk, STOP dan tanya dulu.

Setelah fix, **re-check** dulu sebelum update status:
1. Jalankan `npx tsc --noEmit`.
2. Jalankan `npx vitest run` untuk unit test yang terkait.
3. Reproduce skenario temuan — konfirmasi fix benar-benar menyelesaikan root cause.
4. Cek dampak ke file/tetangga terdekat.

Baru laporkan:
- Gap mana yang difix dan cara fix-nya.
- File apa yang diubah.
- Hasil `npx tsc --noEmit` dan `npx vitest run`.
- Apakah perlu Track B/C/E2E lanjutan.

Update status temuan di `reports/audit/[NAMA_FLOW].md` dari OPEN → FIXED.
Update `reports/status.md` kolom "Fix" = Done / In Progress.

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya / Tidak]
LANGKAH SELANJUTNYA: [lanjut Tahap 3, atau review dulu]
```

---

## Tahap 3 — Unit Test + Track Gate

**Kapan dipakai:** fix selesai dan lu review.

```
Untuk flow [NAMA_FLOW], kerjain Tahap 3 (Unit Test + Track Gate).

1. Cek semua fungsi/logic murni di flow ini:
   - kalkulasi, validasi, transformasi data, parsing, permission check, state transition.

2. Untuk masing-masing:
   - Apakah sudah ada unit test-nya?
   - Kalau belum, apakah WAJIB di Vitest? Kasih alasan eksplisit.
   - Jangan skip tanpa alasan.

3. Lokasi file unit test:
   - Buka `vitest.config.mts`, cek `test.include`.
   - Default: `.test.ts` bersebelahan source.
   - TIDAK BOLEH di folder `e2e/`.

4. Untuk logic yang WAJIB, tulis unit test:
   - Kasus normal + edge case (kosong, null, negatif, boundary, invalid).
   - Jangan cuma happy path.
   - Setiap test harus benar-benar **FAIL kalau logic break** (bukan cuma exercise code).

5. Jalankan `npx vitest run` dan `npx tsc --noEmit`. Pastikan hijau.

6. Track Gate — setelah unit test selesai, jawab untuk flow ini:
   | Pertanyaan | Keputusan |
   |---|---|
   | Apakah flow ini user-facing dan butuh E2E? | Ya / Tidak / Nanti |
   | Apakah test-nya terlihat shallow atau mungkin lemah? | Ya → Track B / Tidak |
   | Apakah ada temuan UI/UX yang belum fix? | Ya → Track C / Tidak |
   | Apakah fix/flow ini berdampak ke flow lain? | Ya → cross-flow regression / Tidak |

7. Simpan list "logic yang sudah ter-cover unit test" di `reports/audit/[NAMA_FLOW].md` section:
   ```
   ## Unit Test Coverage
   - function/path → file test → kasus yang di-cover
   ```

8. Update `reports/status.md` kolom "Vitest" dan track gate (E2E/Track B/Track C/Final).

Di akhir jawaban, WAJIB isi:
INSTRUKSI YANG DIMINTA: [ringkas]
YANG SAYA LAKUKAN: [ringkas]
ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya / Tidak]
LANGKAH SELANJUTNYA: [lanjut E2E/Track B/Track C, atau selesai Track A]
```

---

## Update reports/status.md

Setelah setiap tahap selesai, update `reports/status.md` segera.

Format minimum per flow:

| Flow | Scope | Audit | Fix | Vitest | E2E | Track B | Track C | Final | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `[NAMA_FLOW]` | Done/Belum | Done/Belum | Done/In Progress | Done/Belum | Done/Pending/Skip | Done/Pending/N/A | Done/Pending/N/A | AMAN/CLEAR/IN PROGRESS/ADA ISU | link ke audit |

- `CLEAR` = Tahap 0-3 selesai, unit test PASS, E2E/Track B/C pending atau tidak dibutuhkan.
- `AMAN` = CLEAR + E2E (kalau perlu) + Track B/C (kalau perlu) selesai.
- `ADA ISU` = masih ada gap yang belum difix atau perlu keputusan user.

---

## Link ke Panduan Lain

| File | Isi | Kapan dipakai |
|---|---|---|
| `reports/workflow/execution-guide-e2e-playbook.md` | E2E integration testing (Playwright). | Track Gate memutuskan butuh E2E. |
| `reports/workflow/execution-guide-track-b.md` | Vitest Deep Dive (mutation, flaky, maintainability). | Track Gate memutuskan test quality perlu diperdalam. |
| `reports/workflow/execution-guide-track-c.md` | UI/UX Walkthrough (visual, interaction, accessibility). | Track Gate memutuskan UI/UX perlu diperdalam. |
| `reports/workflow/execution-guide-appendix-maintenance.md` | Discovery Check, Delta Re-Verification, re-orientasi. | Periodik atau setelah rule berubah. |

---

## Cara Baca Self-Report Checkpoint

Tiap laporan Devin, cari dulu 4 baris ini:

```
INSTRUKSI YANG DIMINTA: ...
YANG SAYA LAKUKAN: ...
ADA PENYIMPANGAN DARI INSTRUKSI?: ...
LANGKAH SELANJUTNYA: ...
```

- **"Ya, jelaskan..."** → hal pertama yang lu respons.
- **"Tidak" tapi "YANG SAYA LAKUKAN" lebih luas dari instruksi** → tanya balik.
- **"LANGKAH SELANJUTNYA"** → ikutin.
- **Nggak ada sama sekali** → red flag, minta isi ulang.

---

## Urutan Prioritas Flow (Rujukan Cepat)

1. `checkout-flow` — risiko finansial tertinggi (Midtrans).
2. `design-simulator-flow` — imposition math, output produksi.
3. `whatsapp-notification-flow` — notifikasi order ke admin.
4. `landing-page-flow` — konversi utama.
5. `production-dashboard-flow` — backlog, ops internal (belum ada).
