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

Dependency hanya `next`, `react`, `react-dom`, dan `mysql2`.

## Struktur file

```text
custom-learn/
├── app/
│   ├── layout.js                  navigasi atas: Portfolio, Tutorial
│   ├── globals.css
│   ├── page.js                    Portfolio
│   ├── not-found.js
│   ├── tutorial/
│   │   ├── page.js                daftar tutorial
│   │   └── [slug]/page.js         isi tutorial
│   ├── uploads/[name]/route.js    menyajikan foto
│   ├── api/upload/route.js        menerima foto dari paste atau pilih file
│   └── studio/
│       ├── login/page.js
│       ├── layout.js
│       ├── error.js
│       ├── page.js                kelola tutorial
│       ├── [id]/page.js           editor satu tutorial
│       └── actions.js             Server Actions tulis data
├── components/
│   ├── Sidebar.js
│   ├── Block.js                   tampilan lima jenis blok
│   ├── ConfirmButton.js           client component, konfirmasi hapus
│   ├── CopyButton.js              client component
│   └── Composer.js                client component, kotak paste
├── lib/
│   ├── db.js                      pool koneksi
│   ├── auth.js                    password, token sesi, batas login
│   ├── session.js                 cookie sesi dan requireAdmin
│   ├── uploads.js                 folder foto dan hapus file
│   ├── content.js                 query tutorial dan portfolio
│   ├── validate.js                cek file, URL, slug
│   └── profile.js                 nama, bio, kontak
├── db/schema.sql
├── scripts/setup.mjs              buat tabel dan password admin
├── tests/                         node --test
├── uploads/                       foto, tidak ikut git
├── .env.local                     rahasia, tidak ikut git
├── .gitignore
├── .htaccess                      Require all denied
└── package.json
```

`package.json` ditulis manual, karena `create-next-app` membawa file yang tidak diperlukan dan bisa bentrok dengan file `.md` yang sudah ada di folder ini.

## Skema data

```sql
CREATE TABLE tutorials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(500) NOT NULL DEFAULT '',
  category ENUM('linux', 'programming') NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  position INT NOT NULL DEFAULT 0,
  in_portfolio TINYINT(1) NOT NULL DEFAULT 0,
  outcome VARCHAR(300) NOT NULL DEFAULT '',  -- hasil akhir
  tools VARCHAR(200) NOT NULL DEFAULT '',    -- contoh: Proxmox, Ubuntu, Apache
  finished_on DATE NULL
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
  position INT NOT NULL DEFAULT 0,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- Satu tabel `tutorials` melayani Tutorial dan Portfolio, jadi tidak ada data ganda.
- Nomor 1.1, 1.2 dihitung dari urutan saat ditampilkan, jadi tetap benar setelah sub judul dipindah.
- Tidak ada kolom sampul. Portfolio memakai foto pertama di tutorial.
- Akun admin tidak perlu tabel: hanya satu orang, dan hash password ada di `.env.local`.

## Keputusan teknis yang mudah terlewat

- **Foto tidak disimpan di `public/`.** Produksi Next.js hanya menyajikan isi `public/` yang ada saat build, jadi foto baru tidak akan muncul. Foto disimpan di `uploads/` dan disajikan lewat route dengan `Content-Type` yang benar dan `X-Content-Type-Options: nosniff`.
- **Upload lewat Route Handler,** karena Server Action dibatasi 1 MB secara default, sedangkan screenshot bisa lebih besar. Route ini memeriksa sesi dan header `Origin` sendiri.
- **Halaman publik memakai `export const dynamic = 'force-dynamic'`.** Tanpa ini, Next.js bisa merender halaman saat build, sehingga butuh database saat build dan tutorial baru tidak muncul.
- **Hash password memakai format `salt:hash` dalam hex,** karena `.env.local` memperlakukan `$` sebagai variabel.
- **Tanda `$` pada blok command dibuat dengan CSS,** jadi tidak ikut tersalin.
- **`<img>` biasa,** dengan `loading="lazy"`. `shortcut: screenshot besar dimuat apa adanya, pakai next/image jika halaman terasa lambat`.
- **Batas login disimpan di memori proses.** `shortcut: hilang saat restart dan tidak berbagi antar proses, simpan di database jika berjalan lebih dari satu proses`.
- **JavaScript di halaman publik hanya untuk tombol salin.** Selain itu Server Component, dan sidebar di HP memakai `<details>`.

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
- HTTPS wajib: cookie `secure` dan tombol salin (`navigator.clipboard`) hanya jalan di HTTPS.
- Buat user MySQL khusus dengan password. Akun `root` tanpa password hanya untuk lokal.
- Folder `uploads/` harus dibackup bersama database.
