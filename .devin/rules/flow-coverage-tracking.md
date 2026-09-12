---
trigger: always_on
---

# Flow Coverage Tracking — WAJIB Semua Flow di reports/audit Kena Re-Audit

> Aturan ini memaksa setiap re-audit/reprompt plan mencakup **seluruh file audit** yang ada di `reports/audit/*.md`. Tidak boleh ada flow yang terlewat dalam planning, termasuk distributed flow dan cross-audit/page-audit.
> Micro-UX tracking wajib aktif: setiap elemen interaktif yang memicu aksi harus menghasilkan feedback yang terlihat (contoh: tombol admin di-klik tanpa toast/notif = bug objektif).

---

## 1. Coverage Gate (WAJIB Sebelum Plan Batch)

Setiap kali menyusun rencana eksekusi/re-audit/reprompt, jalankan gate ini:

1. **Enumerate `reports/audit/*.md`.** Jumlah file = **kontrak coverage** saat ini (BisaPrint: 5 file = 5 flow). Jika berubah, update `reports/flow-coverage-matrix.md`.
2. **Bandingkan dengan tabel `Flow Tracker` di `reports/status.md`.** Setiap file audit WAJIB punya 1 baris. Jika tidak, update status.md atau audit file-nya.
3. **Setiap flow, termasuk yang `Distributed`, WAJIB muncul di rencana batch** dengan `Next Action` eksplisit.
4. **Distributed flow** dengan status `DISTRIBUTED (CLEAR / IN PROGRESS)` WAJIB dijelaskan:
   - Flow induk mana yang menutupi logikanya.
   - File test (Vitest/E2E) mana yang membuktikan coveragenya.
   - Jika ada logic unik yang belum tercover di parent flow, flow itu WAJIB di-audit tersendiri — tidak boleh "distributed" jadi alasan skip.
5. **Cross-audit files** di `reports/cross-audits/*.md` dan **page-audit** di `reports/page-audits/*.md` (kalau sudah ada) WAJIB di-enumerate dan dimasukkan ke rencana appendix/cross-cutting, tidak boleh terlewat.

---

## 2. Micro-UX / Feedback Sweep

Setiap flow yang sedang di-audit/re-test WAJIB jalankan micro-UX sweep. Setiap elemen interaktif (button, link, form submit, icon button) yang memicu aksi non-navigasi WAJIB menghasilkan feedback yang terlihat:

- **Loading/disabled state** saat menunggu server (lihat `quality-radar.md` K11 — Interaction State Missing).
- **Toast/snackbar/inline confirmation** saat sukses.
- **Toast/inline error** saat gagal.
- **`aria-live` region** untuk screen reader pada feedback dinamis (lihat `quality-radar.md` K12 — A11y Silent Missing).

### Contoh temuan wajib ditangkap

- "Clickable di admin tapi gak muncul notif toast" → **bug objektif Kategori A**: user tidak tahu aksi-nya berhasil/gagal. WAJIB fix dan test.
- Tombol submit form tanpa loading/disabled → **K11**.
- Error API hanya muncul di console, tidak di UI → **K13/K14 + anti-pattern #12/#13**.

### Cara dokumentasi

Temuan micro-UX Kategori A masuk `reports/audit/[flow].md` dengan format standar:

```
- ID: [FLOW]-UX-NN
- Severity: P0 / P1 / P2 / P3
- Skenario: elemen X di halaman Y, saat diklik/tap, tidak ada feedback
- Bukti: screenshot + file/line
- Risiko: user mengira aksi gagal dan klik berulang, race condition, data duplikat
- Opsi solusi: 2+ opsi
- Rekomendasi Devin
- Status: OPEN / FIXED — dan ikuti "Kebijakan Clearance Temuan" + "Temuan Cross-Flow: Fix In Place" + "Sweep findings propagasi ke flow pemilik" di `qa-qc-workflow-and-status-tracking.md` (temuan sweep WAJIB masuk audit flow pemilik, bukan cuma sweep report)
```

---

## 3. Distributed Flow Coverage Verification

Sebelum status distributed flow dianggap `CLEAR` atau `AMAN`, WAJIB:

1. **Tulis parent flow(s) dan file test yang memverifikasi.** Contoh pola di BisaPrint:
   - `whatsapp-notification-flow` → sebagian logic-nya hidup di `checkout-flow` (webhook Midtrans → notifikasi WA admin). Vitest `src/lib/notification.test.ts` + `wa.test.ts` membuktikan coverage; E2E checkout membuktikan integrasi.
   - File upload di checkout → cover di `checkout-flow` (upload via `/api/upload` → Vercel Blob). Tidak perlu flow terpisah di MVP.
   - Kalau nanti `production-dashboard-flow` dibangun dan menyerap logic order tracking, daftarkan mapping parent-nya di sini.
2. **Spot-check parent flow test** untuk confirm distributed logic benar-benar ada. Jika tidak ada, tambahkan test atau audit tersendiri.
3. **Update `reports/flow-coverage-matrix.md`** dengan bukti parent flow + file test.

---

## 4. Coverage Matrix Source of Truth

File `reports/flow-coverage-matrix.md` adalah single source of truth untuk mapping semua flow audit ke batch, prioritas, dan next action. Update setiap kali:

- Status flow berubah di `reports/status.md`.
- Distributed flow terverifikasi coveragenya.
- Cross-audit/page-audit selesai atau ditemukan gap baru.
- Micro-UX sweep menghasilkan temuan yang fix.

## 4b. Milestone Sync

Setiap kali satu flow selesai satu tahap besar (Track A / E2E / Track B / Track C / Final AMAN), WAJIB update `milestones/milestones.md` di tabel milestone QA/QC/re-audit yang aktif:

- Update kolom status flow yang bersangkutan (✅ Done / 🔄 In Progress / ⬜ Belum).
- Update counter progress flow selesai re-audit penuh (X dari total flow terdaftar).
- Deskripsi ditulis ringkas tapi akurat — bukti (jumlah test, commit, temuan) boleh disebut; jangan klaim tanpa bukti.

Milestone QA/QC adalah tracking internal ronde re-audit, bukan task fitur. Format mengikuti tabel milestone yang sudah ada.

---

## 5. Checklist Sebelum Declare "Plan Lengkap"

- [ ] `reports/audit/*.md` di-enumerate — jumlah = X, cocok dengan baris di `status.md`.
- [ ] Semua flow terdaftar muncul di rencana batch.
- [ ] Semua distributed flow punya parent flow + file test.
- [ ] `reports/cross-audits/*.md` dan `reports/page-audits/*.md` (kalau ada) punya slot di cross-cutting plan.
- [ ] Micro-UX sweep checklist dijalankan per flow yang masuk scope.
- [ ] `reports/flow-coverage-matrix.md` di-update.
