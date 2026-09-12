---
trigger: manual
---

# Rules: Next.js Build & CI/CD Optimization Standard

Rules ini berlaku always-on untuk semua task yang berhubungan dengan build, deployment, CI/CD pipeline, dan optimasi performa di project ini.

## Prinsip Utama

**Build gagal (crash) dan build lambat/tidak optimal itu dua masalah berbeda — tapi seringnya root cause-nya sama: rendering strategy yang salah untuk jenis data yang ada.** Selalu diagnosis dulu penyebab sebenarnya sebelum menambal gejala (contoh: menaikkan timeout limit bukan fix, itu cuma menunda gejala yang sama muncul lagi).

## 1. Rendering Strategy — Wajib Dipertimbangkan per Halaman

Setiap halaman/route HARUS ditentukan strategi render-nya secara sadar, bukan default begitu saja. Tanyakan untuk tiap halaman:

- **Seberapa sering data di halaman ini berubah?** (real-time / beberapa kali sehari / jarang berubah / statis permanen)
- **Apakah datanya bisa berubah tanpa deploy?** Kalau iya (katalog dari CMS/DB di masa depan), halaman itu TIDAK BOLEH pakai SSG murni tanpa revalidation strategy.
- **Apakah build-time external access reliable?** Kalau halaman fetch data dari service eksternal saat build (SSG), dan koneksi dari build/CI environment tidak reliable, build TIDAK BOLEH bergantung sepenuhnya pada koneksi itu berhasil — harus ada fallback graceful, bukan crash total.

Panduan pemilihan strategi:
- **Static (SSG) murni** — hanya untuk data yang benar-benar tidak pernah berubah tanpa deployment baru (contoh: halaman legal/terms yang di-hardcode di code).
- **ISR + on-demand revalidation** (`revalidatePath` / `revalidateTag`) — pilihan untuk data yang bisa berubah tanpa deploy tapi tidak per-detik (kalau nanti katalog pindah dari `src/data/` ke CMS/DB).
- **ISR interval-based** (`revalidate: <detik>`) — untuk data yang berubah dari luar sistem, seperti sitemap.
- **Dynamic rendering** (`force-dynamic`) — hanya untuk data yang benar-benar harus per-request (contoh: `/checkout/success` yang baca status order real-time dari Upstash).

> **Konteks BisaPrint:** data katalog produk/FAQ/portfolio = static di `src/data/` → halaman publik idealnya **full SSG**. Yang dynamic hanya API routes (Midtrans, orders, upload) — itu memang dynamic by nature, bukan halaman.

**JANGAN pernah membuat build gagal total (`exit code 1`) hanya karena satu halaman gagal fetch data saat build.** Build failure harus reserved untuk error kode yang genuinely breaking, bukan untuk kegagalan koneksi eksternal yang sementara.

## 2. Build Time External Service Access

- **Server component yang di-render saat build time (SSG/ISR) TIDAK BOLEH memanggil service eksternal yang butuh secret/network** (Midtrans API, Upstash Redis, Vercel Blob) — supaya proses build tidak bergantung pada ketersediaan service itu. Ini aturan mutlak. `try-catch` cuma mitigasi — solusi fundamental adalah tidak menyentuh service itu saat build.
- Build/CI environment TIDAK BOLEH diasumsikan punya env production (`UPSTASH_*`, `BLOB_*`, `MIDTRANS_SERVER_KEY`) — halaman statis harus bisa di-build tanpa env itu sama sekali.
- Kalau ada halaman yang tetap butuh data runtime saat build, WAJIB ada error handling graceful (try-catch dengan fallback), bukan biarkan proses crash dan exit dengan error code.
- Diagnosis timeout di build log HARUS dibedakan: apakah service-nya lambat atau memang tidak bisa dijangkau dari environment CI. Dua penyebab ini butuh solusi berbeda — jangan asumsi salah satu tanpa bukti dari log.

### Pattern yang benar per jenis halaman (BisaPrint):
- **Public pages (landing `/`, `/simulator`)**: fully static — data dari `src/data/` di-bundle saat build, zero network. Jangan fetch apa pun di server component halaman ini.
- **`/checkout`**: boleh client component yang fetch API route saat runtime (harga, token). Shell statis, interaksi di client.
- **API routes** (`/api/midtrans/*`, `/api/upload`): dynamic by default — boleh akses Upstash/Blob/Midtrans karena jalan per-request.
- **Sitemap**: static atau `force-dynamic` — jangan query external service di dalamnya.

## 3. Data & External Call Performance

- Data statis (`src/data/products.ts`, `faq.ts`, dll) di-bundle — aman. Yang perlu diawasi: **client-side fetch berulang** dan pemanggilan service eksternal.
- Jangan panggil Upstash/Blob/Midtrans di dalam loop per item — batch atau cache hasilnya.
- Lookup order (`order-storage.ts`) di API route harus single-call per request — jangan re-fetch Redis berkali-kali dalam satu handler.
- Data yang jarang berubah (katalog produk, config) jangan di-fetch ulang dari storage setiap request — `src/data/` sudah jawabannya.

