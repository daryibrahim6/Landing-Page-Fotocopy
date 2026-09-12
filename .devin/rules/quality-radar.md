---
name: quality-radar
description: Universal defect detection mindset — 24 categories of inconsistencies across UI, code, architecture, and test. Always-on. Every task, every edit, every review.
trigger: always_on
---

# Quality Radar — Universal Defect Detection

## Inti

Setiap kali coding — bikin baru, edit, review, debug, audit — WAJIB aktifkan **Kepekaan Audit Mindset**. Ini bukan checklist yang dicocokin. Ini cara melihat yang nge-deteksi kejanggalan sebelum user complain, sebelum bug masuk production, sebelum code review reject.

"Kejanggalan" = apapun yang tidak konsisten, tidak sesuai pattern, atau "terlihat sedikit off". Tidak peduli itu UI, code logic, architecture, data, API, atau test. Kalau sesuatu terlihat "sedikit off", itu IS a problem.

### 5 Prinsip Kepekaan

1. **"Sedikit off" = broken.** Tidak ada "cuma estetik", "cuma minor", "cuma style". Sedikit off = broken. Spinner kecil di pojok = broken. Missing error handling di 1 API route = broken. Inconsistent response shape = broken.
2. **Compare dengan tetangga.** Element A di sebelah element B — apakah mereka konsisten? Function A di sebelah function B — apakah pattern-nya sama? Kalau beda, kenapa beda? Kalau tidak ada alasan kuat, itu janggal.
3. **Bayangkan user/maintainer lihat.** User tidak baca code. Maintainer tidak baca seluruh codebase. Kalau mata/otak ngerasa "ini beda" tanpa bisa explain kenapa, itu kejanggalan.
4. **Trace dari root, bukan symptom.** Kalau spinner kecil, jangan ganti size doang. Cek kenapa size-nya kecil. Kalau API error, jangan try-catch di frontend. Cek kenapa API-nya error. Fix root cause-nya.
5. **Audit setiap kali, bukan cuma saat dikasih tau.** Setiap edit = audit element itu + tetangganya. Setiap new file = audit pattern-nya dengan file lain di same folder. Jangan cuma fix yang di-point, scan sekitarnya.

---

## Kejanggalan Categories — 24 Tipe yang WAJIB Dipeka

### UI Layer (K1-K12)

#### K1: Size Mismatch
**Ciri:** Element terlalu kecil atau terlalu besar dibanding konteksnya.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Spinner `size={16}` di page-level | Spinner terlihat seperti titik di layar besar | Ganti ke `size={32}` |
| Spinner `size={32}` di inline button | Spinner nutupin button text | Ganti ke `Loader2 h-4 w-4` |
| Icon `h-8 w-8` di button | Icon lebih besar dari text | Ganti ke `h-4 w-4` atau `h-5 w-5` |
| Empty state icon `h-4 w-4` | Icon terlihat hilang/dominan text | Ganti ke `h-8 w-8` |

**Self-check:** Apakah element ini proporsional dengan konteksnya? Bandingkan dengan element di sebelahnya.

#### K2: Centering & Alignment
**Ciri:** Element tidak presisi di tengah, atau alignment beda dari tetangga.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Spinner di `h-32` container | Container terlalu pendek, spinner muncul di atas | Ganti ke `min-h-[50vh]` |
| Content di `text-center` tapi container `items-start` | Text center tapi card content kiri | Sinkronkan container + text alignment |
| Icon + text tidak sejajar | Icon naik/turun 1-2px dari text | Tambah `flex items-center` di parent |
| Empty state CTA tidak centered | Button muncul di kiri padahal text center | Tambah `inline-block` atau `flex justify-center` |

**Self-check:** Apakah element presisi di tengah (horizontal DAN vertical)? Bandingkan margin/padding kiri-kanan dan atas-bawah.

#### K3: Spacing Inconsistency
**Ciri:** Gap antar element beda-beda di section yang seharusnya sama.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| `mt-6` di section A, `mt-8` di section B (same context) | Visual gap terlihat beda | Standardisasi ke `mt-6` atau `mt-8` |
| First content after H1+subtitle pakai `mt-6` di page A, `mt-8` di page B | Gap header→content beda antar page | Standardisasi ke `mt-8` untuk first content after header |
| `space-y-3` di form A, `space-y-4` di form B (same form type) | Input gap terlihat beda | Standardisasi |
| `p-4` di card A, `p-6` di card B (same card type) | Content padding terlihat beda | Standardisasi ke `p-6` |
| `gap-2` vs `gap-3` di button group (same group) | Button spacing terlihat beda | Standardisasi |

