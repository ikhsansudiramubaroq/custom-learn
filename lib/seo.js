import { profile } from './profile.js'

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

// Data terstruktur: memberi tahu mesin pencari siapa pemilik situs dan apa isi halamannya.
function person(base) {
  return {
    '@type': 'Person',
    '@id': `${base}/#person`,
    name: profile.name,
    url: base,
    description: profile.bio,
    sameAs: profile.links.map((link) => link.url),
  }
}

export function homeSchema(base) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person(base),
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: profile.name,
        inLanguage: 'id',
        author: { '@id': `${base}/#person` },
      },
    ],
  }
}

export function tutorialSchema(base, tutorial, section, index) {
  const url = `${base}${sectionPath(tutorial.slug, index)}`
  const image = section?.blocks.find((block) => block.type === 'image')?.content
  const crumbs = [
    { name: 'Tutorial', item: `${base}/tutorial` },
    { name: tutorial.title, item: `${base}${sectionPath(tutorial.slug, 0)}` },
    ...(index > 0 ? [{ name: section.title, item: url }] : []),
  ]
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person(base),
      {
        '@type': 'TechArticle',
        headline: sectionTitle(tutorial, section, index).slice(0, 110),
        description: describeSection(tutorial, section, index),
        url,
        inLanguage: 'id',
        author: { '@id': `${base}/#person` },
        ...(image && { image: [`${base}/uploads/${image}`] }),
        ...(tutorial.finished_on && { datePublished: tutorial.finished_on }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, position) => ({ '@type': 'ListItem', position: position + 1, ...crumb })),
      },
    ],
  }
}

export function sectionTitle(tutorial, section, index) {
  return index > 0 ? `${section.title}: ${tutorial.title}` : tutorial.title
}
