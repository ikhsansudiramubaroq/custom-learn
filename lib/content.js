import { db } from './db.js'
import { remember } from './memo.js'
import { escapeLike, groupResults } from './search.js'

// Yang disimpan di memori hanya isi published, jadi draft tidak bisa ikut tersaji.
export function getPublishedTutorials() {
  return remember('tutorials', async () => {
    const [rows] = await db.query(
    `SELECT t.id, t.slug, t.title, t.summary, c.name AS category, t.outcome, t.tools, t.finished_on
     FROM tutorials t JOIN categories c ON c.id = t.category_id
     WHERE t.status = 'published' ORDER BY c.position, c.id, t.position, t.id`,
    )
    return rows.map((tutorial, index) => ({ ...tutorial, number: index + 1 }))
  })
}

// Slug dicek dulu, supaya URL ngawur tidak mengisi memori.
export async function getPublishedTutorial(slug) {
  const tutorials = await getPublishedTutorials()
  const tutorial = tutorials.find((item) => item.slug === slug)
  if (!tutorial) return null
  return remember(`tutorial:${tutorial.id}`, async () => ({ ...tutorial, sections: await getSections(tutorial) }))
}

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

export function getSitemapTutorials() {
  return remember('sitemap', async () => {
    const [rows] = await db.query(
      `SELECT t.slug, COUNT(s.id) AS section_count
       FROM tutorials t JOIN categories c ON c.id = t.category_id LEFT JOIN sections s ON s.tutorial_id = t.id
       WHERE t.status = 'published' GROUP BY t.id, t.slug, t.position, c.id, c.position
       ORDER BY c.position, c.id, t.position, t.id`,
    )
    return rows
  })
}

export function getPortfolio() {
  return remember('portfolio', async () => {
    const [rows] = await db.query(
      `SELECT t.slug, t.title, t.outcome, t.tools, t.finished_on,
         (SELECT b.content FROM blocks b JOIN sections s ON s.id = b.section_id
          WHERE s.tutorial_id = t.id AND b.type = 'image'
          ORDER BY s.position, s.id, b.position, b.id LIMIT 1) AS image
       FROM tutorials t JOIN categories c ON c.id = t.category_id
       WHERE t.status = 'published' AND t.in_portfolio = 1
       ORDER BY c.position, c.id, t.position, t.id`,
    )
    return rows
  })
}

export async function getAllTutorials() {
  const [rows] = await db.query(
    `SELECT t.id, t.slug, t.title, c.name AS category, t.status, t.in_portfolio
     FROM tutorials t JOIN categories c ON c.id = t.category_id
     ORDER BY c.position, c.id, t.position, t.id`,
  )
  return rows
}

export async function getCategories() {
  const [rows] = await db.query(
    `SELECT c.id, c.name, COUNT(t.id) AS tutorial_count
     FROM categories c LEFT JOIN tutorials t ON t.category_id = c.id
     GROUP BY c.id, c.name, c.position ORDER BY c.position, c.id`,
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
