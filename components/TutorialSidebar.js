import Form from 'next/form'
import Link from 'next/link'
import TocScroll from '@/components/TocScroll'
import { MAX_QUERY } from '@/lib/search'
import { sectionPath } from '@/lib/seo'

// Pindah tanpa reload, dan tetap jalan sebagai form biasa kalau JavaScript mati.
function SearchForm({ query }) {
  return (
    <Form action="/cari" prefetch={false} role="search" className="search-form">
      <input
        key={query}
        type="search"
        name="q"
        defaultValue={query}
        maxLength={MAX_QUERY}
        placeholder="Cari tutorial, command, kode"
        aria-label="Cari di semua tutorial"
        enterKeyHint="search"
      />
      <button type="submit">Cari</button>
    </Form>
  )
}

function Contents({ tutorials, active, activeSection }) {
  return [...Map.groupBy(tutorials, (tutorial) => tutorial.category)].map(([category, items]) => {
    return (
      <section key={category}>
        <h2>{category}</h2>
        <ol>
          {items.map((tutorial) => (
            <li key={tutorial.id}>
              <Link prefetch={false}
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
                      <Link prefetch={false}
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

// Satu salinan untuk semua layar. Di HP daftarnya dilipat dengan checkbox, jadi tetap jalan tanpa JavaScript.
export default function TutorialSidebar({ tutorials, active, activeSection, query = '' }) {
  return (
    <aside className="toc" aria-label="Daftar tutorial">
      <SearchForm query={query} />
      <input type="checkbox" id="toc-toggle" className="toc-toggle" />
      <label htmlFor="toc-toggle" className="toc-label">Daftar isi</label>
      <TocScroll activeId={activeSection?.id ?? active?.id} toggleId="toc-toggle">
        <Contents tutorials={tutorials} active={active} activeSection={activeSection} />
      </TocScroll>
    </aside>
  )
}
