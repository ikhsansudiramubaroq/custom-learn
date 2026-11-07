import { sectionPath } from './seo.js'

export const MIN_QUERY = 2
export const MAX_QUERY = 100
export const MAX_RESULTS = 200

const SNIPPET_BEFORE = 60
const SNIPPET_LENGTH = 180
const KINDS = { text: 'Teks', command: 'Command', code: 'Code' }

export function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&')
}

// Hasil berupa potongan teks: indeks ganjil adalah bagian yang cocok.
export function matchParts(line, query) {
  const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const at = line.search(new RegExp(pattern, 'i'))
  if (at < 0) return null
  const start = Math.max(0, at - SNIPPET_BEFORE)
  const end = start + SNIPPET_LENGTH
  const parts = line.slice(start, end).split(new RegExp(`(${pattern})`, 'gi'))
  if (start > 0) parts[0] = `…${parts[0]}`
  if (end < line.length) parts[parts.length - 1] += '…'
  return parts
}

// Setiap baris yang cocok menjadi satu hasil, seperti pencarian dokumentasi.
export function groupResults(tutorials, sections, blocks, query) {
  let total = 0
  let truncated = false
  const take = (rows, row) => {
    if (total >= MAX_RESULTS) {
      truncated = true
    } else {
      rows.push(row)
      total += 1
    }
  }

  const groups = tutorials.flatMap((tutorial) => {
    const rows = []
    const titleParts = matchParts(tutorial.title, query)
    if (titleParts) take(rows, { key: `t-${tutorial.id}`, kind: 'Judul', parts: titleParts, href: sectionPath(tutorial.slug, 0) })

    const matched = sections
      .filter((section) => section.tutorial_id === tutorial.id)
      .flatMap((section, index) => {
        const path = sectionPath(tutorial.slug, index)
        const sectionRows = []
        const parts = matchParts(section.title, query)
        if (parts) take(sectionRows, { key: `s-${section.id}`, kind: 'Sub judul', parts, href: path })

        for (const block of blocks.filter((item) => item.section_id === section.id)) {
          block.content.split('\n').forEach((line, lineIndex) => {
            const lineParts = matchParts(line, query)
            if (!lineParts) return
            take(sectionRows, {
              key: `b-${block.id}-${lineIndex}`,
              kind: KINDS[block.type],
              mono: block.type !== 'text',
              parts: lineParts,
              href: `${path}#b-${block.id}`,
            })
          })
        }
        return sectionRows.length
          ? [{ id: section.id, number: `${tutorial.number}.${index + 1}`, title: section.title, path, rows: sectionRows }]
          : []
      })

    return rows.length || matched.length ? [{ tutorial, rows, sections: matched }] : []
  })

  return { groups, total, truncated }
}