**Self-check:** Apakah spacing antar element konsisten dengan section lain yang punya struktur sama? Apakah first-content-after-header gap konsisten di semua page (`mt-8`)?

#### K4: Color Drift
**Ciri:** Warna yang seharusnya sama, beda shade. Atau warna yang seharusnya beda, sama.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| `text-neutral-400` vs `text-neutral-500` untuk subtitle | Subtitle terlihat beda boldness | Pilih satu: `text-neutral-500` untuk subtitle |
| `border-neutral-200` di card, `border-neutral-300` di card (same type) | Border terlihat beda dark | `border-neutral-200` untuk card, `border-neutral-300` untuk input |
| `bg-red-50` vs `bg-red-100` untuk error (same error type) | Error background beda intensity | Standardisasi ke `bg-red-50` |
| `text-brand` vs `text-red-600` untuk destructive | Destructive pakai brand color | `text-red-600` untuk destructive, `text-brand` untuk primary |

**Self-check:** Apakah warna untuk purpose yang sama konsisten di seluruh page? Cek: subtitle, border, status background, status text.

#### K5: Border & Radius Inconsistency
**Ciri:** Element yang seharusnya sama shape, beda radius.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Card A `rounded-xl`, Card B `rounded-lg` (same card type) | Sudut card terlihat beda | `rounded-xl` untuk cards |
| Button `rounded-xl` (should be `rounded-lg`) | Button terlalu round | `rounded-lg` untuk buttons |
| Input `rounded-xl` (should be `rounded-lg`) | Input terlalu round | `rounded-lg` untuk inputs |
| Badge `rounded-lg` (should be `rounded-full`) | Badge kotak, should be pill | `rounded-full` untuk badges |

**Self-check:** Apakah radius konsisten per component type? Cards=xl, Buttons=lg, Inputs=lg, Badges=full.

#### K6: Typography Scale Drift
**Ciri:** Text size yang seharusnya sama, beda. Atau hierarchy tidak konsisten.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Page A title `text-xl`, Page B title `text-2xl` (same page type) | Title terlihat beda besar | `text-2xl` untuk page title |
| Section A title `text-lg`, Section B title `text-xl` (same section type) | Section header beda | `text-lg` untuk section title |
| Body text `text-sm` vs `text-base` (same context) | Body terlihat beda | `text-sm` untuk body dense, `text-base` untuk section utama |
| `font-bold` vs `font-semibold` (same heading level) | Boldness beda | `font-bold` untuk headings |

**Self-check:** Apakah text size konsisten per hierarchy level? Cek: page title, section title, subtitle, body, label.

#### K7: Loading State Mismatch
**Ciri:** Loading indicator beda type untuk konteks yang sama, atau static element berubah saat loading.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Page A pakai Spinner, Page B pakai "Memuat..." (same page type) | Loading UX beda | Ganti ke Spinner |
| Page A pakai Spinner, Page B pakai wireframe (same dynamic page) | Loading UX beda | Ganti wireframe ke Spinner |
| Spinner `size={32}` di page A, `size={24}` di page B (same page type) | Spinner beda besar | Standardisasi `size={32}` |
| Spinner tanpa `role="status"` | A11y missing | Tambah `role="status" aria-live="polite"` |
| Subtitle/count text berubah saat data load (e.g. "0 item" → "5 item") | Text flash saat loading | Ganti ke static text, pindahkan count ke content area |
| Subtitle conditional: `{isLoading ? 'Memuat...' : 'X entri'}` | Subtitle berubah saat load | Ganti ke static text, hapus conditional |

**Self-check:** Apakah loading indicator untuk page/section yang sama type konsisten? Apakah subtitle/statik text TIDAK berubah saat loading? Cek: variant, size, container, a11y, subtitle stability.

#### K8: Button Hierarchy Inconsistency
**Ciri:** Button yang seharusnya same level, beda size/style.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Primary CTA `px-4 py-2` di page A, `px-6 py-2.5` di page B (same CTA level) | Button beda besar | Standardisasi per CTA level |
| Secondary button `border-neutral-300` vs `border-neutral-200` | Border beda dark | `border-neutral-300` untuk outline button |
| Destructive button pakai `bg-brand` (should be red) | Destructive terlihat seperti primary | `border-red-300 text-red-600` untuk destructive |
| Button text "Simpan" vs "Save" (same action, beda bahasa) | Inconsistent language | Standardisasi bahasa Indonesia |

