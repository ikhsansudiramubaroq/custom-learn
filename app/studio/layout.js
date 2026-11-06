import { cookies } from 'next/headers'
import Flash from '@/components/Flash'

export const metadata = { title: 'Studio', robots: { index: false, follow: false } }

export default async function StudioLayout({ children }) {
  const store = await cookies()
  return (
    <main className="studio">
      <Flash value={store.get('flash')?.value} />
      {children}
    </main>
  )
}
