import { headers } from 'next/headers'

// SITE_URL diisi di hosting. Tanpa itu alamat diambil dari permintaan, supaya canonical tidak menunjuk ke localhost.
export async function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '')
  const list = await headers()
  const host = list.get('x-forwarded-host') ?? list.get('host')
  return `${list.get('x-forwarded-proto') ?? 'http'}://${host}`
}
