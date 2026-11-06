export const metadata = { title: 'Studio', robots: { index: false, follow: false } }

export default function StudioLayout({ children }) {
  return <main className="studio">{children}</main>
}
