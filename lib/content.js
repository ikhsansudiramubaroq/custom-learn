import { cache } from 'react'
import { db } from './db.js'
import { escapeLike, groupResults } from './search.js'

export const CATEGORY_LABELS = { linux: 'Linux', programming: 'Programming' }

// cache: metadata dan halaman memakai data yang sama, jadi database cukup ditanya sekali per permintaan.
export const getPublishedTutorials = cache(async () => {
  const [rows] = await db.query(
    "SELECT id, slug, title, summary, category, outcome, tools, finished_on FROM tutorials WHERE status = 'published' ORDER BY category, position, id",
  )
  return rows.map((tutorial, index) => ({ ...tutorial, number: index + 1 }))
})

export const getPublishedTutorial = cache(async (slug) => {
  const tutorials = await getPublishedTutorials()
  const tutorial = tutorials.find((item) => item.slug === slug)
  return tutorial ? { ...tutorial, sections: await getSections(tutorial) } : null
})

// shortcut: LIKE memindai semua blok, pakai indeks FULLTEXT jika blok sudah puluhan ribu
export async function searchTutorials(query) {
  const tutorials = await getPublishedTutorials()
  const [sections] = await db.query(
    `SELECT s.id, s.tutorial_id, s.title
     FROM sections s JOIN tutorials t ON t.id = s.tutorial_id
     WHERE t.status = 'published' ORDER BY s.position, s.id`,
  )
  const [blocks] = await db.execute(
    `SELECT b.id, b.section_id, b.type, b.content
     FROM blocks b
     JOIN sections s ON s.id = b.section_id
     JOIN tutorials t ON t.id = s.tutorial_id
     WHERE t.status = 'published' AND b.type IN ('text', 'command', 'code') AND b.content LIKE ?
     ORDER BY b.position, b.id`,
    [`%${escapeLike(query)}%`],
  )
  return groupResults(tutorials, sections, blocks, query)
}

export async function getSitemapTutorials() {
  const [rows] = await db.query(
    `SELECT t.slug, COUNT(s.id) AS section_count
     FROM tutorials t LEFT JOIN sections s ON s.tutorial_id = t.id
     WHERE t.status = 'published' GROUP BY t.id, t.slug ORDER BY t.category, t.position, t.id`,
  )
  return rows
}

export async function getPortfolio() {
  const [rows] = await db.query(
    `SELECT t.slug, t.title, t.outcome, t.tools, t.finished_on,
       (SELECT b.content FROM blocks b JOIN sections s ON s.id = b.section_id
        WHERE s.tutorial_id = t.id AND b.type = 'image'
        ORDER BY s.position, s.id, b.position, b.id LIMIT 1) AS image
     FROM tutorials t
     WHERE t.status = 'published' AND t.in_portfolio = 1
     ORDER BY t.finished_on IS NULL, t.finished_on DESC, t.id DESC`,
  )
  return rows
}

export async function getAllTutorials() {
  const [rows] = await db.query(
    'SELECT id, slug, title, category, status, in_portfolio FROM tutorials ORDER BY category, position, id',
  )
  return rows
}

export async function getTutorialForEdit(id) {
  const [[tutorial]] = await db.execute('SELECT * FROM tutorials WHERE id = ?', [id])
  return tutorial ? { ...tutorial, sections: await getSections({ ...tutorial, number: 0 }) } : null
}

async function getSections(tutorial) {
  const [sections] = await db.execute(
    'SELECT id, title FROM sections WHERE tutorial_id = ? ORDER BY position, id',
    [tutorial.id],
  )
  const [blocks] = await db.execute(
    `SELECT b.id, b.section_id, b.type, b.content, b.label, b.marks
     FROM blocks b JOIN sections s ON s.id = b.section_id
     WHERE s.tutorial_id = ? ORDER BY b.position, b.id`,
    [tutorial.id],
  )
  return sections.map((section, index) => ({
    ...section,
    number: `${tutorial.number}.${index + 1}`,
    blocks: blocks
      .filter((block) => block.section_id === section.id)
      .map((block) => ({ ...block, marks: JSON.parse(block.marks) })),
  }))
}
