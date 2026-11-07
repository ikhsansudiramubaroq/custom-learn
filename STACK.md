# Stack

Satu aplikasi Next.js. Next.js berjalan di atas Node.js dan memakai React, jadi tidak perlu server Express atau backend terpisah.

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Runtime | Node.js 22 | Sudah terpasang (22.18), memenuhi syarat Next.js 16 |
| Framework | Next.js 16 (App Router) | Halaman, backend, dan routing dalam satu project |
| UI | React 19 | Bawaan Next.js |
| Bahasa | JavaScript | Sesuai permintaan, tanpa TypeScript |
| Database | MySQL XAMPP (MariaDB 10.4) | Sudah terpasang, nanti bisa pindah ke MySQL server |
| Driver DB | `mysql2` | Query SQL langsung, tanpa ORM |
| Styling | CSS biasa (`app/globals.css`) | Tampilan dirancang sendiri, tanpa kit bawaan |
| Font | `next/font` | Bawaan Next.js, font tersimpan lokal saat build |
| Login | `node:crypto` | `scrypt` untuk password, HMAC untuk cookie sesi |
| Tes | `node --test` | Bawaan Node.js |

Dependency hanya `next`, `react`, `react-dom`, dan `mysql2`. `sharp` untuk memperkecil foto sudah ikut bersama `next`.

## Struktur file

```text
custom-learn/
├── app/
│   ├── layout.js                  navigasi atas: Portfolio, Tutorial
│   ├── globals.css
│   ├── page.js                    Portfolio
│   ├── not-found.js
│   ├── sitemap.js                 daftar halaman untuk mesin pencari
│   ├── robots.js
│   ├── icon.svg
│   ├── cari/page.js               hasil pencarian
│   ├── tutorial/
│   │   ├── page.js                daftar tutorial
│   │   ├── [slug]/[[...part]]/page.js   satu sub judul per halaman
│   │   └── [slug]/pdf/page.js     semua sub judul, siap dicetak ke PDF
│   ├── uploads/[name]/route.js    menyajikan foto
│   ├── api/upload/route.js        menerima foto dari paste atau pilih file
│   ├── api/autosave/route.js      simpan otomatis isian Studio
│   └── studio/
│       ├── login/page.js
│       ├── layout.js
│       ├── error.js
│       ├── page.js                kelola tutorial
│       ├── [id]/page.js           editor satu tutorial
│       └── actions.js             Server Actions tulis data
├── components/
│   ├── AutoSaveForm.js            client component, form yang tersimpan sendiri
│   ├── SaveStatus.js              client component, bar status simpan
│   ├── TutorialSidebar.js
│   ├── TocScroll.js               client component, gulir daftar isi ke item aktif
│   ├── Block.js                   tampilan lima jenis blok
│   ├── ConfirmButton.js           client component, konfirmasi hapus
│   ├── CopyButton.js              client component
│   ├── JsonLd.js                  data terstruktur untuk mesin pencari
│   ├── Flash.js                   client component, notifikasi singkat Studio
│   ├── MarkEditor.js              client component, seret kotak merah
│   ├── PrintButton.js             client component, buka jendela cetak
│   └── Composer.js                client component, kotak paste
├── lib/
│   ├── db.js                      pool koneksi
│   ├── auth.js                    password, token sesi, batas login
│   ├── session.js                 cookie sesi dan requireAdmin
│   ├── autosave.js                antrean simpan dan status gabungan
│   ├── form.js                    membaca dan memeriksa isian form
│   ├── uploads.js                 folder foto dan hapus file
│   ├── content.js                 query tutorial, pencarian, portfolio
│   ├── memo.js                    isi publik di memori sampai ada perubahan
│   ├── image.js                   salinan foto sesuai lebar layar
│   ├── search.js                  logika hasil pencarian
│   ├── seo.js                     URL, judul, dan deskripsi halaman
│   ├── site.js                    alamat situs
│   ├── validate.js                cek file, URL, slug
│   └── profile.js                 nama, bio, kontak
├── db/schema.sql
├── scripts/setup.mjs              buat tabel dan password admin
├── tests/                         node --test
├── uploads/                       foto, tidak ikut git
├── .env.local                     rahasia, tidak ikut git
├── .gitignore
├── .htaccess                      Require all denied
├── next.config.mjs                ukuran foto dan header keamanan
└── package.json
```

`package.json` ditulis manual, karena `create-next-app` membawa file yang tidak diperlukan dan bisa bentrok dengan file `.md` yang sudah ada di folder ini.

## Skema data