**Self-check:** Apakah button di same hierarchy level punya same size, color, dan language?

#### K9: Empty State Inconsistency
**Ciri:** Empty state beda layout untuk konteks yang sama.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Empty state A pakai card, B pakai text only (same list type) | Empty state beda struktur | Standardisasi ke card pattern |
| Empty state A ada CTA, B tidak (same context, both bisa ada CTA) | Inconsistent UX | Tambah CTA kalau ada action user bisa lakukan |
| Empty state icon `h-8 w-8` vs `h-12 w-12` | Icon beda besar | Standardisasi `h-8 w-8` |
| Empty state text "Belum ada data" vs "Tidak ada data" (same context) | Inconsistent copy | Standardisasi tone |

**Self-check:** Apakah empty state untuk list/table yang sama punya struktur konsisten?

#### K10: Status Color Mismatch
**Ciri:** Status badge/error/success beda warna untuk status yang sama.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Pending badge `bg-amber-100` di page A, `bg-yellow-100` di page B | Warna beda | Standardisasi ke `bg-amber-100 text-amber-700` |
| Error inline `bg-red-50` vs `bg-red-100` (same error type) | Intensity beda | `bg-red-50` untuk inline error |
| Success toast pakai `toast.success` vs `toast.info` (same success event) | Toast type beda | `toast.success` untuk success |

**Self-check:** Apakah status yang sama pakai warna yang sama di seluruh app?

#### K11: Interaction State Missing
**Ciri:** Element tidak punya hover/focus/disabled state.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Button tanpa `hover:` state | Cursor hover tidak ada feedback | Tambah `hover:bg-brand-dark` atau `hover:bg-neutral-50` |
| Input tanpa `focus:` state | Focus tidak ada ring | Tambah `focus:border-brand focus:ring-2 focus:ring-brand/20` |
| Button tanpa `disabled:opacity-50` | Disabled button terlihat sama dengan active | Tambah `disabled:opacity-50` |
| Link tanpa `hover:underline` | Hover tidak ada feedback | Tambah `hover:underline` |

**Self-check:** Apakah setiap interactive element punya hover, focus, dan disabled state?

#### K12: A11y Silent Missing
**Ciri:** Screen reader tidak dapat info yang user visual dapat.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Loading tanpa `role="status"` | Screen reader tidak announce loading | Tambah `role="status" aria-live="polite"` |
| Error tanpa `role="alert"` | Screen reader tidak announce error | Tambah `role="alert"` |
| Icon-only button tanpa `aria-label` | Screen reader baca "button" tanpa context | Tambah `aria-label="..."` |
| Table header tanpa `scope="col"` | Screen reader tidak associate header dengan column | Tambah `scope="col"` |
| Image tanpa `alt` | Screen reader skip image | Tambah `alt="..."` atau `alt=""` untuk decorative |

**Self-check:** Apakah setiap non-text element punya a11y attribute? Apakah setiap state change di-announce?

---

### Code Logic Layer (K13-K18)

#### K13: Error Handling Inconsistency
**Ciri:** Error handling beda pattern untuk situasi yang sama.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| API route A pakai try-catch + error response, route B pakai throw tanpa catch | Salah satu unhandled error ke user | Standardisasi try-catch + structured error response |
| Mutation A pakai `toast.error(e.message)`, mutation B pakai `toast.error("Gagal")` | Error message beda informativeness | Tampilkan error message dari server, fallback ke generic |
| Function A return `null` on error, function B throw on error, function C return `{error}` | Caller tidak tahu apa yang expect | Standardisasi: throw untuk unexpected, return `{error}` untuk expected |
| API route tanpa auth check | Endpoint bisa diakses anonymous | Tambah auth check + role check |

**Self-check:** Apakah error handling untuk same context (API route, mutation, form submit) konsisten? Apakah semua API route punya auth check?

#### K14: Missing Validation
**Ciri:** Input tidak divalidasi sebelum diproses.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| API route terima body tanpa Zod validate | Invalid data masuk database | Tambah `schema.parse(body)` atau `schema.safeParse(body)` |
| Form submit tanpa client validation | User bisa submit empty/invalid | Tambah Zod validation di form + disable submit |
| Search input tanpa sanitize | SQL injection / XSS risk | Sanitize input, gunakan parameterized query |
| File upload tanpa type/size check | User upload file besar/berbahaya | Validasi MIME type + max size |

