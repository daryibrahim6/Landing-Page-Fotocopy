<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:routing -->
## WAJIB: Baca Rules Sesuai Jenis Task SEBELUM Kerja

Rules di `.devin/rules/` TIDAK semua always-on. Sebelum mulai task apapun, cek tabel ini, cari baris yang cocok dengan jenis task, dan **BUKA & BACA file rules yang direferensikan SEBELUM menulis satu baris code pun.** Kalau task menyentuh lebih dari satu kategori, baca semua rules yang relevan.

| Jenis Task | Wajib Baca File Ini Dulu |
|---|---|
| **SEMUA TASK (always-on)** | `.devin/rules/quality-radar.md` — defect detection mindset, 24 tipe kejanggalan (K1-K27), pre-ship audit |
| Build gagal, CI/CD error, deploy, rendering strategy (SSG/ISR/dynamic) | `.devin/rules/nextjs-build-cicd-optimization.md` |
| Nulis/edit test (Playwright/e2e), audit business gap, QA/QC | `.devin/rules/qa-qc-workflow-and-status-tracking.md` |
| **Re-audit/reprompt planning, batching flow, coverage tracking** | `.devin/rules/flow-coverage-tracking.md` — coverage gate: semua file di `reports/audit/*.md` wajib masuk plan; micro-UX feedback sweep per flow; matrix di `reports/flow-coverage-matrix.md` |
| **Flow registry, status vocabulary, auto-sync laporan** | `.devin/rules/flow-registry-and-status.md` — `reports/audit/*.md` = kontrak; flow baru wajib register 4 tempat; `AMAN`/`CLEAR` wajib didukung bukti audit; urutan Track A→Track C→E2E; reports wajib auto-sync tiap perubahan |
| **UI/UX audit / Track C / walkthrough visual** | `.devin/rules/ui-ux-deep-audit.md` — pattern coverage matrix (form/list/modal/nav/feedback/realtime/search/media/auth/error), 3 viewport + keyboard + screen reader, riset eksternal wajib (WCAG 2.2, NN/g, pattern library) |
| **Debug E2E flaky / test yang gagal berulang kali** | `.devin/rules/e2e-investigation-no-loop.md` — analisis root cause dulu, no blind re-run loop, targeted verify. Untuk perintah cepat bawaan lihat `.devin/workflows/e2e-fast-track.md` |
| **E2E / Playwright re-run setelah UI/seed/API change** | `.devin/rules/e2e-drift-prevention.md` — pre-flight drift scan: baca komponen/seed/API, cek `data-testid`, targeted verify sebelum full suite |
| Bikin fitur baru, nentuin arsitektur komponen/module | `.devin/rules/feature-architecture.md` |
| Pilih/organisasi library, dependency baru | `.devin/rules/lib-architecture.md` |
| Styling, komponen visual, layout, UI apapun | `.devin/rules/design-taste.md` (walaupun manual-trigger, WAJIB dibaca kalau task ini soal visual) |

**`quality-radar.md` is always-on** — apply 24 kejanggalan categories (K1-K27) ke setiap task tanpa peduli jenis task. Pre-ship audit (24 quick scan + 6 deep scan) WAJIB sebelum declare task selesai.

**Setelah baca rules yang relevan, sebutkan singkat di awal jawaban: "Baca [nama file] dulu, poin utama yang saya terapkan: ..."** — supaya user bisa cross-check rules-nya beneran dipakai bukan cuma dibaca sekilas.
<!-- END:routing -->

<!-- BEGIN:project-rules -->
## Project Rules (Selalu Berlaku, Semua Task)

