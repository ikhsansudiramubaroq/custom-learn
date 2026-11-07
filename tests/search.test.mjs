import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MAX_RESULTS, escapeLike, groupResults, matchParts } from '../lib/search.js'
import { describeSection, homeSchema, sectionPath, sectionTitle, tutorialSchema } from '../lib/seo.js'

const tutorials = [
  { id: 1, slug: 'proxmox', title: 'Instalasi Apache', number: 1 },
  { id: 2, slug: 'git', title: 'Dasar Git', number: 2 },
]
const sections = [
  { id: 10, tutorial_id: 1, title: 'Persiapan' },
  { id: 11, tutorial_id: 1, title: 'Memasang Apache' },
  { id: 20, tutorial_id: 2, title: 'Repo' },
]

test('wildcard LIKE di-escape', () => {
  assert.equal(escapeLike('100%_a\\b'), '100\\%\\_a\\\\b')
})

test('potongan hasil menandai semua kata yang cocok tanpa peduli huruf besar', () => {
  assert.deepEqual(matchParts('apt update && APT install', 'apt'), ['', 'apt', ' update && ', 'APT', ' install'])
  assert.equal(matchParts('tidak ada', 'apt'), null)
})

test('karakter khusus regex dicari apa adanya', () => {
  assert.deepEqual(matchParts('a.b axb', 'a.b'), ['', 'a.b', ' axb'])
  assert.deepEqual(matchParts('harga (10)', '(10)'), ['harga ', '(10)', ''])
  assert.equal(matchParts('abc', '['), null)
})

test('baris panjang dipotong di sekitar kata yang cocok', () => {
  const parts = matchParts(`${'x'.repeat(500)}apt${'y'.repeat(500)}`, 'apt')
  assert.equal(parts[1], 'apt')
  assert.ok(parts[0].startsWith('…'))
  assert.ok(parts[2].endsWith('…'))
  assert.ok(parts.join('').length < 200)
})

test('10 baris cocok menjadi 10 hasil berjajar di satu sub judul', () => {
  const content = Array.from({ length: 10 }, (_, i) => `apt install paket-${i}`).join('\n')
  const blocks = [{ id: 5, section_id: 11, type: 'command', content }]
  const { groups, total } = groupResults(tutorials, sections, blocks, 'apt')
  assert.equal(total, 10)
  assert.equal(groups.length, 1)
  assert.equal(groups[0].sections[0].number, '1.2')
  assert.equal(groups[0].sections[0].rows.length, 10)
  assert.equal(groups[0].sections[0].rows[0].href, '/tutorial/proxmox/2#b-5')
  assert.equal(groups[0].sections[0].rows[0].kind, 'Command')
  assert.equal(new Set(groups[0].sections[0].rows.map((row) => row.key)).size, 10)
})

test('judul, sub judul, dan teks semuanya ditemukan dengan label masing-masing', () => {
  const blocks = [{ id: 6, section_id: 10, type: 'text', content: 'Pasang Apache dulu' }]
  const { groups, total } = groupResults(tutorials, sections, blocks, 'apache')
  assert.equal(total, 3)
  assert.equal(groups[0].rows[0].kind, 'Judul')
  assert.equal(groups[0].rows[0].href, '/tutorial/proxmox')
  assert.deepEqual(groups[0].sections.map((section) => section.number), ['1.1', '1.2'])
  assert.equal(groups[0].sections[0].rows[0].kind, 'Teks')
  assert.equal(groups[0].sections[1].rows[0].kind, 'Sub judul')
})

test('tutorial tanpa hasil tidak ditampilkan', () => {
  assert.deepEqual(groupResults(tutorials, sections, [], 'tidak-ada').groups, [])
})

test('jumlah hasil dibatasi', () => {
  const content = Array.from({ length: MAX_RESULTS + 50 }, () => 'apt').join('\n')
  const blocks = [{ id: 7, section_id: 20, type: 'code', content }]
  const { total, truncated } = groupResults(tutorials, sections, blocks, 'apt')
  assert.equal(total, MAX_RESULTS)
  assert.equal(truncated, true)
})

test('URL dan judul SEO', () => {
  assert.equal(sectionPath('a', 0), '/tutorial/a')
  assert.equal(sectionPath('a', 2), '/tutorial/a/3')
  assert.equal(sectionTitle({ title: 'Proxmox' }, { title: 'Buat VM' }, 0), 'Proxmox')
  assert.equal(sectionTitle({ title: 'Proxmox' }, { title: 'Buat VM' }, 1), 'Buat VM: Proxmox')
})

test('deskripsi SEO dari ringkasan dan teks', () => {
  const tutorial = { title: 'Proxmox', summary: 'Ringkasan tutorial.' }
  const section = { title: 'Buat VM', blocks: [{ type: 'command', content: 'x' }, { type: 'text', content: 'Isi\n\nlangkah   ini.' }] }
  assert.equal(describeSection(tutorial, section, 0), 'Ringkasan tutorial.')
  assert.equal(describeSection(tutorial, section, 1), 'Isi langkah ini.')
  assert.equal(describeSection({ title: 'Proxmox', summary: '' }, { title: 'Buat VM', blocks: [] }, 1), 'Buat VM: Proxmox')
  assert.equal(describeSection({ title: 'Proxmox', summary: '' }, undefined, 0), 'Proxmox')
  const long = describeSection({ title: 'P', summary: `${'kata '.repeat(100)}` }, undefined, 0)
  assert.ok(long.length <= 156 && long.endsWith('…') && !long.includes(' …'))
})

test('data terstruktur beranda dan tutorial', () => {
  const home = homeSchema('https://a.test')
  assert.equal(home['@graph'][0].name, 'Ikhsan Sudira Mubaroq')
  assert.equal(home['@graph'][1]['@type'], 'WebSite')

  const tutorial = { slug: 'p', title: 'Proxmox', summary: 'Ringkas', finished_on: '2026-10-12' }
  const section = { title: 'Buat VM', blocks: [{ type: 'image', content: 'a.png' }] }
  const [, article, crumbs] = tutorialSchema('https://a.test', tutorial, section, 1)['@graph']
  assert.equal(article.url, 'https://a.test/tutorial/p/2')
  assert.deepEqual(article.image, ['https://a.test/uploads/a.png'])
  assert.equal(article.datePublished, '2026-10-12')
  assert.deepEqual(crumbs.itemListElement.map((crumb) => crumb.name), ['Tutorial', 'Proxmox', 'Buat VM'])

  const [, firstArticle, firstCrumbs] = tutorialSchema('https://a.test', { ...tutorial, finished_on: null }, undefined, 0)['@graph']
  assert.equal(firstArticle.image, undefined)
  assert.equal(firstArticle.datePublished, undefined)
  assert.equal(firstCrumbs.itemListElement.length, 2)
})
