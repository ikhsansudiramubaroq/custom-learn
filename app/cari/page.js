import Link from 'next/link'
import TutorialSidebar from '@/components/TutorialSidebar'
import { getPublishedTutorials, searchTutorials } from '@/lib/content'
import { MAX_QUERY, MAX_RESULTS, MIN_QUERY } from '@/lib/search'
import { sectionPath } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pencarian', robots: { index: false, follow: true } }

function Highlight({ parts }) {
  return parts.map((part, index) => (index % 2 ? <mark key={index}>{part}</mark> : part))
}

function Rows({ rows }) {
  return (
    <ol className="results">
      {rows.map((row) => (
        <li key={row.key}>
          <Link prefetch={false} href={row.href}>
            <span className="result-kind">{row.kind}</span>
            <span className={row.mono ? 'result-text result-mono' : 'result-text'}>
              <Highlight parts={row.parts} />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams
  const query = String([q].flat()[0] ?? '').trim().slice(0, MAX_QUERY)
  const canSearch = query.length >= MIN_QUERY
  const [tutorials, found] = await Promise.all([
    getPublishedTutorials(),
    canSearch ? searchTutorials(query) : null,
  ])

  return (
    <div className="doc-layout">
      <TutorialSidebar tutorials={tutorials} query={query} />
      <main className="doc">
        <h1>Pencarian</h1>
        {!query && <p className="empty">Tulis kata yang dicari: judul, teks, command, atau kode.</p>}
        {query && !canSearch && <p className="empty">Tulis minimal {MIN_QUERY} karakter.</p>}
        {found && (
          <p className="search-count" role="status">
            {found.total === 0 ? 'Tidak ada hasil' : `${found.truncated ? `${MAX_RESULTS}+` : found.total} hasil`} untuk “{query}”
          </p>
        )}
        {found?.truncated && <p className="empty">Hanya {MAX_RESULTS} hasil pertama yang ditampilkan. Coba kata yang lebih spesifik.</p>}

        {found?.groups.map(({ tutorial, rows, sections }) => (
          <section key={tutorial.id} className="result-group">
            <h2>
              <span className="toc-number">{tutorial.number}</span>
              <Link prefetch={false} href={sectionPath(tutorial.slug, 0)}>{tutorial.title}</Link>
            </h2>
            {rows.length > 0 && <Rows rows={rows} />}
            {sections.map((section) => (
              <section key={section.id} className="result-section">
                <h3>
                  <span className="toc-number">{section.number}</span>
                  <Link prefetch={false} href={section.path}>{section.title}</Link>
                  <span className="result-total">{section.rows.length} hasil</span>
                </h3>
                <Rows rows={section.rows} />
              </section>
            ))}
          </section>
        ))}
      </main>
    </div>
  )
}