## 4. Bundle & Asset Optimization

- Import library secara spesifik (`import debounce from 'lodash/debounce'`), hindari full import yang menggagalkan tree-shaking.
- Semua gambar wajib pakai `next/image`, bukan tag `<img>` biasa — untuk lazy loading dan auto-format otomatis.
- Font wajib pakai `next/font`, bukan external link yang render-blocking.
- Cek dependency yang ter-install tapi tidak dipakai (dead code) secara berkala.

## 5. Environment & CI/CD Configuration

- Semua environment variable yang dibutuhkan saat build (bukan cuma runtime) HARUS dipastikan ter-set di CI/CD pipeline config, jangan asumsi otomatis sama seperti `.env.local` di lokal.
- Node version di CI environment harus konsisten dengan yang dipakai di local development — cek `engines` di `package.json` kalau ada warning `EBADENGINE`.
- Kalau ada warning dependency (`EBADENGINE`, deprecated package, dll) di build log, laporkan ke user meskipun build masih sukses — itu potensi masalah yang akan muncul di masa depan.

## 6. Cara Diagnosis Build Error (Prosedur Wajib)

Saat build/CI gagal, JANGAN langsung asumsi penyebabnya dari baris error paling akhir. Prosedur yang benar:

1. Baca log dari bagian tengah/awal kegagalan, bukan cuma baris terakhir (`exit code 1` itu cuma gejala akhir, bukan penyebab).
2. Identifikasi tahap mana yang gagal (compile / typecheck / static generation / collect page data / dll) — masing-masing tahap punya kelas masalah berbeda.
3. Kalau errornya berhubungan dengan network/timeout saat static generation, curigai rendering strategy yang salah (lihat bagian 1) sebagai kemungkinan pertama, bukan cuma infrastructure issue.
4. Kalau errornya soal TypeScript/compile, itu murni code issue — beda kelas penyelesaian dengan masalah rendering strategy.
5. Jangan pernah menambal dengan menaikkan angka (timeout limit, retry count, memory limit) sebagai solusi utama — itu boleh jadi mitigasi sementara TAPI harus disertai penjelasan apa akar masalah sebenarnya dan rencana fix permanennya apa.

## 7. Setelah Fix — Verifikasi Wajib

- Jalankan `npm run build` secara lokal dan pastikan sukses SEBELUM push ke CI, terutama kalau perubahan menyentuh rendering strategy atau data fetching.
- Kalau fix melibatkan `revalidatePath`/`revalidateTag`, verifikasi manual: lakukan aksi yang memicu revalidate, cek apakah halaman publik ter-update tanpa perlu rebuild.
- Laporkan ke user: halaman apa saja yang terpengaruh perubahan, strategy render final tiap halaman, dan alasan pemilihannya — bukan cuma "sudah difix".

## 8. Deployment — Vercel & External Services

BisaPrint deploy ke Vercel (serverless). Tidak ada Dockerfile, tidak ada database/migration, tidak ada custom server — `next dev`/`next start` standar.

### Env vars di Vercel

- **Wajib di production:** `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `ADMIN_WHATSAPP_NUMBER`.
- **Opsional:** `META_PIXEL_ID`, `GOOGLE_ANALYTICS_ID`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — kalau kosong, fitur terkait harus no-op gracefully (bukan error).
- `NEXT_PUBLIC_*` di-inline saat build → nilai production WAJIB di-set di Vercel env **sebelum** build. Mengubahnya butuh rebuild.
- Jangan pernah masukkan secret non-public ke `NEXT_PUBLIC_*` — itu bocor ke bundle client.

### Order storage — in-memory vs Upstash

- `src/lib/order-storage.ts` pakai **in-memory fallback saat dev** dan **Upstash Redis di production**. Di Vercel serverless, in-memory TIDAK persist antar invocation/instance — jadi order lookup di production **wajib** Upstash terkonfigurasi. Jangan ship ke production dengan in-memory store.
- Webhook Midtrans (`/api/midtrans/webhook`) adalah writer utama status order — pastikan idempotent (Midtrans bisa kirim notifikasi duplikat).

### Webhook & function limits

- Route handler Vercel punya max duration (default Hobby ~10-60s tergantung plan). Webhook harus fast-ack: verifikasi signature → update order → balas 200 secepatnya; pekerjaan berat (notif WA, upload besar) jangan blocking response.
- Upload file via `/api/upload` → Vercel Blob — request body limit serverless berlaku; file >4.5MB sebaiknya pakai client-side direct upload ke Blob (`@vercel/blob/client` `upload()`), bukan lewat route handler.

### Cold start & bundle

- `react-konva` + `jspdf` berat — pastikan hanya di-load di halaman `/simulator` / panel simulator via dynamic import, jangan masuk bundle landing page.
- Gambar di `public/assets` sudah WebP — tetap lewat `next/image` supaya dapat optimasi Vercel.