**Self-check:** Apakah setiap input dari user (form, API body, query param) divalidasi sebelum diproses?

#### K15: Data Serialization Inconsistency
**Ciri:** Date/number/boolean di-return ke client dengan format beda.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| API route A return `Date` object, route B return ISO string, route C return timestamp | Client tidak tahu cara parse | Standardisasi: ISO string (`date.toISOString()`) |
| Price di-return sebagai number di route A, string di route B | Client parsing beda | Standardisasi: number (cents atau whole number) |
| Boolean di-return sebagai `0/1` di route A, `true/false` di route B | Truthy check beda | Standardisasi: `true/false` |

**Self-check:** Apakah tipe data yang di-return dari API konsisten untuk field yang sama type?

#### K16: Race Condition & Stale Data
**Ciri:** Data tidak fresh setelah mutation, atau race antara 2 request.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| `window.location.reload()` setelah mutation | Full page reload, slow UX | Ganti ke update state lokal / `router.refresh()` |
| Fetch client-side tanpa dedup/abort | Double fetch saat re-render cepat | Pakai `AbortController` atau cleanup di `useEffect` |
| Mutation success tanpa update state | Data stale, user lihat data lama | Update state/`router.refresh()` setelah sukses |
| 2 request paralel, result race | Result kedua muncul sebelum pertama | Gunakan `AbortController` atau abaikan response stale |

**Self-check:** Apakah setiap aksi yang mengubah data me-refresh tampilan yang relevan? Apakah request paralel tidak bisa saling menimpa?

#### K17: Inconsistent Naming
**Ciri:** Variable/function/file naming beda convention untuk same type.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| File `getProducts.ts` vs `fetchProducts.ts` vs `productsApi.ts` (same purpose) | Tidak tahu cari yang mana | Standardisasi: `get<X>.ts`, `create<X>.ts`, `update<X>.ts`, `delete<X>.ts` |
| Hook `useProducts.ts` vs `useProductQuery.ts` (same hook type) | Tidak tahu cari yang mana | Standardisasi: `use<X>.ts` untuk list, `use<X>Detail.ts` untuk single |
| Zod schema `orderSchema` vs `checkoutOrderSchema` (same domain) | Tidak tahu mana untuk create vs update | `<feature><Action>Schema`: `checkoutOrderSchema`, `orderUpdateSchema` |
| Type `Product` vs `ProductType` vs `TProduct` (same type) | Inconsistent type naming | Standardisasi: `<Feature>` tanpa prefix/suffix: `Product`, `Order` |

**Self-check:** Apakah naming convention konsisten untuk same type of thing? Cek: services, hooks, schemas, types, components.

#### K18: Dead Code & Unused Import
**Ciri:** Code/import yang tidak dipakai, tapi masih ada.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Import yang tidak dipakai | `tsc --noEmit` warning, atau visual scan | Hapus import |
| Function/variable yang tidak dipakai | IDE grayed out, atau grep tidak nemu usage | Hapus, atau kalau planned, tambah `// TODO:` dengan alasan |
| Commented-out code block | Code comment yang bukan dokumentasi | Hapus. Git history = backup. |
| `console.log` di production code | Debug log tertinggal | Hapus, atau ganti ke proper logger |

**Self-check:** Apakah semua import dipakai? Apakah ada dead code? `tsc --noEmit` + visual scan.

---

### Architecture Layer (K19-K21)

#### K19: Folder Placement Violation
**Ciri:** File di tempat yang salah, melanggar struktur `src/` monolithic BisaPrint.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| UI component di `src/lib/` | `lib/` = logic only, bukan UI | Pindahkan ke `src/components/<domain>/` |
| Data statis produk/FAQ di `src/lib/` | Data domain → `src/data/` | Pindahkan ke `src/data/<domain>.ts` |
| Component di `components/shared/` yang hanya dipakai 1 tempat | Shared = cross-cutting only | Pindahkan ke folder domain-nya (`sections/`, `checkout/`, `design-simulator/`) |
| Business logic di `app/` page/route | Route = routing + composition | Pindahkan ke `src/lib/` atau komponen domain |

**Self-check:** Apakah file ini di tempat yang benar? Cek `feature-architecture.md` dan `lib-architecture.md`.

