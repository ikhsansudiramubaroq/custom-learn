import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="doc doc-narrow">
      <h1>Halaman tidak ditemukan</h1>
      <p><Link href="/tutorial">Kembali ke daftar tutorial</Link></p>
    </main>
  )
}
