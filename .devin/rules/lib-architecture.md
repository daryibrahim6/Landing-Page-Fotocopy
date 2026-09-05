---
trigger: always_on
---

# Lib Architecture Rules — BisaPrint

Folder `src/lib/` adalah shared layer untuk kode yang benar-benar cross-cutting dan reusable. Di project BisaPrint yang masih monolithic, `src/lib/` juga boleh mengandung business logic spesifik domain (misal `paper-sizes.ts`, `midtrans.ts`) selama itu bukan UI dan hanya pure logic/client helper.

## Prinsip Utama

1. **`src/lib/` = logic & utilities, bukan UI.** Komponen UI tetap di `src/components/`.
2. **Satu tanggung jawab per file.** Jangan campur imposition, pricing, WA, dan Midtrans dalam satu file.
3. **Pure functions di `utils.ts`.** Format, parse, clamp, slugify, `cn` di sini.
4. **Domain logic boleh di `src/lib/<domain>.ts`.** Contoh: `paper-sizes.ts` untuk imposition math, `pricing.ts` untuk kalkulasi harga, `wa.ts` untuk WA URL builder.
5. **Base client di file sendiri.** `midtrans.ts` untuk Midtrans client helper, `api-client.ts` (jika dibutuhkan) untuk base fetch.
6. **Minimal & tanpa boilerplate.** Hanya buat file di `src/lib/` jika dipakai lebih dari 1 tempat atau memang pure logic yang butuh di-test.

## Struktur Folder

```
src/lib/
  utils.ts              # pure functions: cn, formatPrice, formatDate, clamp, slugify
  constants.ts          # konstanta global: APP_NAME, WA_NUMBER, SITE_URL, brand info
  paper-sizes.ts        # ukuran kertas + imposition math
  pricing.ts            # kalkulasi harga produk (bila ada)
  midtrans.ts           # Midtrans client helper
  wa.ts                 # WhatsApp URL builder
  tracking.ts           # Meta Pixel / Google Analytics helpers
  README.md             # petunjuk ringkas
```

## Kategori File

### 1. `utils.ts` — Pure Functions
Hanya boleh berisi pure function, tanpa side effect, tanpa API call, tanpa state.

**Boleh di sini:**
- `formatPrice`, `formatDate`, `slugify`, `cn`, `clamp`
- Parsing string, regex, date, number coercion

**Jangan di sini:**
- Fetch API, database, localStorage
- Business logic kompleks (imposition, pricing)
- Import data/mock

### 2. `constants.ts` — Konfigurasi & Map Static
Tempatkan konstanta yang dipakai banyak tempat.

**Boleh di sini:**
- `APP_NAME`, `SITE_URL`, `WA_NUMBER`, `WA_MESSAGE`
- Brand info, social links
- Error message generic

**Jangan di sini:**
- List produk detail — itu di `src/data/products.ts`
- Config rahasia (API key) — gunakan environment variable

### 3. `paper-sizes.ts` — Domain Logic (Imposition)
Logic khusus kalkulator layout cetak. Boleh berisi tipe dan fungsi imposition karena pure math.

### 4. `pricing.ts` — Domain Logic (Pricing)
Kalkulasi harga produk. Boleh import dari `src/data/products.ts` jika butuh harga dasar.

### 5. `midtrans.ts` — External Client
Helper untuk Midtrans. Boleh membuat Snap token, handle environment, base URL.

### 6. `wa.ts` — WhatsApp URL Builder
Pure function untuk generate `wa.me` URL dengan message pre-filled.

## Aturan Penamaan File

- `camelCase.ts` untuk utilitas, helper, client, constants
- Nama file harus mencerminkan isinya: `paper-sizes.ts`, bukan `helpers.ts`

## Contoh Good vs Bad

**Good:**
```ts
// src/lib/utils.ts
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

// src/lib/wa.ts
export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
```

**Bad:**
```ts
// src/lib/utils.ts (terlalu banyak tanggung jawab)
export function formatPrice(...) { ... }
export function calculateStickerPrice(...) { ... }   // ❌ domain-specific di utils
export function renderProductCard(...) { ... }       // ❌ UI di lib
```

## Checklist Sebelum Menambah File ke src/lib/

- [ ] Apakah ini benar-benar dipakai lebih dari 1 tempat?
- [ ] Apakah ini bukan komponen UI?
- [ ] Apakah nama file sudah mencerminkan isinya?
- [ ] Apakah lebih baik disimpan di `src/data/` karena hanya data?
