import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { getPublishedTutorials } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Tutorial' }

export default async function TutorialsPage() {
  const tutorials = await getPublishedTutorials()
  return (
    <div className="doc-layout">
      <Sidebar tutorials={tutorials} />
      <main className="doc">
        <h1>Tutorial</h1>
        {tutorials.length === 0 && <p className="empty">Belum ada tutorial yang terbit.</p>}
        <ol className="index-list">
          {tutorials.map((tutorial) => (
            <li key={tutorial.id}>
              <span className="toc-number">{tutorial.number}</span>
              <div>
                <Link href={`/tutorial/${tutorial.slug}`}>{tutorial.title}</Link>
                {tutorial.summary && <p>{tutorial.summary}</p>}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  )
}
