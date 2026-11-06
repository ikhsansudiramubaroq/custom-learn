import { IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'
import Link from 'next/link'
import { profile } from '@/lib/profile'
import './globals.css'

const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' })

export const metadata = {
  title: { default: `${profile.name}: catatan kerja`, template: `%s · ${profile.name}` },
  description: profile.bio,
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="site-name">{profile.name}</Link>
          <nav aria-label="Utama">
            <Link href="/">Portfolio</Link>
            <Link href="/tutorial">Tutorial</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
