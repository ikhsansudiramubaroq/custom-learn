import mysql from 'mysql2/promise'

function pool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL belum ada. Jalankan: node scripts/setup.mjs')
  // Hot reload memuat ulang modul, jadi pool disimpan di globalThis agar koneksi tidak menumpuk.
  globalThis.dbPool ??= mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 5,
    dateStrings: true,
  })
  return globalThis.dbPool
}

export const db = {
  query: (...args) => pool().query(...args),
  execute: (...args) => pool().execute(...args),
}
