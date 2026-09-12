---
name: git-auto-commit-strategy
description: When and how Devin should auto-commit changes during a session, and when to push.
trigger: always_on
---

# Git Auto-Commit Strategy

> Prinsip: commit terjadi **diam-diam di checkpoint logis**, bukan per chat prompt. User tidak perlu bilang "commit". Push tidak pernah terjadi kecuali user minta eksplisit.

---

## 1. Kapan Devin harus auto-commit

Devin **WAJIB** commit setelah salah satu kondisi ini terpenuhi:

1. **Satuan kerja logis selesai** — satu fitur, satu fix, satu report update, satu scope freeze, satu test batch pass, atau satu refactor tersendiri.
2. **Verifikasi sudah lewat** — `npx tsc --noEmit`, unit test terkait, atau E2E targeted verify hijau (kalau perubahan butuh verifikasi).
3. **User memberi go-signal** — kata kunci seperti "gas", "eksekusi", "simpan", "commit aja", "sip" ketika ada uncommitted changes yang sudah masuk akal.

Devin **TIDAK BOLEH** commit di kondisi ini:

1. Turn hanya berisi tanya-jawab, advice, atau reading — tidak ada file berubah.
2. Test masih fail atau `tsc` belum bersih.
3. Perubahan masih WIP, eksplorasi, atau campuran hal tidak terkait.
4. Yang berubah hanya file sementara/debug: `tmp-*.ts`, `.commit-msg.tmp`, `.git/COMMIT_EDITMSG`, `.env`, log, screenshot.
5. User bilang "jangan commit dulu", "draft", "nanti aja", atau "belum".

---

## 2. Push policy

- **JANGAN PERNAH** push ke `main`, `dev`, `master`, atau branch yang dilindungi.
- **JANGAN PERNAH** push kecuali user eksplisit bilang "push" atau "push ke [branch]".
- Push hanya boleh ke branch feature yang sedang aktif, dan hanya jika diminta.

---

## 3. Bentuk commit yang diharapkan

- **Atomic** — satu commit = satu alasan. Kalau 3 hal berbeda berubah, split 3 commit.
- **Verified** — setiap commit harus bisa `tsc --noEmit` bersih. Lebih baik lagi kalau unit test terkait pass.
- **Message format:** `type(scope): why this change exists`
  - `type`: `fix`, `feat`, `docs`, `chore`, `refactor`, `test`
  - `scope`: fitur/area yang terkena
  - `why`: alasan perubahan, bukan daftar file
- **Body opsional** dengan bullet "What changed & why" plus bukti perintah/test.
- Hindari message seperti `gas`, `fix`, `update`, `lagi` — explain the reason.

---

## 4. File commit message temporary

- **JANGAN** tulis ke `.git/COMMIT_EDITMSG` sebagai workaround.
- Untuk multi-line message di PowerShell:
  1. Tulis ke file sementara di project root: `.commit-msg.tmp`.
  2. Jalankan `git commit -F .commit-msg.tmp`.
  3. Hapus segera: `Remove-Item .commit-msg.tmp`.
- Untuk message pendek, pakai `git commit -m "title" -m "body"` tanpa file temp.

---

## 5. Pre-commit cleanup (WAJIB)

Sebelum `git commit`, jalankan:

1. `git status --short` — inspect apa yang akan masuk commit.
2. Hapus file temp: `tmp-*.ts`, `.commit-msg.tmp`, `.git/COMMIT_EDITMSG`.
3. Unstage file yang tidak relevan: PDF, gambar, log, `.env`, screenshot.
4. Kalau banyak perubahan tidak terkait, split per scope.

---

## 6. Commit message template untuk AI

```bash
git commit -m "type(scope): why this change exists" -m "- What changed" -m "- Why" -m "- Evidence (test/tsc/output)"
```

Atau via temp file:

```bash
git commit -F .commit-msg.tmp && Remove-Item .commit-msg.tmp
```

---

## 7. Catatan khusus untuk user ini

- User prefer **auto-commit tanpa trigger eksplisit** per turn, tapi **tidak mau push otomatis**.
- User tidak ingin file `.git/COMMIT_EDITMSG` tiba-tiba muncul di IDE.
- Sebagai kompromi: Devin commit setelah checkpoint logis, nggak perlu user bilang "commit", tapi selalu lapor file yang di-commit dan hash-nya.
