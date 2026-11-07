import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { db } from '@/lib/db'
import { forgetContent } from '@/lib/memo'
import { isAdmin, isSameOrigin, setFlash } from '@/lib/session'
import { UPLOAD_DIR, removeImages } from '@/lib/uploads'
import { MAX_IMAGE_BYTES, detectImageType } from '@/lib/validate'

function fail(status, error) {
  return Response.json({ error }, { status })
}

export async function POST(request) {
  if (!(await isAdmin())) return fail(401, 'Sesi berakhir, silakan login lagi.')
  if (!isSameOrigin(request)) return fail(403, 'Asal permintaan ditolak.')
  // Dicek sebelum dibaca supaya file raksasa tidak masuk memori. 1 KB untuk pembungkus form.
  if (Number(request.headers.get('content-length')) > MAX_IMAGE_BYTES + 1024) return fail(413, 'Foto maksimal 10 MB.')

  const form = await request.formData()
  const file = form.get('file')
  const sectionId = Number(form.get('section_id'))
  if (!(file instanceof File) || !Number.isInteger(sectionId)) return fail(400, 'Data upload tidak lengkap.')
  if (file.size > MAX_IMAGE_BYTES) return fail(413, 'Foto maksimal 10 MB.')

  const bytes = Buffer.from(await file.arrayBuffer())
  const extension = detectImageType(bytes)
  if (!extension) return fail(415, 'Hanya JPG, PNG, WEBP, atau GIF.')

  const name = `${randomBytes(16).toString('hex')}.${extension}`
  await writeFile(join(UPLOAD_DIR, name), bytes)
  try {
    await db.execute(
      `INSERT INTO blocks (section_id, type, content, position)
       SELECT ?, 'image', ?, COALESCE(MAX(position), -1) + 1 FROM blocks WHERE section_id = ?`,
      [sectionId, name, sectionId],
    )
  } catch {
    await removeImages([name])
    return fail(400, 'Sub judul tidak ditemukan.')
  }
  forgetContent()
  await setFlash('Foto ditambahkan')
  return Response.json({ name })
}
