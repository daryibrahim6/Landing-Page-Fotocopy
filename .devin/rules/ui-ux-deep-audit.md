# UI/UX Deep Audit — Coverage Semua Design Pattern

> Dipakai saat Track C / UX walkthrough suatu flow. Tujuan: tidak ada pattern interaksi yang kelewat — bukan cuma "halaman tidak rusak".
>
> Base checklist lengkap ada di `.devin/rules/qa-qc-workflow-and-status-tracking.md` (section UI/UX + Kelas Blind Spot ke-6). Rule ini melengkapinya dengan pattern-coverage matrix + mandat riset eksternal.

## 1. Pattern Coverage Matrix — WAJIB dicek SEMUA yang ada di flow

Untuk setiap halaman/komponen di flow, cek tiap pattern yang relevan. Kalau pattern tidak ada di halaman itu, catat "N/A" — jangan diam-diam skip.

> **Konteks BisaPrint:** tidak ada auth/session dan realtime — baris "Auth & Session" dan "Realtime" default `N/A` sampai `production-dashboard-flow` dibangun (yang akan butuh auth admin). Baris lain tetap relevan (Forms di checkout/konsultasi, Lists di katalog, Media & Files di upload/simulator, Errors, dst).

| Pattern | Yang dicek |
|---|---|
| **Forms** | validasi inline vs on-submit; pesan error per field bukan toast generik; data preservation saat submit gagal; disabled-submit dengan helper text; konfirmasi sebelum destructive action; autosave/dirty warning |
| **Lists & Tables** | empty state (3 elemen: context+direction+CTA); loading skeleton; pagination/infinite scroll; sort/filter feedback; row action visibility; density di mobile |
| **Modals & Dialogs** | focus trap; focus kembali ke trigger setelah tutup; Esc/overlay-click behavior; scroll lock; tidak pakai `confirm()`/`alert()` native; konten scrollable di mobile |
| **Navigation** | active state genuinely distinct; breadcrumb di nested pages; back behavior masuk akal; link destination diverifikasi benar; mobile nav pattern (Sheet/drawer, bukan `<details>`) |
| **Feedback** | toast sukses/error untuk setiap aksi non-navigasi; loading state di tombol submit; optimistic update dengan rollback; `aria-live` untuk update dinamis; progress untuk operasi panjang |
| **Realtime** | indikator koneksi (online/offline/reconnecting); data staleness indicator; reconnect behavior graceful; event duplication handling |
| **Search & Filter** | hasil kosong dengan saran; filter aktif terlihat jelas; clear-all; debounce input; keyboard navigable results |
| **Media & Files** | upload progress; validasi tipe/ukuran sebelum upload; preview; error saat upload gagal; image fallback/alt |
| **Auth & Session** | session expiry handling; redirect setelah login ke halaman asal; logout konfirmasi; state setelah token expired di tengah form |
| **Errors** | 404/500 page branded dengan jalan pulang; inline error dengan recovery action; error boundary fallback; tidak ada raw stack/technical error ke user |
| **Print/Share/Download** | export/download dengan feedback; file name bermakna; share link works |

## 2. Dimensi lintas-pattern (wajib tiap halaman)

- **Responsive**: mobile 375px + tablet 768px + desktop 1440px — screenshot evidence untuk temuan.
- **Keyboard**: Tab order masuk akal; Enter/Space/Esc bekerja; focus visible; focus tidak tersembunyi di balik sticky element (WCAG 2.4.11).
- **Screen reader**: role/label di elemen interaktif; `aria-live` untuk update dinamis; heading hierarchy benar; form inputs punya label programatis.
- **Kontras & teks**: WCAG AA 4.5:1 teks normal; touch target ≥44px; teks tidak terpotong (`line-clamp`/`truncate` dengan tooltip/title).
- **Motion**: animasi tidak menghambat tugas; `prefers-reduced-motion` dihormati; tidak ada animasi blocking input.
- **Copy/i18n**: bahasa konsisten (id-ID); terminologi sama antar halaman; tanggal/mata uang locale benar; tidak ada jargon teknis ke user.
- **State coverage**: setiap tampilan data punya loading/empty/error/partial yang distinct.

## 3. Mandat riset eksternal (WAJIB per flow)

Sama seperti Track A — UI/UX audit tidak boleh hanya opini internal. Untuk setiap flow Track C:

1. Riset pattern standar untuk komponen kunci flow itu (contoh: checkout → Baymard; dashboard → SaaS design patterns; form multi-step → NN/g wizard guidelines).
2. Sumber wajib: WCAG 2.2 untuk a11y, NN/g heuristics untuk usability, panduan library yang dipakai (Radix/shadcn/Tailwind), platform guideline (Material/HIG) kalau relevan.
3. Tulis di audit file: `### Riset Eksternal (UI/UX)` — tabel `Pattern | Current | Best practice (sumber) | Gap | Rekomendasi`.
4. Temuan dari riset = advisory (Kategori B) kecuali bug objektif (Kategori A).

## 4. Output wajib Track C

- `reports/audit/<flow>.md` — temuan `[FLOW]-UX-NN` dengan severity + opsi + screenshot evidence.
- `reports/screenshots/<flow>/` — bukti visual dengan naming convention kanonik.
- `reports/status.md` — kolom Track C + catatan.
- Cross-surface check: walkthrough minimal 2 surface yang berbagi komponen sejenis (contoh: landing page vs `/checkout` vs `/simulator`; card produk vs card portfolio; form konsultasi vs form checkout), bandingkan konsistensinya.

## 5. Larangan

- Jangan selesaikan Track C hanya dengan "halaman terlihat OK di desktop".
- Jangan audit hanya dari satu role/viewport.
- Jangan treat bug objektif (Kategori A) sebagai advisory — masuk temuan audit standar, wajib fix.
