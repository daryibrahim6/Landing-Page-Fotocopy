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
- **Apakah datanya bisa di-CRUD dari admin panel atau sumber dinamis lain?** Kalau iya, halaman itu TIDAK BOLEH pakai SSG murni tanpa revalidation strategy.
- **Apakah build-time database access reliable?** Kalau halaman fetch data database saat build (SSG), dan koneksi ke DB dari build/CI environment tidak reliable (network restriction, VPC, dsb), build TIDAK BOLEH bergantung sepenuhnya pada koneksi itu berhasil — harus ada fallback graceful, bukan crash total.

Panduan pemilihan strategi:
- **Static (SSG) murni** — hanya untuk data yang benar-benar tidak pernah berubah tanpa deployment baru (contoh: halaman legal/terms yang di-hardcode di code).
- **ISR + on-demand revalidation** (`revalidatePath` / `revalidateTag` dipanggil dari action CRUD admin) — DEFAULT pilihan untuk data yang bisa di-CRUD dari admin tapi tidak berubah setiap detik (FAQ, kategori, halaman informasi, listing yang di-manage admin). Ini adalah keseimbangan terbaik: cepat (statis) tapi tetap fresh begitu ada perubahan.
- **ISR interval-based** (`revalidate: <detik>`) — untuk data yang berubah dari luar sistem (misal user baru mendaftar sendiri, bukan lewat admin CRUD eksplisit), seperti sitemap atau listing consultant publik.
- **Dynamic rendering** (`force-dynamic`) — hanya untuk data yang benar-benar harus real-time per-request (dashboard personal, data transaksi sensitif) atau bergantung pada auth/session per user.

**JANGAN pernah membuat build gagal total (`exit code 1`) hanya karena satu halaman gagal fetch data saat build.** Build failure harus reserved untuk error kode yang genuinely breaking, bukan untuk kegagalan koneksi eksternal yang sementara.

## 2. Build Time Database Access

- **Server component yang di-render saat build time (SSG/ISR) TIDAK BOLEH query database langsung — harus lewat API route yang dipanggil di client-side saat runtime, supaya proses build tidak bergantung pada ketersediaan database.** Ini adalah aturan mutlak, bukan saran. `try-catch` dan `connect_timeout` cuma mitigasi — solusi fundamental adalah tidak menyentuh database saat build.
- Build/CI environment TIDAK BOLEH diasumsikan punya akses stabil ke production/staging database, kecuali sudah diverifikasi eksplisit (network whitelist, VPC config, dll).
- Kalau ada halaman yang fetch database saat build (SSG), WAJIB ada error handling graceful (try-catch dengan fallback data kosong/default), bukan biarkan proses crash dan exit dengan error code.
- Diagnosis timeout di build log HARUS dibedakan: apakah database-nya lambat (query perlu optimasi/index) atau memang tidak bisa dijangkau sama sekali dari environment CI (network/infrastructure issue). Dua penyebab ini butuh solusi berbeda — jangan asumsi salah satu tanpa bukti dari log.

### Pattern yang benar per jenis halaman:
- **Public pages dengan data dinamis (FAQ, home, listing)**: Server component render shell statis (metadata, layout) → client component fetch data via API route + TanStack Query. Build tidak menyentuh database sama sekali.
- **Public pages dengan data semi-statis (category, consultant detail)**: `export const dynamic = "force-dynamic"` — render di request time, bukan build time. Database query jalan saat user buka halaman, bukan saat build.
- **Sitemap**: `export const dynamic = "force-dynamic"` — generate di request time.
- **Dashboard/admin pages**: API Route + TanStack Query (sudah standar project).

## 3. Database Query Performance

- Cek `select` di setiap query Prisma — ambil hanya kolom yang dibutuhkan, jangan default fetch semua kolom.
- Pastikan ada index di database untuk kolom yang sering dipakai untuk filter/where/orderBy (foreign key, slug, email, status, dll).
- Hindari N+1 query — gunakan `include`/`select` dengan relasi langsung, bukan loop query terpisah per item.
- Query yang datanya jarang berubah (kategori, config) sebaiknya di-cache di level aplikasi, bukan query database di setiap request.

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
2. Identifikasi tahap mana yang gagal (compile / typecheck / static generation / prisma generate / dll) — masing-masing tahap punya kelas masalah berbeda.
3. Kalau errornya berhubungan dengan database/network timeout saat static generation, curigai rendering strategy yang salah (lihat bagian 1) sebagai kemungkinan pertama, bukan cuma infrastructure issue.
4. Kalau errornya soal TypeScript/compile, itu murni code issue — beda kelas penyelesaian dengan masalah rendering strategy.
5. Jangan pernah menambal dengan menaikkan angka (timeout limit, retry count, memory limit) sebagai solusi utama — itu boleh jadi mitigasi sementara TAPI harus disertai penjelasan apa akar masalah sebenarnya dan rencana fix permanennya apa.

