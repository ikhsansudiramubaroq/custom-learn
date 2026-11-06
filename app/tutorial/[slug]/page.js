import { notFound } from 'next/navigation'
import Block from '@/components/Block'
import Sidebar from '@/components/Sidebar'
import { getPublishedTutorial, getPublishedTutorials } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tutorial = await getPublishedTutorial(slug)
  return tutorial ? { title: tutorial.title, description: tutorial.summary } : {}
}

export default async function TutorialPage({ params }) {
  const { slug } = await params
  const tutorial = await getPublishedTutorial(slug)
  if (!tutorial) notFound()
  const tutorials = await getPublishedTutorials()

  return (
    <div className="doc-layout">
      <Sidebar tutorials={tutorials} active={tutorial} />
      <main className="doc">
        <header className="doc-header">
          <p className="doc-number">Tutorial {tutorial.number}</p>
          <h1>{tutorial.title}</h1>
          {tutorial.summary && <p className="doc-summary">{tutorial.summary}</p>}
        </header>
        {tutorial.sections.map((section) => (
          <section key={section.id} id={`s-${section.id}`} className="doc-section">
            <h2>
              <span className="section-number">{section.number}</span>
              {section.title}
            </h2>
            <div className="section-body">
              {section.blocks.map((block) => <Block key={block.id} block={block} />)}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
