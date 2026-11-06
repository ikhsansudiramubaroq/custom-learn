import assert from 'node:assert/strict'
import { test } from 'node:test'
import { IMAGE_NAME, MAX_MARKS, detectImageType, isHttpUrl, parseMarks, slugify } from '../lib/validate.js'

test('kotak merah hanya menerima data yang benar', () => {
  assert.deepEqual(parseMarks('[]'), [])
  assert.deepEqual(parseMarks('[[10,20,30,40.5]]'), [[10, 20, 30, 40.5]])
  assert.deepEqual(parseMarks('[[50,50,50,50]]'), [[50, 50, 50, 50]])
  for (const bad of [
    'bukan json', 'null', '{}', '[1,2,3,4]', '[[1,2,3]]', '[[1,2,3,4,5]]',
    '[[-1,0,10,10]]', '[[0,0,0,10]]', '[[60,0,50,10]]', '[[0,60,10,50]]', '[["1",0,10,10]]', '[[1e999,0,10,10]]',
  ]) {
    assert.equal(parseMarks(bad), null, bad)
  }
  assert.equal(parseMarks(JSON.stringify(Array(MAX_MARKS + 1).fill([1, 1, 1, 1]))), null)
  // Jumlah maksimal kotak dengan angka terpanjang harus muat di kolom VARCHAR(2000).
  assert.ok(JSON.stringify(Array(MAX_MARKS).fill([99.99, 99.99, 99.99, 99.99])).length < 2000)
})

test('slug dari judul', () => {
  assert.equal(slugify('Instalasi Proxmox sebagai Web Server!'), 'instalasi-proxmox-sebagai-web-server')
  assert.equal(slugify('  Café & C++  '), 'cafe-c')
  assert.equal(slugify('!!!'), 'tutorial')
  assert.equal(slugify('a'.repeat(99) + ' b c').endsWith('-'), false)
})

test('link hanya http dan https', () => {
  assert.equal(isHttpUrl('https://proxmox.com/x?y=1'), true)
  assert.equal(isHttpUrl('http://192.168.1.1:8006'), true)
  assert.equal(isHttpUrl('javascript:alert(1)'), false)
  assert.equal(isHttpUrl('JaVaScRiPt:alert(1)'), false)
  assert.equal(isHttpUrl('data:text/html,x'), false)
  assert.equal(isHttpUrl('bukan url'), false)
})

test('jenis gambar dari byte awal', () => {
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'jpg')
  assert.equal(detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), 'png')
  assert.equal(detectImageType(Buffer.from('GIF89a...')), 'gif')
  assert.equal(detectImageType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ')), 'webp')
  assert.equal(detectImageType(Buffer.from('RIFF\0\0\0\0WAVEfmt ')), null)
  assert.equal(detectImageType(Buffer.from('<html><script>alert(1)</script>')), null)
  assert.equal(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), null)
  assert.equal(detectImageType(Buffer.alloc(0)), null)
})

test('nama file foto tidak bisa keluar folder', () => {
  assert.equal(IMAGE_NAME.test('0123456789abcdef0123456789abcdef.png'), true)
  assert.equal(IMAGE_NAME.test('../.env.local'), false)
  assert.equal(IMAGE_NAME.test('..%2f.env.local'), false)
  assert.equal(IMAGE_NAME.test('0123456789abcdef0123456789abcdef.svg'), false)
  assert.equal(IMAGE_NAME.test('0123456789abcdef0123456789abcdef.png\n'), false)
})
