import assert from 'node:assert/strict'
import { test } from 'node:test'
import { forgetContent, remember } from '../lib/memo.js'

test('query hanya berjalan sekali sampai isi berubah', async () => {
  forgetContent()
  let runs = 0
  const load = async () => (runs += 1)
  assert.equal(await remember('a', load), 1)
  assert.equal(await remember('a', load), 1)
  forgetContent()
  assert.equal(await remember('a', load), 2)
})

test('permintaan bersamaan berbagi satu query', async () => {
  forgetContent()
  let runs = 0
  const load = async () => (runs += 1)
  await Promise.all([remember('b', load), remember('b', load), remember('b', load)])
  assert.equal(runs, 1)
})

test('query gagal tidak disimpan', async () => {
  forgetContent()
  await assert.rejects(remember('c', async () => { throw new Error('putus') }))
  assert.equal(await remember('c', async () => 'pulih'), 'pulih')
})

test('pembacaan lama tidak menimpa isi baru', async () => {
  forgetContent()
  let finish
  const old = remember('d', () => new Promise((resolve) => { finish = resolve }))
  forgetContent()
  assert.equal(await remember('d', async () => 'baru'), 'baru')
  finish('lama')
  await old
  assert.equal(await remember('d', async () => 'tidak dipakai'), 'baru')
})
