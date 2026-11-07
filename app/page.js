import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { getPortfolio } from '@/lib/content'
import { imageProps } from '@/lib/image'
import { profile } from '@/lib/profile'
import { homeSchema, sectionPath } from '@/lib/seo'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: profile.name,
    locale: 'id_ID',
    title: `${profile.name} | Portfolio Linux dan Programming`,
    description: `Portfolio ${profile.name}. ${profile.bio}`,
    url: '/',
  },
}

export default async function PortfolioPage() {
  const projects = await getPortfolio()
  const base = await siteUrl()

  return (
    <main className="portfolio">
      <JsonLd data={homeSchema(base)} />
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
                <td className="log-number">{String(index + 1).padStart(2, '0')}</td>
                <td>
                  <Link prefetch={false} href={sectionPath(project.slug, 0)}>{project.title}</Link>
                  {project.outcome && <p>{project.outcome}</p>}
                  <Link prefetch={false} href={`/tutorial/${project.slug}/pdf`} className="log-pdf">Lihat PDF</Link>
                </td>
                <td className="log-meta">{project.tools}</td>
                <td className="log-meta">{project.finished_on?.slice(0, 7)}</td>
                <td>
                  {project.image && <img {...imageProps(project.image, 352, 220)} alt="" loading="lazy" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="log-more"><Link prefetch={false} href="/tutorial">Semua tutorial</Link></p>
    </main>
  )
}
