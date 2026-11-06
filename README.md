# Custom Learn

Web catatan belajar Linux dan programming yang sekaligus menjadi portfolio. Setiap tutorial ditulis langkah demi langkah, bisa dibaca siapa saja, dan yang terbaik bisa ditampilkan sebagai bukti kerja tanpa menulis ulang isinya.

## Fitur

- **Portfolio (`/`):** profil singkat dan tutorial pilihan.
- **Tutorial (`/tutorial`):** sidebar kiri berisi daftar tutorial dan sub judul 1.1, 1.2, dan seterusnya.
- **Studio (`/studio`):** halaman admin satu akun untuk menulis tutorial.
- **Paste langsung:** screenshot, command, code, dan link cukup di-paste.
- **Pengunjung hanya baca:** bisa melihat, membaca, dan menyalin. Command dan code punya tombol salin.

## Teknologi

Next.js 16, React 19, Node.js 22, MySQL/MariaDB, dan CSS biasa tanpa framework UI.

## Menjalankan di lokal

Butuh Node.js 22 dan MySQL. Dengan XAMPP, nyalakan MySQL saja.

```bash
npm install
node scripts/setup.mjs
npm run dev
```

Lalu buka <http://localhost:3000>.

Detail teknis ada di [STACK.md](STACK.md).
