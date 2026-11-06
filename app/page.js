import { getPublishedTutorials } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const tutorials = await getPublishedTutorials()
  return (
    <main>
      <p>{tutorials.length} tutorial terbit.</p>
    </main>
  )
}
