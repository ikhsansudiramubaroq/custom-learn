import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createLoginLimiter,
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from '../lib/auth.js'

test('password benar lolos, salah ditolak', () => {
  const stored = hashPassword('rahasia-panjang')
  assert.equal(stored.includes('$'), false)
  assert.equal(verifyPassword('rahasia-panjang', stored), true)
  assert.equal(verifyPassword('salah', stored), false)
  assert.equal(verifyPassword('apa saja', 'bukan-hash'), false)
})

test('token sesi: tanda tangan dan masa berlaku', () => {
  const token = createSessionToken('secret', 1000)
  assert.equal(verifySessionToken(token, 'secret', 2000), true)
  assert.equal(verifySessionToken(token, 'secret-lain', 2000), false)
  assert.equal(verifySessionToken(token.replace(/^\d+/, '9'.repeat(14)), 'secret', 2000), false)
  assert.equal(verifySessionToken(token, 'secret', Date.now() * 2), false)
  assert.equal(verifySessionToken('', 'secret'), false)
  assert.equal(verifySessionToken(token, '', 2000), false)
})

test('login dikunci setelah 10 kali gagal, lalu terbuka lagi', () => {
  const limiter = createLoginLimiter()
  for (let i = 0; i < 9; i += 1) limiter.fail(0)
  assert.equal(limiter.isLocked(0), false)
  limiter.fail(0)
  assert.equal(limiter.isLocked(1), true)
  assert.equal(limiter.isLocked(16 * 60 * 1000), false)
})
