import Link from 'next/link'
import TocScroll from '@/components/TocScroll'
import { CATEGORY_LABELS } from '@/lib/content'
import { MAX_QUERY } from '@/lib/search'
import { sectionPath } from '@/lib/seo'

// Form biasa: halaman hasil tetap jalan tanpa JavaScript.
function SearchForm({ query }) {
  return (
    <form action="/cari" role="search" className="search-form">
      <input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={MAX_QUERY}
        placeholder="Cari tutorial, command, kode"
        aria-label="Cari di semua tutorial"
        enterKeyHint="search"
      />
      <button type="submit">Cari</button>
    </form>
  )
}

function Contents({ tutorials, active, activeSection }) {
  return Object.entries(CATEGORY_LABELS).map(([category, label]) => {
    const items = tutorials.filter((tutorial) => tutorial.category === category)
    if (!items.length) return null
    return (
      <section key={category}>
        <h2>{label}</h2>
        <ol>
          {items.map((tutorial) => (
            <li key={tutorial.id}>
              <Link
                href={sectionPath(tutorial.slug, 0)}
                aria-current={tutorial.id === active?.id ? 'true' : undefined}
              >
                <span className="toc-number">{tutorial.number}</span>
                {tutorial.title}
              </Link>
              {tutorial.id === active?.id && (
                <ol className="toc-sections">
                  {active.sections.map((section, index) => (
                    <li key={section.id}>
                      <Link
                        href={sectionPath(active.slug, index)}
                        aria-current={section.id === activeSection?.id ? 'page' : undefined}
                      >
                        <span className="toc-number">{section.number}</span>
                        {section.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </section>
    )
  })
}

// Dua salinan: HP memakai <details> supaya bisa dilipat tanpa JavaScript, CSS menampilkan salah satunya.
export default function TutorialSidebar({ tutorials, active, activeSection, query = '' }) {
  return (
    <>
      <div className="search-mobile"><SearchForm query={query} /></div>
      <details className="toc toc-mobile">
        <summary>Daftar isi</summary>
        <TocScroll activeId={activeSection?.id ?? active?.id}>
          <Contents tutorials={tutorials} active={active} activeSection={activeSection} />
        </TocScroll>
      </details>
      <aside className="toc toc-desktop" aria-label="Daftar tutorial">
        <SearchForm query={query} />
        <TocScroll activeId={activeSection?.id ?? active?.id}>
          <Contents tutorials={tutorials} active={active} activeSection={activeSection} />
        </TocScroll>
      </aside>
    </>
  )
}
