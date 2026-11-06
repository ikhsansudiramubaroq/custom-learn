import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SESSION_MS = 7 * 24 * 60 * 60 * 1000
const MAX_FAILS = 10
const LOCK_MS = 15 * 60 * 1000

export function hashPassword(password) {
  const salt = randomBytes(16)
  return `${salt.toString('hex')}:${scryptSync(password, salt, 32).toString('hex')}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const actual = scryptSync(password, Buffer.from(salt, 'hex'), 32)
  const expected = Buffer.from(hash, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('hex')
}

export function createSessionToken(secret, now = Date.now()) {
  const expires = String(now + SESSION_MS)
  return `${expires}.${sign(expires, secret)}`
}

export function verifySessionToken(token, secret, now = Date.now()) {
  if (!token || !secret) return false
  const [expires, signature] = token.split('.')
  if (!expires || !signature) return false
  const expected = Buffer.from(sign(expires, secret))
  const actual = Buffer.from(signature)
  return actual.length === expected.length && timingSafeEqual(actual, expected) && Number(expires) > now
}

// shortcut: hitungan global di memori, hilang saat restart dan bisa dipakai orang lain untuk mengunci login sementara, simpan di database jika berjalan lebih dari satu proses
export function createLoginLimiter() {
  let fails = 0
  let lockedUntil = 0
  return {
    isLocked: (now = Date.now()) => now < lockedUntil,
    fail(now = Date.now()) {
      fails += 1
      if (fails >= MAX_FAILS) {
        lockedUntil = now + LOCK_MS
        fails = 0
      }
    },
    reset() {
      fails = 0
      lockedUntil = 0
    },
  }
}
