import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSaver, getStatus, report, retryAll } from '../lib/autosave.js'

const tick = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms))

function saver(send, isValid = () => true) {
  return createSaver({ key: 'tes', isValid, send, wait: 1 })
}

test('beberapa perubahan cepat hanya terkirim sekali', async () => {
  let sent = 0
  const form = saver(async () => { sent += 1 })
  form.change()
  form.change()
  form.change()
  await tick()
  assert.equal(sent, 1)
  assert.equal(getStatus().state, 'saved')
  assert.ok(getStatus().savedAt instanceof Date)
})

test('perubahan saat permintaan berjalan ikut terkirim dan status tidak berbohong', async () => {
  let value = 'a'
  const received = []
  let release
  const form = saver(async () => {
    received.push(value)
    if (received.length === 1) await new Promise((resolve) => { release = resolve })
  })
  form.change()
  await tick()
  assert.equal(getStatus().state, 'saving')
  value = 'b'
  form.change()
  await tick()
  assert.equal(getStatus().state, 'dirty')
  release()
  await tick()
  assert.deepEqual(received, ['a', 'b'])
  assert.equal(getStatus().state, 'saved')
})

test('blur langsung mengirim tanpa menunggu jeda', async () => {
  let sent = 0
  const form = createSaver({ key: 'tes', isValid: () => true, send: async () => { sent += 1 }, wait: 10000 })
  form.change()
  form.flush()
  await tick()
  assert.equal(sent, 1)
  form.flush()
  await tick()
  assert.equal(sent, 1)
})

test('isian kosong tidak dikirim dan tidak menggantung setelah form hilang', async () => {
  let sent = 0
  const form = saver(async () => { sent += 1 }, () => false)
  form.change()
  await tick()
  assert.equal(sent, 0)
  assert.equal(getStatus().state, 'invalid')
  form.stop()
  assert.equal(getStatus().state, 'saved')
})

test('gagal tetap terlihat sampai dicoba lagi', async () => {
  let online = false
  const form = saver(async () => { if (!online) throw new Error('Putus') })
  form.change()
  await tick()
  assert.equal(getStatus().state, 'failed')
  assert.equal(getStatus().message, 'Putus')
  online = true
  retryAll()
  await tick()
  assert.equal(getStatus().state, 'saved')
})

test('bar mengutamakan yang paling penting', () => {
  report('a', 'draft')
  assert.equal(getStatus().state, 'draft')
  report('b', 'dirty')
  assert.equal(getStatus().state, 'dirty')
  report('c', 'failed', { message: 'x' })
  assert.equal(getStatus().state, 'failed')
  for (const key of ['a', 'b', 'c']) report(key, null)
  assert.equal(getStatus().state, 'saved')
})
