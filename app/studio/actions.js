'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CATEGORY_LABELS } from '@/lib/content'
import { db } from '@/lib/db'
import { blockContent, field, required } from '@/lib/form'
import { logIn, logOut, requireAdmin, setFlash } from '@/lib/session'
import { removeImages } from '@/lib/uploads'
import { parseMarks, slugify } from '@/lib/validate'

// Setiap fungsi yang diekspor di sini bisa dipanggil langsung lewat HTTP,
// jadi semuanya wajib memanggil requireAdmin() lebih dulu.

function category(formData) {
  const value = formData.get('category')
  if (!Object.hasOwn(CATEGORY_LABELS, value)) throw new Error('Kategori tidak dikenal')
  return value
}

async function nextPosition(table, column, value) {
  const [[row]] = await db.execute(`SELECT COALESCE(MAX(position), -1) + 1 AS next FROM ${table} WHERE ${column} = ?`, [value])
  return row.next
}

async function move(table, scopeColumn, id, direction) {
  const [[row]] = await db.execute(`SELECT ${scopeColumn} AS scope FROM ${table} WHERE id = ?`, [id])
  if (!row) return
  const [siblings] = await db.execute(`SELECT id FROM ${table} WHERE ${scopeColumn} = ? ORDER BY position, id`, [row.scope])
  const ids = siblings.map((sibling) => sibling.id)
  const from = ids.indexOf(id)
  const to = from + direction
  if (to < 0 || to >= ids.length) return
  ;[ids[from], ids[to]] = [ids[to], ids[from]]
  await Promise.all(ids.map((rowId, index) => db.execute(`UPDATE ${table} SET position = ? WHERE id = ?`, [index, rowId])))
  await refresh('Urutan diubah')
}

async function refresh(message) {
  await setFlash(message)
  revalidatePath('/studio', 'layout')
}

export async function login(formData) {
  const failure = await logIn(String(formData.get('password') ?? ''))
  redirect(failure ? `/studio/login?gagal=${failure}` : '/studio')
}

export async function logout() {
  await logOut()
  redirect('/studio/login')
}

export async function createTutorial(formData) {
  await requireAdmin()
  const title = required(formData, 'title', 200)
  const chosen = category(formData)

  const base = slugify(title)
  const [taken] = await db.execute('SELECT slug FROM tutorials WHERE slug = ? OR slug LIKE ?', [base, `${base}-%`])
  const slugs = new Set(taken.map((row) => row.slug))
  let slug = base
  for (let n = 2; slugs.has(slug); n += 1) slug = `${base}-${n}`

  const [result] = await db.execute(
    'INSERT INTO tutorials (slug, title, category, position) VALUES (?, ?, ?, ?)',
    [slug, title, chosen, await nextPosition('tutorials', 'category', chosen)],
  )
  await setFlash('Tutorial dibuat')
  redirect(`/studio/${result.insertId}`)
}

export async function deleteTutorial(id) {
  await requireAdmin()
  const [images] = await db.execute(
    `SELECT b.content FROM blocks b JOIN sections s ON s.id = b.section_id
     WHERE b.type = 'image' AND s.tutorial_id = ?`,
    [id],
  )
  await db.execute('DELETE FROM tutorials WHERE id = ?', [id])
  await removeImages(images.map((image) => image.content))
  await refresh('Tutorial dihapus')
  redirect('/studio')
}

export async function moveTutorial(id, direction) {
  await requireAdmin()
  await move('tutorials', 'category', id, direction)
}

export async function addSection(tutorialId, formData) {
  await requireAdmin()
  await db.execute(
    'INSERT INTO sections (tutorial_id, title, position) VALUES (?, ?, ?)',
    [tutorialId, required(formData, 'title', 200), await nextPosition('sections', 'tutorial_id', tutorialId)],
  )
  await refresh('Sub judul ditambahkan')
}

export async function deleteSection(id) {
  await requireAdmin()
  const [images] = await db.execute("SELECT content FROM blocks WHERE type = 'image' AND section_id = ?", [id])
  await db.execute('DELETE FROM sections WHERE id = ?', [id])
  await removeImages(images.map((image) => image.content))
  await refresh('Sub judul dihapus')
}

export async function moveSection(id, direction) {
  await requireAdmin()
  await move('sections', 'tutorial_id', id, direction)
}

export async function addBlock(sectionId, formData) {
  await requireAdmin()
  const type = formData.get('type')
  if (!['text', 'link', 'command', 'code'].includes(type)) throw new Error('Jenis blok tidak dikenal')
  await db.execute(
    'INSERT INTO blocks (section_id, type, content, label, position) VALUES (?, ?, ?, ?, ?)',
    [sectionId, type, blockContent(type, formData), field(formData, 'label', 255), await nextPosition('blocks', 'section_id', sectionId)],
  )
  await refresh('Blok ditambahkan')
}

export async function updateMarks(id, value) {
  await requireAdmin()
  const marks = parseMarks(value)
  if (!marks) throw new Error('Kotak tidak valid')
  await db.execute("UPDATE blocks SET marks = ? WHERE id = ? AND type = 'image'", [JSON.stringify(marks), id])
  await refresh('Kotak diperbarui')
}

export async function deleteBlock(id) {
  await requireAdmin()
  const [[block]] = await db.execute('SELECT type, content FROM blocks WHERE id = ?', [id])
  if (!block) return
  await db.execute('DELETE FROM blocks WHERE id = ?', [id])
  if (block.type === 'image') await removeImages([block.content])
  await refresh('Blok dihapus')
}

export async function moveBlock(id, direction) {
  await requireAdmin()
  await move('blocks', 'section_id', id, direction)
}
