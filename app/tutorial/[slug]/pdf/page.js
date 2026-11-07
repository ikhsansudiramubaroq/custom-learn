import Link from 'next/link'
import { notFound } from 'next/navigation'
import Block from '@/components/Block'
import PrintButton from '@/components/PrintButton'
import { getPublishedTutorial } from '@/lib/content'
import { sectionPath } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tutorial = await getPublishedTutorial(slug)
  if (!tutorial) return {}
  // Isinya sama dengan halaman tutorial, jadi tidak perlu diindeks mesin pencari.
  return { title: tutorial.title, description: tutorial.summary, robots: { index: false, follow: true } }
}

export default async function TutorialPdfPage({ params }) {
  const { slug } = await params
  const tutorial = await getPublishedTutorial(slug)
  if (!tutorial) notFound()

  return (
    <main className="pdf">
      <div className="pdf-bar">
        <Link href={sectionPath(tutorial.slug, 0)}>← Kembali ke tutorial</Link>
        <PrintButton />
      </div>
      <p className="pdf-hint">Pada jendela cetak, pilih tujuan “Simpan sebagai PDF”.</p>

      <header className="pdf-cover">
        <p className="doc-number">Tutorial {tutorial.number}</p>
        <h1>{tutorial.title}</h1>
        {tutorial.summary && <p className="doc-summary">{tutorial.summary}</p>}
        {(tutorial.outcome || tutorial.tools || tutorial.finished_on) && (
          <dl className="pdf-facts">
            {tutorial.outcome && <><dt>Hasil akhir</dt><dd>{tutorial.outcome}</dd></>}
            {tutorial.tools && <><dt>Tools</dt><dd>{tutorial.tools}</dd></>}
            {tutorial.finished_on && <><dt>Selesai</dt><dd>{tutorial.finished_on.slice(0, 7)}</dd></>}
          </dl>
        )}
      </header>

      {tutorial.sections.map((section) => (
        <section key={section.id} className="doc-section">
          <h2>
            <span className="section-number">{section.number}</span>
            {section.title}
          </h2>
          <div className="section-body">
            {section.blocks.map((block) => <Block key={block.id} block={block} eager />)}
          </div>
        </section>
      ))}
    </main>
  )
}