#### K20: Data Fetching Pattern Violation
**Ciri:** Data fetching pattern tidak sesuai dengan type page.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Public page fetch API route untuk data statis (produk, FAQ) | Overkill — data sudah ada di `src/data/` | Import langsung di Server Component |
| Halaman statis memanggil Upstash/Midtrans saat render/build | Build/runtime bergantung ke service eksternal | Pindahkan ke API route / client fetch |
| API route terima body tanpa validasi | Data jahat masuk handler | Tambah validasi input (Zod/manual guard) |
| Secret dibaca via `NEXT_PUBLIC_*` | Secret bocor ke bundle client | Pakai env non-public di route handler |

**Self-check:** Apakah data fetching pattern sesuai dengan type page? Cek `feature-architecture.md` Data Fetching Pattern table.

#### K21: Import Direction Violation
**Ciri:** Import dari layer yang seharusnya tidak di-import.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| `src/lib/` import komponen UI | lib = logic only | Pindahkan ke `src/components/` |
| `src/data/` import client server-only (Redis/Blob) dari `src/lib/` | Data file harus pure static | Jangan import; pisahkan konstanta |
| `components/ui/` import business domain | Base UI tidak boleh tahu domain | Pindahkan logic ke komponen domain |
| Server Component import Client Component hook | Hook = client only, akan error | Pindahkan ke Client Component atau API route |
| `app/` route punya business logic (bukan composition) | Route = routing + metadata + composition | Pindahkan logic ke `src/lib/` |

**Self-check:** Apakah import direction benar? `lib` → `data` (OK), `data` → `lib` server-only (BAD), `components` → `lib`/`data` (OK), `app` → `components`/`lib`/`data` (OK untuk composition only).

---

### Test Layer (K22-K24)

#### K22: Test Behavior vs Implementation
**Ciri:** Test ngecek implementation detail, bukan behavior.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Test assert `toHaveBeenCalledTimes(1)` untuk internal function | Test terlalu coupled ke implementation | Test behavior: assert result/output, bukan internal call |
| Test assert state internal component | Test terlalu coupled | Test via user interaction (Testing Library) |
| Test mock semua sampai test hanya ngetest mock | Test tidak ada value | Reduce mock, test real integration |
| Test tidak cover error path | Happy path only | Tambah test untuk error/empty/edge case |

**Self-check:** Apakah test ngetest behavior yang user rasakan, atau implementation detail yang maintainer peduli?

#### K23: Missing Edge Case
**Ciri:** Test tidak cover scenario yang bisa terjadi di production.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Test tidak cover empty input | User bisa submit empty form | Tambah test: empty string, null, undefined |
| Test tidak cover unauthorized access | User bisa akses tanpa login | Tambah test: anonymous, wrong role, wrong owner (IDOR) |
| Test tidak cover concurrent mutation | 2 user edit same data | Tambah test: race condition, optimistic update conflict |
| Test tidak cover large dataset | Performance issue tidak terdeteksi | Tambah test dengan realistic data size |

**Self-check:** Apakah test cover happy path, error path, edge case, dan unauthorized access?

#### K24: Test That Hides Bugs
**Ciri:** Test dipaksa pass tanpa fix root cause.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Test di-skip tanpa alasan (`it.skip` tanpa comment) | Bug disembunyi | Fix bug, atau document kenapa skip dengan TODO |
| Assertion diubah supaya pass | Test tidak ada value | Assertion harus reflect correct behavior, bukan current behavior |
| Mock diubah supaya pass | Mock tidak match real API | Mock harus match real API contract |
| `expect.any()` terlalu loose | Test tidak validate shape | Gunakan specific assertion atau Zod schema validation |

**Self-check:** Apakah test ini ngetest correct behavior, atau dipaksa match current (mungkin broken) behavior?

---

### Layout Structure Layer (K25-K26)

#### K25: Header-Subtitle Pair Missing
**Ciri:** Page/section punya heading tapi TIDAK punya subheading pendukung, atau pola heading+subheading tidak konsisten antar section/page yang sejenis.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Section A punya heading + subheading, Section B heading only (same section type) | Heading terlihat "telanjang" dibanding tetangga | Tambah subheading: `mt-4 text-base text-[var(--color-text-secondary)]` (pola section BisaPrint) |
| Subtitle pakai dynamic data (`{count} entri`) bukan static text | Subtitle berubah saat data load = flash | Ganti ke static deskripsi page, pindahkan count ke content |
| Page dengan flex header (H1 + button) tidak punya subtitle | H1 + button terlihat seperti sub header yang terpisah | Tambah subtitle di bawah flex row, BUKAN di dalam flex row |
| Subtitle pakai conditional loading text (`{isLoading ? 'Memuat...' : 'X'}`) | Text berubah saat load = flash | Ganti ke static text, hapus conditional |

