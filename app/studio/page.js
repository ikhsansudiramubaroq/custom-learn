import Link from 'next/link'
import { CATEGORY_LABELS, getAllTutorials } from '@/lib/content'
import { requireAdmin } from '@/lib/session'
import { createTutorial, logout, moveTutorial } from './actions'

export default async function StudioPage() {
  await requireAdmin()
  const tutorials = await getAllTutorials()

  return (
    <>
      <div className="studio-head">
        <h1>Studio</h1>
        <form action={logout}><button type="submit">Keluar</button></form>
      </div>

      <form action={createTutorial} className="row-form">
        <label className="grow">
          Tutorial baru
          <input name="title" required maxLength={200} />
        </label>
        <label>
          Kategori
          <select name="category">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="submit">Buat</button>
      </form>

      {tutorials.length === 0 && <p className="empty">Belum ada tutorial.</p>}
      <ol className="studio-list">
        {tutorials.map((tutorial) => (
          <li key={tutorial.id}>
            <Link href={`/studio/${tutorial.id}`}>{tutorial.title}</Link>
            <span className="meta">
              {CATEGORY_LABELS[tutorial.category]} · {tutorial.status === 'published' ? 'Terbit' : 'Draft'}
              {tutorial.in_portfolio ? ' · Portfolio' : ''}
            </span>
            <form className="row-actions">
              <button formAction={moveTutorial.bind(null, tutorial.id, -1)} aria-label={`Naikkan ${tutorial.title}`}>↑</button>
              <button formAction={moveTutorial.bind(null, tutorial.id, 1)} aria-label={`Turunkan ${tutorial.title}`}>↓</button>
            </form>
          </li>
        ))}
      </ol>
    </>
  )
}