1. **Skills-first**: Cek skill relevan sebelum coding. Sebut skill yang dipakai atau kenapa tidak ada yang relevan.
2. **Filter teknis jujur (bukan yes-man)**: Sebelum eksekusi, WAJIB evaluasi request user — cek konsistensi dengan codebase, edge case, bentrok dengan fitur lain. Kalau ada masalah, kasih bukti konkret dari code (file/fungsi), bukan "best practice" generik. Kalau aman, bilang aman dan jalan — jangan cari-cari masalah. Kalau 2+ cara, kasih trade-off + rekomendasi, user putusin. Kalau tech debt signifikan, WAJIB bilang sebelum eksekusi. Detail protocol di `.devin/rules/ponytail.md` section "Kritik Instruksi User".
3. **Data fetching default**: Public pages = Server Component + static data dari `src/data/`. Checkout/payment/order = API Route + client fetch. Webhook external = Route Handler dengan signature verification. Detail lengkap di `feature-architecture.md` — baca itu untuk task fitur baru.
4. **Milestone**: Baca `milestones/milestones.md` di awal setiap task.
5. **Reports**: Update `reports/` setiap perubahan signifikan (refactor/fitur baru/milestone), sesuai struktur di `qa-qc-workflow-and-status-tracking.md`.
6. **PRD/Blueprint**: `PRD_BisaPrint_Website.md` adalah spec produk awal — jangan pakai untuk keputusan sehari-hari tanpa konfirmasi user. Blueprint project lain ada di `_archive/`, bukan patokan aktif.
7. **Jangan pernah maksa test passed**: Kalau test error, diagnosis root cause dulu (app bug vs test outdated) sebelum ubah apapun. Ini berlaku di SEMUA konteks testing, tidak peduli rules spesifik apa yang lagi dipakai.
8. **Jangan klaim "selesai"/"aman"/"clear" tanpa bukti eksplisit**: Setiap laporan status harus disertai bukti dari code (file + behavior), bukan kesimpulan sepihak. Kalau ada item non-blocking / non-scope / noted-but-deferred, WAJIB sebutkan eksplisit bersamaan dengan statement "aman"/"clear" — jangan bilang "tidak ada yang perlu lu tangani" tanpa qualifier. Format wajib: "X findings VERIFIED, 0 OPEN. Tapi ada N item non-[scope] yang noted: [list singkat]. Mau fix atau skip?"
9. **Quality Radar (always-on)**: Setiap task WAJIB apply `.devin/rules/quality-radar.md` — 24 tipe kejanggalan (K1-K27) + pre-ship audit. Tidak peduli task type: UI, code, architecture, test, docs. Sebelum bilang "selesai", jalankan quick scan (24 pertanyaan) + deep scan (6 pertanyaan).
10. **WAJIB tutup SETIAP jawaban dengan self-report checkpoint berikut** (bukan cuma untuk task testing/QA — untuk SEMUA jenis task tanpa kecuali):
   ```
   INSTRUKSI YANG DIMINTA: [ringkas ulang instruksi user dalam 1-2 kalimat]
   YANG SAYA LAKUKAN: [ringkas actual action yang dieksekusi]
   ADA PENYIMPANGAN DARI INSTRUKSI?: [Ya, jelaskan / Tidak]
   LANGKAH SELANJUTNYA: [apa yang harus user lakukan sekarang — lanjut ke tahap berikutnya langsung, ATAU user perlu review/putuskan sesuatu dulu sebelum lanjut (sebutkan spesifik apa yang perlu direview/diputuskan dan kenapa)]
   ```
   Ini aturan tingkat tertinggi — kalau bagian ini di-skip di jawaban manapun, itu sendiri adalah pelanggaran instruksi. Tidak perlu user mengingatkan "baca rules" atau "tulis checkpoint" di tiap prompt — ini WAJIB otomatis muncul karena sudah ada di sini (always-on), terlepas dari prompt spesifik yang dipakai user memuat instruksi ini secara eksplisit atau tidak.
11. **Kepekaan sepanjang proses**: Kalau nemu kejanggalan di tengah task (kode gak konsisten, potensi bug, security gap), jangan didiemin. Kecil + solusi jelas → fix langsung + lapor. Besar/beresiko → STOP, lapor dengan alasan teknis, tunggu acc. Jangan tumpuk temuan sampai akhir. Detail di `.devin/rules/ponytail.md` section "Kepekaan Sepanjang Proses".
12. **E2E stuck = stop dan lapor**: Kalau satu test/skenario gagal di titik yang sama 2–3 kali berturut-turut, jangan coba-coba re-run tanpa evidence baru. Wajib: update `reports/status.md`, `reports/test-results/[flow].md`, dan `reports/cross-audits/review-change-report.md`, lalu lapor ke user dengan bukti konkret. Lihat `.devin/rules/e2e-investigation-no-loop.md`.
<!-- END:project-rules -->