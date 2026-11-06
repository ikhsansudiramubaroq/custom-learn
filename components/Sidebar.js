import Link from 'next/link'
import { CATEGORY_LABELS } from '@/lib/content'

function Contents({ tutorials, active }) {
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
                href={`/tutorial/${tutorial.slug}`}
                aria-current={tutorial.id === active?.id ? 'page' : undefined}
              >
                <span className="toc-number">{tutorial.number}</span>
                {tutorial.title}
              </Link>
              {tutorial.id === active?.id && (
                <ol className="toc-sections">
                  {active.sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#s-${section.id}`}>
                        <span className="toc-number">{section.number}</span>
                        {section.title}
                      </a>
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
export default function Sidebar({ tutorials, active }) {
  return (
    <>
      <details className="toc toc-mobile">
        <summary>Daftar isi</summary>
        <Contents tutorials={tutorials} active={active} />
      </details>
      <aside className="toc toc-desktop" aria-label="Daftar tutorial">
        <Contents tutorials={tutorials} active={active} />
      </aside>
    </>
  )
}
