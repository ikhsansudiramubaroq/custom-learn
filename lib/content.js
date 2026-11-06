import { db } from './db.js'

export async function getPublishedTutorials() {
  const [rows] = await db.query(
    "SELECT id, slug, title, summary, category FROM tutorials WHERE status = 'published' ORDER BY position, id",
  )
  return rows
}
