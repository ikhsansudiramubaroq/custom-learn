import { db } from './db.js'

export const CATEGORY_LABELS = { linux: 'Linux', programming: 'Programming' }

export async function getPublishedTutorials() {
  const [rows] = await db.query(
    "SELECT id, slug, title, summary, category FROM tutorials WHERE status = 'published' ORDER BY category, position, id",
  )
  return rows.map((tutorial, index) => ({ ...tutorial, number: index + 1 }))
}

export async function getPublishedTutorial(slug) {
  const tutorials = await getPublishedTutorials()
  const tutorial = tutorials.find((item) => item.slug === slug)
  return tutorial ? { ...tutorial, sections: await getSections(tutorial) } : null
}

async function getSections(tutorial) {
  const [sections] = await db.execute(
    'SELECT id, title FROM sections WHERE tutorial_id = ? ORDER BY position, id',
    [tutorial.id],
  )
  const [blocks] = await db.execute(
    `SELECT b.id, b.section_id, b.type, b.content, b.label
     FROM blocks b JOIN sections s ON s.id = b.section_id
     WHERE s.tutorial_id = ? ORDER BY b.position, b.id`,
    [tutorial.id],
  )
  return sections.map((section, index) => ({
    ...section,
    number: `${tutorial.number}.${index + 1}`,
    blocks: blocks.filter((block) => block.section_id === section.id),
  }))
}
