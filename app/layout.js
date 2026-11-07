import { IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'
import Link from 'next/link'
import { profile } from '@/lib/profile'
import { siteUrl } from '@/lib/site'
import './globals.css'

const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' })

export async function generateMetadata() {
  return {
    metadataBase: new URL(await siteUrl()),
    title: { default: `${profile.name} | Portfolio Linux dan Programming`, template: `%s | ${profile.name}` },
    description: `Portfolio ${profile.name}. ${profile.bio}`,
    authors: [{ name: profile.name }],
    creator: profile.name,
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <header className="site-header">
          <Link prefetch={false} href="/" className="site-name">{profile.name}</Link>
          <nav aria-label="Utama">
            <Link prefetch={false} href="/">Portfolio</Link>
            <Link prefetch={false} href="/tutorial">Tutorial</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
