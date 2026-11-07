import { connection } from 'next/server'
import { getSitemapTutorials } from '@/lib/content'
import { sectionPath } from '@/lib/seo'
import { siteUrl } from '@/lib/site'

export default async function sitemap() {
  // Dibuat saat diminta, supaya tutorial baru langsung masuk tanpa build ulang.
  await connection()
  const base = await siteUrl()
  const tutorials = await getSitemapTutorials()
  const paths = tutorials.flatMap(({ slug, section_count: count }) => (
    Array.from({ length: Math.max(count, 1) }, (_, index) => sectionPath(slug, index))
  ))
  return ['', '/tutorial', ...paths].map((path) => ({ url: `${base}${path}` }))
}
