// Membuat database, tabel, dan password admin. Aman dijalankan ulang untuk mengganti password.
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import mysql from 'mysql2/promise'
import { hashPassword } from '../lib/auth.js'

const ENV_FILE = '.env.local'
const env = {}
if (existsSync(ENV_FILE)) {
  for (const line of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const at = line.indexOf('=')
    if (at > 0) env[line.slice(0, at)] = line.slice(at + 1)
  }
}

const url = new URL(process.env.DATABASE_URL || env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/custom_learn')
const database = url.pathname.slice(1)
if (!/^\w+$/.test(database)) throw new Error(`Nama database tidak valid: ${database}`)

url.pathname = ''
const connection = await mysql.createConnection({ uri: url.href, multipleStatements: true })
await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
await connection.query(`USE \`${database}\``)
await connection.query(readFileSync('db/schema.sql', 'utf8'))
await connection.end()
console.log(`Database ${database} siap.`)

const prompt = createInterface({ input: process.stdin, output: process.stdout })
const hint = env.ADMIN_PASSWORD_HASH ? ' (kosongkan untuk tidak mengganti)' : ''
const password = await prompt.question(`Password admin, minimal 10 karakter${hint}: `)
prompt.close()

if (password) {
  if (password.length < 10) throw new Error('Password terlalu pendek.')
  env.ADMIN_PASSWORD_HASH = hashPassword(password)
} else if (!env.ADMIN_PASSWORD_HASH) {
  throw new Error('Password wajib diisi.')
}

url.pathname = `/${database}`
env.DATABASE_URL ||= url.href
env.SESSION_SECRET ||= randomBytes(32).toString('hex')
writeFileSync(ENV_FILE, Object.entries(env).map(([key, value]) => `${key}=${value}\n`).join(''))
console.log(`${ENV_FILE} tersimpan.`)