**Self-check:** Apakah section/page yang sejenis punya pola heading + subheading yang konsisten? Apakah subheading static (tidak berubah saat loading)? Bandingkan dengan tetangganya.

#### K26: Static Element Flash
**Ciri:** Element yang seharusnya statis (header, subtitle, page title) berubah/flash saat data loading.

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Subtitle text berubah dari "0 X" → "5 X" saat data load | Text flash/berubah saat loading | Ganti ke static deskripsi, pindahkan count ke content area |
| Subtitle pakai `{isLoading ? 'Memuat...' : 'X entri'}` | Subtitle berubah saat load | Ganti ke static text |
| H1 dipindahkan dari page wrapper ke conditional component | H1 muncul/hilang saat loading | Pindahkan H1 ke page wrapper, always rendered |
| Page title berubah berdasarkan data (e.g. "Edit" vs "Tambah") | Title flash saat data load | Gunakan static title di page wrapper, dynamic text di content |

**Self-check:** Refresh page dengan F5. Apakah H1 dan subtitle TIDAK berubah sama sekali dari initial render sampai data selesai load? Kalau berubah, itu flash.

**Root cause pattern:** Subtitle/count yang pakai `meta?.totalItems ?? 0` atau `{isLoading ? '...' : '...'}` akan render nilai default (0/loading text) saat data belum ada, lalu berubah saat data arrive. Ini menyebabkan text flash. Fix: subtitle HARUS static text yang tidak bergantung pada data loading state. Count/dynamic info dipindahkan ke content area (table header, card, dll).

#### K27: Branding Consistency Missing
**Ciri:** Logo/brand mark tidak konsisten antar surface (header, footer, mobile menu, checkout, simulator).

| Kejanggalan | Cara deteksi | Fix |
|-------------|--------------|-----|
| Header pakai logo image, footer cuma text | Bandingkan semua surface | Tambah logo image yang sama di semua surface |
| Logo image di desktop tapi tidak di mobile menu | Resize ke 375px, buka mobile menu | Tambah logo image di mobile nav header |
| Logo size beda antar surface tanpa alasan | Visual comparison | Standardisasi size per konteks (header vs footer) |
| Brand name "BisaPrint"/"Bisa Print" text tanpa logo image | Cek setiap brand text — apakah ada Image sebelumnya? | Tambah `<Image src="/assets/brand/logo-bisaprint.webp" />` sebelum text |

**Self-check:** Buka landing page, checkout, simulator (desktop + mobile). Apakah logo image muncul konsisten di semua surface? Bandingkan src, size, dan alt text.

---

## Pre-Ship Audit — WAJIB sebelum declare task selesai

### Quick Scan (30 detik)
Sebelum bilang "selesai", jawab pertanyaan ini:

**UI:**
1. Size: Apakah semua element proporsional dengan konteksnya?
2. Centering: Apakah semua centered element presisi di tengah?
3. Spacing: Apakah gap antar element konsisten?
4. Color: Apakah warna untuk purpose yang sama konsisten?
5. Radius: Apakah radius konsisten per component type?
6. Typography: Apakah text size konsisten per hierarchy level?
7. Loading: Apakah loading indicator untuk same context type konsisten?
8. Buttons: Apakah button di same hierarchy punya same size/color/language?
9. Empty states: Apakah empty state untuk same list type punya same structure?
10. Status colors: Apakah status yang sama pakai warna yang sama?
11. Interaction states: Apakah setiap interactive element punya hover/focus/disabled?
12. A11y: Apakah loading punya `role="status"`, error punya `role="alert"`, icon-only button punya `aria-label`?

**Code:**
13. Error handling: Apakah error handling untuk same context konsisten?
14. Validation: Apakah setiap input dari user divalidasi?
15. Serialization: Apakah tipe data di-return dari API konsisten?
16. Stale data: Apakah setiap mutation meng-invalidate query yang relevan?
17. Naming: Apakah naming convention konsisten?
18. Dead code: Apakah tidak ada unused import/dead code? (`tsc --noEmit`)

**Architecture:**
19. Folder placement: Apakah file di tempat yang benar (`components`/`data`/`lib`)?
20. Data fetching: Apakah pattern sesuai dengan type page?
21. Import direction: Apakah import direction benar?

