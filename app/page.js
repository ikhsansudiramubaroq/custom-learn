import Link from 'next/link'
import { getPortfolio } from '@/lib/content'
import { profile } from '@/lib/profile'
import { sectionPath } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata = { alternates: { canonical: '/' } }

export default async function PortfolioPage() {
  const projects = await getPortfolio()

  return (
    <main className="portfolio">
      <header className="intro">
        <h1>{profile.name}</h1>
        <p>{profile.bio}</p>
        <ul>
          {profile.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
            </li>
          ))}
        </ul>
      </header>

      <h2 className="log-title">Log kerja</h2>
      {projects.length === 0 ? (
        <p className="empty">Belum ada pekerjaan yang ditampilkan.</p>
      ) : (
        <table className="log">
          <thead>
            <tr>
              <th scope="col">No</th>
              <th scope="col">Pekerjaan</th>
              <th scope="col">Tools</th>
              <th scope="col">Selesai</th>
              <th scope="col"><span className="sr-only">Gambar</span></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.slug}>
                <td className="log-number">{String(projects.length - index).padStart(2, '0')}</td>
                <td>
                  <Link href={sectionPath(project.slug, 0)}>{project.title}</Link>
                  {project.outcome && <p>{project.outcome}</p>}
                </td>
                <td className="log-meta">{project.tools}</td>
                <td className="log-meta">{project.finished_on?.slice(0, 7)}</td>
                <td>
                  {project.image && <img src={`/uploads/${project.image}`} alt="" loading="lazy" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="log-more"><Link href="/tutorial">Semua tutorial</Link></p>
    </main>
  )
}
