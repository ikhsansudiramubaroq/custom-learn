import mysql from 'mysql2/promise'

// Hot reload memuat ulang modul, jadi pool disimpan di globalThis agar koneksi tidak menumpuk.
globalThis.dbPool ??= mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 5,
  dateStrings: true,
})

export const db = globalThis.dbPool