**Test:**
22. Test behavior: Apakah test ngetest behavior, bukan implementation?
23. Edge case: Apakah test cover error path dan edge case?
24. Test honesty: Apakah test ngetest correct behavior, bukan dipaksa pass?

**Layout Structure:**
25. Header-Subtitle pair: Apakah section/page sejenis punya pola heading + subheading yang konsisten? Bandingkan dengan tetangganya.
26. Static element flash: Refresh F5 — apakah heading dan subheading TIDAK berubah dari initial render sampai data load selesai?
27. Branding consistency: Apakah logo image muncul konsisten di semua surface (header, footer, mobile menu, checkout, simulator)?

### Deep Scan (2 menit)
Kalau quick scan pass, lanjut deep scan:

28. **Compare dengan page/file tetangga:** Buka file lain yang sama type-nya. Apakah struktur konsisten?
29. **Mobile check:** Resize ke 375px. Apakah layout masih OK? Tidak ada overflow?
30. **Copy audit:** Baca semua visible text. Ada yang janggal/tidak jelas/bahasa campur?
31. **Empty/loading/error trio:** Apakah ketiga state untuk section ini sudah ada dan konsisten?
32. **API contract check:** Apakah response shape API route konsisten dengan yang client expect?
33. **Security spot-check:** Apakah API route memvalidasi input? Webhook memverifikasi signature? Secret tidak lewat `NEXT_PUBLIC_*`?
34. **Conversion path check:** Apakah setiap surface produk punya CTA yang jelas (checkout atau WhatsApp)? Tidak ada dead-end di flow konversi?
35. **Empty state completeness:** Apakah setiap empty state pakai card pattern + icon? Tidak ada plain text empty state?

---

## Standard Pattern Reference

> Pattern di bawah digroundkan ke kode BisaPrint yang ada (`src/app/loading.tsx`, `CheckoutForm.tsx`, `ProductCard.tsx`, `SectionWrapper.tsx`, `globals.css`). Kalau codebase berubah, update section ini.

### Loading
- **Page-level:** `src/app/loading.tsx` — CSS spinner `size-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent` + text `Memuat...` `text-sm font-medium text-[var(--color-text-muted)]` di `min-h-[70vh]` flex container
- **Section-level:** Same spinner pattern, container lebih kecil
- **Inline/button:** `h-4 w-4 animate-spin` (lucide `Loader2` atau CSS spinner) + text status, button `disabled`
- **Upload/async inline:** text status kecil `text-xs text-[var(--color-text-muted)]` (contoh: `Mengupload...` di CheckoutForm)
- Feedback dinamis WAJIB `role="status"` atau `aria-live="polite"` kalau berubah tanpa reload

### Page Structure
- **Section container:** `SectionWrapper` = `mx-auto max-w-[1440px] px-4 py-16 sm:px-6 md:py-24 lg:px-10 xl:px-14`
- **Checkout container:** `mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8`
- **Status page (success/error):** `mx-auto max-w-lg px-4 py-20 text-center`
- **Section heading (H2):** `font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl`
- **Subheading:** `mx-auto mt-4 max-w-xl text-base text-[var(--color-text-secondary)] md:text-lg` — HARUS static text
- **Card/section title (H3):** `font-display text-sm md:text-xl font-bold text-[var(--color-text-primary)]`
- Body font: Poppins (default), display font: `font-display` (Fredoka) untuk heading/CTA besar

### Cards (sticker style)
- **Standard product card:** `rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-bg-card)]` + `transition hover:-translate-y-1`
- **Form card:** `rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-6 sm:p-8 md:p-10`
- **Status error:** `border-red-200 bg-red-50` + text `text-red-600`
- **Status success:** `border-green-200 bg-green-50` + text `text-green-700`

### Buttons (pill shape)
- **Primary:** `rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[var(--color-primary-muted)] focus-visible:ring-2 focus-visible:ring-primary/50`
- **Primary large (hero CTA):** `rounded-full px-7 py-4 font-display text-base font-bold`
- **Outline:** `rounded-full border-2 border-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white`
- **Secondary/neutral:** `rounded-full bg-[var(--color-bg-soft-2)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)]`
- Toggle pilihan (pickup dsb): `aria-pressed` + style aktif/nonaktif yang jelas

### Inputs
- **Standard:** `w-full rounded-lg border border-[var(--color-border)] px-3 py-2` + focus ring primary
- **Error state:** `border-red-400` + pesan `mt-1 text-xs text-red-500` (pola CheckoutForm)
- **Helper:** `text-xs text-[var(--color-text-muted)]`
- **Form layout:** Label above, input, helper/error below

