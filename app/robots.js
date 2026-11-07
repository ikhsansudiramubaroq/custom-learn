import { connection } from 'next/server'
import { siteUrl } from '@/lib/site'

export default async function robots() {
  await connection()
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] },
    sitemap: `${await siteUrl()}/sitemap.xml`,
  }
}
