# Custom Learn

Satu web milik Ikhsan untuk dua kebutuhan: tempat menyimpan tutorial belajar Linux dan programming, dan portfolio dari tutorial yang sudah diunggah. Keduanya memakai isi yang sama, jadi tidak ada konten yang ditulis dua kali.

Sebelum mengerjakan apa pun, baca:

- [SKILL.md](SKILL.md): aturan kerja Ponytail, level full
- [EXAMPLES.MD](EXAMPLES.MD): contoh penerapan: pikir dulu, sederhana, perubahan seperlunya, ada cara verifikasi
- [PERSONA.md](PERSONA.md): peran, gaya kerja, dan arah desain
- [STACK.md](STACK.md): teknologi, struktur file, skema data

Jawab dalam Bahasa Indonesia.

## Status

Tahap perencanaan. Belum ada kode. Jangan generate kode sebelum Ikhsan menyetujui dokumen ini.

## Tiga bagian web

| Bagian | URL | Siapa | Isi |
|---|---|---|---|
| Portfolio | `/` | Semua orang | Profil singkat dan tutorial pilihan sebagai bukti kerja |
| Tutorial | `/tutorial` | Semua orang | Semua tutorial yang sudah `published`, dengan sidebar kiri |
| Studio | `/studio` | Hanya Ikhsan, wajib login | Menulis, paste, mengatur tutorial, memilih isi portfolio |

Portfolio dan Tutorial ada di web yang sama dan saling tertaut lewat navigasi atas.

## Tutorial

- Sidebar kiri berisi daftar tutorial per kategori.
- Tutorial yang dibuka menampilkan sub judulnya (1.1, 1.2, ...) di sidebar.
- Isi sub judul adalah urutan blok: teks, foto, link, command, code.
- Setiap tutorial punya URL sendiri yang bisa dibagikan.

Contoh alur satu tutorial: instalasi Proxmox, membuat VM Ubuntu Server, sampai web server sederhana berjalan.

## Portfolio

Isinya tidak diketik ulang. Portfolio mengambil tutorial yang sudah ada.

- Di Studio, tutorial ditandai "Tampilkan di portfolio", lalu diisi hasil akhir, tools, dan tanggal selesai.
- Hanya tutorial yang `published` dan ditandai yang tampil.
- Gambar yang mewakili adalah foto pertama di tutorial itu.
- Klik item portfolio membuka halaman tutorialnya, jadi bukti kerjanya adalah langkah yang sebenarnya.
- Profil (nama, bio, kontak) disimpan di `lib/profile.js`.

## Pengunjung hanya baca

Pengunjung bisa melihat, membaca, dan menyalin. Tidak ada akun, form, komentar, atau tombol ubah di halaman publik, dan tidak ada link ke Studio. Teks tidak boleh dikunci dari seleksi. Blok command dan code punya tombol salin.

## Menulis di Studio

Setiap sub judul punya satu kotak tulis di bagian bawah:

- Paste screenshot dengan Ctrl+V: foto langsung terunggah dan menjadi blok.
- Paste teks: masuk ke kotak, lalu pilih jenisnya: Teks, Command, atau Code. Spasi dan baris baru tetap utuh.
- Paste URL saja: otomatis menjadi jenis Link.
- Jenis terakhir diingat, jadi paste banyak command berturut-turut tetap cepat.
- Ctrl+Enter menyimpan.
- Tombol pilih file tetap ada untuk foto yang bukan dari clipboard.
- Tutorial, sub judul, dan blok bisa diubah, dihapus, dan diurutkan.
- Status tutorial: `draft` atau `published`. Draft tidak tampil di publik.

## Aturan yang tidak boleh dilanggar

- Setiap Server Action dan Route Handler di Studio memeriksa sesi sendiri. Menyembunyikan halaman saja tidak cukup, karena keduanya bisa dipanggil langsung.
- Semua query memakai parameter (`?`), tidak pernah menyambung string.
- Jangan pernah memakai `dangerouslySetInnerHTML`.
- Password di-hash dengan `scrypt`. Login dibatasi percobaannya.
- Cookie sesi: `httpOnly`, `sameSite=lax`, `secure` di produksi.
- Upload diperiksa dari byte awal file, bukan dari nama atau tipe kiriman browser. Hanya JPG, PNG, WEBP, GIF, maksimal 10 MB, nama file diacak. SVG ditolak.
- Route file foto hanya menerima nama sesuai format acak, supaya tidak bisa keluar dari folder `uploads/`.
- Link hanya menerima `http` dan `https`.
- Draft tidak boleh bisa diakses publik, termasuk lewat URL langsung. Semua query publik wajib memfilter `published`.
- Rahasia hanya di `.env.local`, tidak pernah memakai awalan `NEXT_PUBLIC_`.
- Saat data dihapus, file foto terkait ikut dihapus setelah database berhasil.

## Urutan kerja

Setiap tahap selesai hanya jika verifikasinya lolos.

1. **Fondasi:** Next.js, skema, koneksi MySQL. Verifikasi: script setup membuat tabel, halaman `/` tampil dengan data dari database.
2. **Baca publik:** halaman Tutorial dan blok. Verifikasi: nomor 1.1 benar, draft membalas 404, tombol salin menghasilkan teks yang persis.
3. **Login dan Studio:** kelola isi. Verifikasi: Server Action tanpa sesi ditolak, login salah berulang diblokir.
4. **Paste:** kotak tulis dan upload. Verifikasi: screenshot dari clipboard menjadi blok, file berisi HTML berekstensi `.png` ditolak.
5. **Portfolio:** halaman `/` dan isian Studio. Verifikasi: hanya tutorial published dan ditandai yang tampil.
6. **Desain:** poles visual. Verifikasi: screenshot asli di lebar 1440 px dan 390 px lolos cek di [PERSONA.md](PERSONA.md).

Logika penting dites dengan `node --test`.

## Di luar lingkup

Jangan dibuat kecuali diminta: multi user, akun pengunjung, komentar, like, editor WYSIWYG, Markdown, tag, pencarian, dark mode, API publik, syntax highlighting, drag and drop, TypeScript, Tailwind, library UI, ORM.
