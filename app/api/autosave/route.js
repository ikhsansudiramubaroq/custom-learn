import { db } from '@/lib/db'
import { blockContent, categoryId, field, required } from '@/lib/form'
import { isAdmin, isSameOrigin } from '@/lib/session'

function fail(status, error) {
  return Response.json({ error }, { status })
}

// Slug tidak ikut berubah, supaya link yang sudah dibagikan tetap hidup.
async function saveTutorial(id, formData) {
  const status = formData.get('status') === 'published' ? 'published' : 'draft'
  const finishedOn = field(formData, 'finished_on', 10)
  if (finishedOn && !/^\d{4}-\d{2}-\d{2}$/.test(finishedOn)) throw new Error('Tanggal tidak valid')
  await db.execute(
    `UPDATE tutorials SET title = ?, summary = ?, category_id = ?, status = ?,
     in_portfolio = ?, outcome = ?, tools = ?, finished_on = ? WHERE id = ?`,
    [
      required(formData, 'title', 200),
      field(formData, 'summary', 500),
      categoryId(formData),
      status,
      formData.get('in_portfolio') ? 1 : 0,
      field(formData, 'outcome', 300),
      field(formData, 'tools', 200),
      finishedOn || null,
      id,
    ],
  )
}

async function saveSection(id, formData) {
  await db.execute('UPDATE sections SET title = ? WHERE id = ?', [required(formData, 'title', 200), id])
}

async function saveBlock(id, formData) {
  const [[block]] = await db.execute('SELECT type FROM blocks WHERE id = ?', [id])
  if (!block) return
  const label = field(formData, 'label', 255)
  if (block.type === 'image') {
    await db.execute('UPDATE blocks SET label = ? WHERE id = ?', [label, id])
  } else {
    await db.execute('UPDATE blocks SET content = ?, label = ? WHERE id = ?', [blockContent(block.type, formData), label, id])
  }
}

async function saveCategory(id, formData) {
  await db.execute('UPDATE categories SET name = ? WHERE id = ?', [required(formData, 'name', 60), id])
}

const SAVERS = { tutorial: saveTutorial, section: saveSection, block: saveBlock, category: saveCategory }

export async function POST(request) {
  if (!(await isAdmin())) return fail(401, 'Sesi berakhir, login lagi di tab baru lalu coba lagi.')
  if (!isSameOrigin(request)) return fail(403, 'Asal permintaan ditolak.')

  const form = await request.formData()
  const kind = form.get('kind')
  const id = Number(form.get('id'))
  if (!Object.hasOwn(SAVERS, kind) || !Number.isInteger(id)) return fail(400, 'Data simpan tidak lengkap.')

  try {
    await SAVERS[kind](id, form)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return fail(409, 'Nama kategori itu sudah ada.')
    console.error('Simpan otomatis gagal:', error)
    return fail(400, 'Gagal menyimpan, periksa isian lalu coba lagi.')
  }
  return new Response(null, { status: 204 })
}