### Badges / Pills
- **Shape:** `rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide`
- **Featured:** `bg-[var(--color-primary)] text-white`
- **Category:** `bg-[var(--color-bg-soft-2)] text-[var(--color-text-secondary)]`
- **Neutral info:** `border border-[var(--color-border)] text-[var(--color-text-muted)]`

### Empty & Error States
- **Standard:** `mx-auto max-w-lg px-4 py-20 text-center` + circle icon `size-16 rounded-full bg-green-100` (atau warna status) + title + `text-[var(--color-text-secondary)]` message + CTA `rounded-full bg-primary`
- **Icon WAJIB** — empty/error state tanpa icon terlihat incomplete
- **Tidak boleh** plain text saja — selalu pakai centered pattern + CTA
- Error dinamis WAJIB `role="alert"` atau `aria-live`

### Feedback / Status (bukan toast)
- BisaPrint TIDAK pakai toast library — feedback = inline state (error text, `Mengupload...`, redirect ke success page)
- Setiap aksi async WAJIB punya: state loading + state error + state success yang visible
- JANGAN `window.location.reload()` untuk post-mutation — update state / redirect

### Colors (tokens di `globals.css`, pakai `var(--color-*)` atau utility `*-primary` dsb)
- **Primary:** `--color-primary` `#DE127A` | `--color-primary-light` `#EC91B4` | `--color-primary-muted` `#D66E9E` (hover)
- **Accent:** `--color-accent` `#E87817` | `--color-accent-light` `#F4A261` | `--color-accent-yellow` `#FFD700`
- **Text:** `--color-text-primary` `#0F172A` | `--color-text-secondary` `#475569` | `--color-text-muted` `#64748B`
- **Border:** `--color-border` `#E2E8F0` | strong = primary
- **Background:** `--color-bg-base` `#FFF` | `--color-bg-soft` `#F8FAFC` | `--color-bg-soft-2` `#F1F5F9` | `--color-bg-card` `#FFF`
- **Status:** red-* (error), green-* (success), amber-* (warning) — pakai scale Tailwind standar
- **DILARANG** hardcode hex di component — selalu via token

### Icons
- **Library:** `lucide-react`
- **Inline button:** `h-4 w-4` | **Standalone:** `h-5 w-5` | **Status circle:** `size-16` container, icon ~`h-8 w-8`
- **Icon + text:** `gap-1.5`/`gap-2` di flex, icon SELALU sebelum text

### Naming Convention
- **Lib/services:** `get<X>.ts`, domain logic `paper-sizes.ts`, `pricing.ts`, `midtrans.ts`, `wa.ts`
- **Data:** `products.ts`, `faq.ts` (plural domain di `src/data/`)
- **Schema:** `<domain><Action>Schema` — `checkoutOrderSchema`
- **Type:** `<Domain>` tanpa prefix — `Product`, `Order`, `ImpositionResult`
- **Components:** PascalCase — `ProductCard.tsx`, `CheckoutForm.tsx`
- **Files:** camelCase untuk lib/data/types, PascalCase untuk components, kebab-case untuk folder

### Branding
- **Logo image:** `<Image src="/assets/brand/logo-bisaprint.webp" alt="BisaPrint" />` — WAJIB di surface yang menampilkan brand
- **Surface yang WAJIB punya logo:** Header (desktop + mobile menu), Footer
- **Brand text:** "BisaPrint" (satu kata, P besar) — jangan "Bisa Print" di UI copy kecuali di konten yang memang begitu (cek `constants.ts` untuk canonical)
- **DILARANG:** Menampilkan brand text tanpa logo image di surface yang visible ke user

### Data Fetching
- **Public read-only:** Server Component + import langsung dari `src/data/` (products, faq, portfolio, testimonials)
- **Mutations/checkout:** API Route + client fetch — `/api/midtrans/create-token`, `/api/upload`, `/api/orders/[id]`
- **Webhooks:** Route Handler + WAJIB signature verification — `/api/midtrans/webhook`
- **Storage:** `src/lib/order-storage.ts` — Upstash Redis kalau env ada, fallback in-memory (dev only)
- **Post-mutation:** update state / `router.refresh()` / redirect (bukan `window.location.reload()`)
- **Secrets:** `MIDTRANS_SERVER_KEY`, `BLOB_READ_WRITE_TOKEN` server-only — JANGAN pakai `NEXT_PUBLIC_` untuk secret
