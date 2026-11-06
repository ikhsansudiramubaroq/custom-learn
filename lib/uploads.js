import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { IMAGE_NAME } from './validate.js'

export const UPLOAD_DIR = join(process.cwd(), 'uploads')

export async function removeImages(names) {
  const safe = names.filter((name) => IMAGE_NAME.test(name))
  await Promise.all(safe.map((name) => rm(join(UPLOAD_DIR, name), { force: true })))
}
