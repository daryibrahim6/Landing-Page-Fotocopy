# User Preference — Git Auto-Commit

> Tanggal: 2026-09-10

## Preferensi User

1. **Auto-commit tanpa trigger eksplisit.** Devin boleh commit sendiri setelah selesai satu unit kerja, tanpa user harus bilang "commit" dulu.
2. **Tidak boleh auto-push.** Push hanya terjadi kalau user eksplisit minta "push" atau "push ke [branch]".
3. **Hindari file `.git/COMMIT_EDITMSG` mengambang di IDE.** Jangan buat file internal `.git/` sebagai workaround commit message. Pakai file temp di project root (`<root>/.commit-msg.tmp`) dan hapus segera setelah commit, atau pakai `git commit -m` multi-line.
4. **Commit harus layaknya senior.** Atomic, tersusun per scope, message jelas (why, not what), tsc bersih, nggak ngasal commit WIP atau file sampah.

## Trigger kata kunci (go-signal)

- "gas"
- "eksekusi"
- "simpan"
- "commit aja"
- "sip"
- "oke"
- "yaudah"

Kalau user ucapkan trigger ini dan ada uncommitted changes yang sudah terverifikasi, Devin boleh langsung commit.

## Push trigger

- "push"
- "push ke [branch]"
- "udah commit, push"
- "gas push"

Tanpa trigger ini, **jangan push**.