```sql
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE,
  position INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tutorials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(500) NOT NULL DEFAULT '',
  category_id INT UNSIGNED NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  position INT NOT NULL DEFAULT 0,
  in_portfolio TINYINT(1) NOT NULL DEFAULT 0,
  outcome VARCHAR(300) NOT NULL DEFAULT '',  -- hasil akhir
  tools VARCHAR(200) NOT NULL DEFAULT '',    -- contoh: Proxmox, Ubuntu, Apache
  finished_on DATE NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tutorial_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blocks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id INT UNSIGNED NOT NULL,
  type ENUM('text', 'image', 'link', 'command', 'code') NOT NULL,
  content MEDIUMTEXT NOT NULL,               -- teks, kode, URL, atau nama file foto
  label VARCHAR(255) NOT NULL DEFAULT '',    -- caption foto, teks link, atau bahasa kode
  marks VARCHAR(2000) NOT NULL DEFAULT '[]', -- kotak merah pada foto
  position INT NOT NULL DEFAULT 0,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- Satu tabel `tutorials` melayani Tutorial dan Portfolio, jadi tidak ada data ganda.
- Kategori tabel sendiri, bukan teks di tutorial, jadi ganti nama cukup di satu tempat. Foreign key menolak penghapusan kategori yang masih dipakai, walau tombolnya sudah disembunyikan.
- `scripts/setup.mjs` memindahkan database lama yang masih memakai kolom ENUM `category`, jadi cukup dijalankan ulang setelah `git pull`.
- Nomor 1.1, 1.2 dihitung dari urutan saat ditampilkan, jadi tetap benar setelah sub judul dipindah.
- Tidak ada kolom sampul. Portfolio memakai foto pertama di tutorial.
- Kotak merah disimpan sebagai JSON `[[kiri, atas, lebar, tinggi]]` dalam persen, jadi posisinya mengikuti ukuran layar dan file foto tidak berubah. Foto kecil di portfolio tidak menampilkan kotak, karena gambarnya dipotong.
- Akun admin tidak perlu tabel: hanya satu orang, dan hash password ada di `.env.local`.

## Keputusan teknis yang mudah terlewat

- **Foto tidak disimpan di `public/`.** Produksi Next.js hanya menyajikan isi `public/` yang ada saat build, jadi foto baru tidak akan muncul. Foto disimpan di `uploads/` dan disajikan lewat route dengan `Content-Type` yang benar dan `X-Content-Type-Options: nosniff`.
- **Upload lewat Route Handler,** karena Server Action dibatasi 1 MB secara default, sedangkan screenshot bisa lebih besar. Route ini memeriksa sesi dan header `Origin` sendiri.
- **Simpan otomatis lewat Route Handler, bukan Server Action.** Next.js membuang Server Action yang sedang berjalan saat pindah halaman, dan `await`-nya tidak pernah selesai, sehingga status bisa macet di "Menyimpan...". Route ini memeriksa sesi dan `Origin` sendiri, sama seperti upload.
- **Kotak tulis tidak ikut tersimpan otomatis.** Jenis blok dipilih setelah paste dan tidak bisa diubah sesudahnya, jadi membuat blok diam-diam bisa salah jenis. Isinya dititipkan di `localStorage` sampai ditambahkan.
- **Halaman publik memakai `export const dynamic = 'force-dynamic'`.** Tanpa ini, Next.js bisa merender halaman saat build, sehingga butuh database saat build dan tutorial baru tidak muncul.
- **Hash password memakai format `salt:hash` dalam hex,** karena `.env.local` memperlakukan `$` sebagai variabel.
- **Tanda `$` pada blok command dibuat dengan CSS,** jadi tidak ikut tersalin.
- **`<img>` biasa dengan `srcSet` dari `getImageProps`,** bukan komponen `next/image`, karena ukuran asli foto tidak disimpan dan komponen itu memaksa tinggi tertentu. Hasilnya WEBP sesuai lebar layar, tersimpan di `.next/cache/images`.
- **Isi publik disimpan di memori proses,** bukan `unstable_cache` yang sudah digantikan di Next.js 16. `forgetContent()` membersihkannya setiap ada penulisan. `shortcut: perubahan langsung di database butuh restart aplikasi, dan hanya berlaku untuk satu proses`.
- **`compress: false`.** Cloudflare sudah mengompres, jadi CPU server tidak bekerja dua kali. Di localhost file terlihat lebih besar, dan itu wajar.
- **Batas login disimpan di memori proses.** `shortcut: hilang saat restart dan tidak berbagi antar proses, simpan di database jika berjalan lebih dari satu proses`.
- **JavaScript di halaman publik untuk tombol salin, menggulir daftar isi, dan navigasi tanpa reload.** Halamannya Server Component, jadi tetap terbaca tanpa JavaScript. Sidebar di HP dilipat dengan checkbox, supaya isinya tidak ditulis dua kali.

## Menjalankan

Di XAMPP Control Panel, nyalakan **MySQL saja**. Apache tidak dipakai, karena Next.js punya server sendiri.

```powershell
npm install
node scripts/setup.mjs    # sekali saja: buat database dan password admin
npm run dev               # http://localhost:3000
npm test                  # tes
```

Isi `.env.local`:

```text
DATABASE_URL=mysql://root@127.0.0.1:3306/custom_learn
ADMIN_PASSWORD_HASH=<salt:hash dari setup>
SESSION_SECRET=<acak, dibuat setup>
```

Folder ini ada di `htdocs`, jadi jika Apache menyala, isinya bisa diakses lewat `localhost/custom-learn/`, termasuk `.env.local`. `.htaccess` di root menutup akses itu.

## Deploy nanti

- Ubuntu dengan Node.js 22 dan `npm run build`, lalu `npm start`, dijalankan sebagai service dengan systemd.
- Nginx atau Apache sebagai reverse proxy.
- Isi `SITE_URL=https://domain-anda.com` di `.env.local`, supaya canonical dan sitemap memakai domain utama.
- HTTPS wajib: cookie `secure` dan tombol salin (`navigator.clipboard`) hanya jalan di HTTPS.
- Buat user MySQL khusus dengan password. Akun `root` tanpa password hanya untuk lokal.
- Folder `uploads/` harus dibackup bersama database.
