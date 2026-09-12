# Audit — design-simulator-flow

**Tier:** Core | **Prefix ID:** `DS`
**Scope IN:** `/simulator`, `src/components/design-simulator/` (DesignSimulator, DesignCanvas, FloatingSimulator, UploadZone), `src/lib/paper-sizes.ts`, export PNG/PDF (jsPDF)
**Scope OUT:** checkout, produk non-simulator
**Last audit:** 2026-09-08 (gabungan) → di-split ke file ini 2026-09-12. Re-audit v2 belum dijalankan.

## Temuan

| ID | Sev | Temuan | Status | Bukti |
|---|---|---|---|---|
| DS-A-01 (ex BLU-A-003) | P1 | Preflight/print layout otomatis hanya untuk stiker A3 — produk lain belum tercover | 🟡 RESOLVED-BY-DESIGN (MVP) | `paper-sizes.ts` imposition math stiker A3 tercover `paper-sizes.test.ts` (7 tests). Ekspansi ke produk lain = backlog, bukan bug |
| DS-A-02 | P2 | jsPDF `setGState` TypeScript error | ✅ FIXED | commit `ea7ea97` |

## Catatan

- Track C walkthrough simulator (canvas interaction, touch di mobile) belum dijalankan.
- E2E: spec belum ada.
