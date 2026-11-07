import Link from 'next/link'
import { notFound } from 'next/navigation'
import Block from '@/components/Block'
import TutorialSidebar from '@/components/TutorialSidebar'
import { getPublishedTutorial, getPublishedTutorials } from '@/lib/content'
import { profile } from '@/lib/profile'
import { describeSection, sectionPath, sectionTitle } from '@/lib/seo'

export const dynamic = 'force-dynamic'

// Tanpa nomor berarti sub judul pertama, supaya link portfolio tetap pendek.
async function load(params) {
  const { slug, part } = await params
  const tutorial = await getPublishedTutorial(slug)
  if (!tutorial) return null
  const index = part ? (part.length === 1 && /^[1-9]\d*$/.test(part[0]) ? Number(part[0]) - 1 : -1) : 0
  const section = tutorial.sections[index]
  return part && !section ? null : { tutorial, section, index }
}

export async function generateMetadata({ params }) {
  const page = await load(params)
  if (!page) return {}
  const { tutorial, section, index } = page
  const title = sectionTitle(tutorial, section, index)
  const description = describeSection(tutorial, section, index)
  const canonical = sectionPath(tutorial.slug, index)
  const image = section?.blocks.find((block) => block.type === 'image')?.content
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      siteName: profile.name,
      locale: 'id_ID',
      title,
      description,
      url: canonical,
      images: image ? [`/uploads/${image}`] : undefined,
    },
    twitter: { card: image ? 'summary_large_image' : 'summary' },
  }
}

function PagerLink({ tutorial, index, label, className }) {
  const section = tutorial.sections[index]
  if (!section) return null
  return (
    <Link href={sectionPath(tutorial.slug, index)} className={className}>
      <span>{label}</span>
      {section.number} {section.title}
    </Link>
  )
}

export default async function TutorialPage({ params }) {
  const page = await load(params)
  if (!page) notFound()
  const { tutorial, section, index } = page
  const tutorials = await getPublishedTutorials()

  return (
    <div className="doc-layout">
      <TutorialSidebar tutorials={tutorials} active={tutorial} activeSection={section} />
      <main className="doc">
        <header className="doc-header">
          <p className="doc-number">Tutorial {tutorial.number}</p>
          <h1>{tutorial.title}</h1>
          {index === 0 && tutorial.summary && <p className="doc-summary">{tutorial.summary}</p>}
        </header>
        {section && (
          <section className="doc-section">
            <h2>
              <span className="section-number">{section.number}</span>
              {section.title}
            </h2>
            <div className="section-body">
              {section.blocks.map((block) => <Block key={block.id} block={block} />)}
            </div>
          </section>
        )}
        {tutorial.sections.length > 1 && (
          <nav className="pager" aria-label="Sub judul">
            <PagerLink tutorial={tutorial} index={index - 1} label="Sebelumnya" />
            <PagerLink tutorial={tutorial} index={index + 1} label="Berikutnya" className="pager-next" />
          </nav>
        )}
      </main>
    </div>
  )
}