## 7. Setelah Fix — Verifikasi Wajib

- Jalankan `npm run build` secara lokal dan pastikan sukses SEBELUM push ke CI, terutama kalau perubahan menyentuh rendering strategy atau data fetching.
- Kalau fix melibatkan `revalidatePath`/`revalidateTag`, verifikasi manual: lakukan aksi CRUD dari admin panel, cek apakah halaman publik ter-update tanpa perlu rebuild.
- Laporkan ke user: halaman apa saja yang terpengaruh perubahan, strategy render final tiap halaman, dan alasan pemilihannya — bukan cuma "sudah difix".

## 8. Container, Migration, dan Multi-Replica

### Migration di Container Startup

Saat ini `Dockerfile` menjalankan `npx prisma migrate deploy` sebagai best-effort sebelum `npm start`:

```dockerfile
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["sh", "-c", "timeout 60 npx prisma migrate deploy || echo 'migrate deploy failed/timed out (DB unreachable or locked), continuing startup'; exec npm start"]
```

Pertimbangan:

- **Pro:** container baru selalu migrate sebelum serve, cocok untuk deploy otomatis; `timeout 60` memastikan container tetap start meski DB tidak reachable.
- **Contra:** startup pod bergantung ke koneksi DB. Kalau DB network unreachable, migration gagal dan app bisa crash di query pertama.
- **Contra:** `PORT` berasal dari `.env` yang di-inject via `ARG ENV_DEV`. `.env.example` default `PORT=3000`. Kalau K8s/nginx di-staging masih forward ke `3000`, `server.ts` listen `3000` → aman. Kalau K8s/nginx forward ke port lain (misal `30056`), `server.ts` akan listen `3000` dan K8s/nginx tidak bisa connect → **502 Bad Gateway**.
  - **Fix (port default):** gunakan `ENV PORT=3000` di Dockerfile supaya defaultnya konsisten dengan `.env.example`. K8s tetap bisa override `PORT` via pod spec kalau diperlukan.
  - **Fix (jika K8s pakai port lain):** jangan hardcode port berbeda di Dockerfile; ubah `containerPort`/`targetPort` di manifest K8s menjadi `3000`, atau set `PORT` env di pod spec sesuai `containerPort`.
- **Future gap:** kalau scale horizontal, tiap pod akan coba migrate bersamaan. Prisma `migrate deploy` idempotent, tapi di replicaset besar ini memperlambat startup dan menambah load DB. Pertimbangkan **init container khusus migration** atau job external (GitLab `deploy:migrate`) setelah image jalan.

### Migration Job di CI/CD

- `.gitlab-ci.yml` sebelumnya punya job `deploy:migrate` untuk menjalankan `npx prisma migrate deploy` sebelum `deploy:trigger`; saat ini job tersebut sudah dihapus dan migrate dianggap di container.
- Jika runner tidak punya akses network ke DB staging, `allow_failure: true` boleh jadi **mitigasi sementara** supaya pipeline deploy tetap jalan — tapi ini tech debt. Wajib dipantau dan diubah ke `allow_failure: false` begitu network access tersedia.
- Container tetap menjalankan `prisma migrate deploy` di startup sebagai safety net, tapi **jangan dianggap cukup** untuk production multi-replica.

### Multi-Replica & Socket.IO

- `server.ts` menginisialisasi Socket.IO server dengan in-memory adapter (`__io`).
- Kalau app di-scale ke ≥2 pod, notifikasi/session room yang disimpan di memory **tidak ter-replikasi antar pod**.
- **Opsi A (rekomendasi kalau scale):** ganti ke Redis adapter (`socket.io-adapter-redis`) supaya state socket terdistribusi.
- **Opsi B (saat ini):** tetap single replica atau pakai sticky sessions di load balancer (risk: single point of failure, tidak truly scalable).
- **Future gap:** balik ke `t164-websocket` untuk verifikasi koneksi di staging dan putuskan apakah butuh adapter external.

### Self-Signed HTTPS / Reverse Proxy

- Kalau app di-deploy di private network dengan self-signed cert, server-side `fetch` ke API sendiri **WAJIB** target `http://127.0.0.1:${process.env.PORT || "3000"}`, bukan public `APP_URL`.
- `INTERNAL_API_URL` override harus disediakan kalau `APP_URL` pakai HTTPS self-signed (Node fetch gagal verify cert dan bisa gagal NAT loopback).
