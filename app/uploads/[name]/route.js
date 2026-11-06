import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { UPLOAD_DIR } from '@/lib/uploads'
import { IMAGE_NAME } from '@/lib/validate'

const CONTENT_TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }

export async function GET(request, { params }) {
  const { name } = await params
  if (!IMAGE_NAME.test(name)) return new Response('Tidak ditemukan', { status: 404 })
  try {
    const bytes = await readFile(join(UPLOAD_DIR, name))
    return new Response(bytes, {
      headers: {
        'Content-Type': CONTENT_TYPES[name.split('.')[1]],
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Tidak ditemukan', { status: 404 })
  }
}
