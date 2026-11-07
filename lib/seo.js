const MAX_DESCRIPTION = 155

// Sub judul pertama memakai URL tutorial, supaya mesin pencari tidak melihat dua halaman yang sama.
export function sectionPath(slug, index) {
  return index > 0 ? `/tutorial/${slug}/${index + 1}` : `/tutorial/${slug}`
}

function shorten(text) {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= MAX_DESCRIPTION) return flat
  const cut = flat.slice(0, MAX_DESCRIPTION)
  const space = cut.lastIndexOf(' ')
  return `${space > 0 ? cut.slice(0, space) : cut}…`
}

export function describeSection(tutorial, section, index) {
  const text = section?.blocks.find((block) => block.type === 'text')?.content
  const sources = index === 0 ? [tutorial.summary, text] : [text, tutorial.summary]
  const fallback = section ? `${section.title}: ${tutorial.title}` : tutorial.title
  return shorten(sources.find((source) => source?.trim()) ?? fallback)
}

export function sectionTitle(tutorial, section, index) {
  return index > 0 ? `${section.title}: ${tutorial.title}` : tutorial.title
}
