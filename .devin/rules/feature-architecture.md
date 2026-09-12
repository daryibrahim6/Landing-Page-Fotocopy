---
trigger: always_on
---

# Feature & Folder Architecture — BisaPrint

Project BisaPrint saat ini menggunakan struktur **monolithic di dalam `src/`** yang sesuai skala landing page + checkout MVP. Folder `src/` dipisah berdasarkan jenis file (app, components, data, lib, types), bukan berdasarkan domain/feature. Ini disengaja untuk kecepatan dan kompatibilitas dengan rebuild saat ini.

> **Catatan migrasi:** Jika di masa depan project bertambah kompleks (admin dashboard, CMS, multi-role, dll), pertimbangkan migrasi bertahap ke `/features/<feature-name>/` seperti pattern standar. Untuk sekarang, ikuti struktur `src/` di bawah.

## Struktur Folder Project

```
/src
  /app              # Routing, metadata, page composition
  /components       # UI components
    /sections       # Landing page sections (Hero, Kategori, Produk, dll)
    /shared         # Cross-cutting components (WhatsAppButton, WavyDivider, dll)
    /ui             # Base UI primitives (button, card, badge, accordion)
    /layout         # Header, Footer
    /design-simulator  # Kalkulator layout cetak
    /checkout       # Komponen checkout flow
  /data             # Static data: products.ts, faq.ts, portfolio.ts, testimonials.ts
  /lib              # Shared helpers, constants, utilities, clients
  /types            # Global TypeScript types
```

## Aturan yang Wajib Dipakai

### 1. Satu domain, satu tempat yang jelas
- **Data domain** (produk, FAQ, portfolio, testimoni) → `src/data/<domain>.ts`
- **Logic domain** (imposition, pricing, WA builder, Midtrans) → `src/lib/<domain>.ts`
- **UI domain** (kalkulator, checkout, section khusus) → `src/components/<domain>/`
- **Layout global** (header, footer) → `src/components/layout/`
- **Base UI** (button, card, input) → `src/components/ui/`

### 2. Shared resources hanya untuk cross-cutting
File yang dipakai lebih dari 1 domain boleh disimpan di `src/lib/` atau `src/components/shared/`.

Contoh shared:
- `src/lib/utils.ts` — `cn`, `formatPrice`, `formatDate`
- `src/lib/constants.ts` — `APP_NAME`, `WA_NUMBER`, `SITE_URL`
- `src/components/ui/` — button, card, badge, accordion
- `src/components/shared/` — WhatsAppButton, WavyDivider, SectionHeader

### 3. Jangan campur data domain di satu file besar
`src/data/products.ts` boleh mengandung data produk, tapi jika ada transformasi/filter/complex logic, pindahkan ke `src/lib/products.ts` atau `src/lib/pricing.ts`.

### 4. App Router hanya routing + metadata + composition
File di `src/app/[path]/page.tsx` sebaiknya hanya berisi routing, metadata, dan composition. Business logic, data, dan UI di-import dari `src/components/`, `src/data/`, `src/lib/`.

### 5. Naming convention
- **Folder**: kebab-case untuk folder (`design-simulator`, `product-catalog`)
- **File**: PascalCase untuk components, camelCase untuk data/lib/types
- **Types/Interfaces**: PascalCase, misal `Product`, `Order`, `ImpositionResult`
- **Data file**: `products.ts`, `faq.ts` (plural domain)
- **Lib file**: `paper-sizes.ts`, `midtrans.ts`, `wa.ts`, `pricing.ts`

### 6. Jangan ada circular dependency antar domain
`src/lib` boleh import `src/data`, tapi `src/data` tidak boleh import `src/lib` yang mengandung client/server-specific code. `src/components` boleh import `src/lib` dan `src/data`.

### 7. Dokumentasi fitur
Setiap fitur/domain baru minimal punya 1 baris komentar di file utamanya yang menjelaskan: fitur ini apa, file patokan, catatan penting.

## Data Fetching Pattern

| Pattern | Kapan dipakai | Contoh |
|---------|--------------|--------|
| Server Component + static data | Public read-only pages, data dari `src/data/` | Home, katalog, FAQ |
| API Route + client fetch | Checkout, payment token, file upload | `/api/midtrans/create-token`, `/api/upload` |
| Route Handlers | Webhooks external | `/api/midtrans/webhook` |

### Aturan Data Fetching
1. Public pages BOLEH import data dari `src/data/` langsung di Server Component.
2. API routes WAJIB validasi input (Zod) dan handle error dengan baik.
3. External webhooks WAJIB verifikasi signature/source sebelum proses.
4. Route handlers untuk list WAJIB punya pagination jika datanya besar.
