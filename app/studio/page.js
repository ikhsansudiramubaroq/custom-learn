import Link from 'next/link'
import AutoSaveForm from '@/components/AutoSaveForm'
import ConfirmButton from '@/components/ConfirmButton'
import SaveStatus from '@/components/SaveStatus'
import { getAllTutorials, getCategories } from '@/lib/content'
import { requireAdmin } from '@/lib/session'
import { addCategory, createTutorial, deleteCategory, logout, moveCategory, moveTutorial } from './actions'

export default async function StudioPage() {
  await requireAdmin()
  const [tutorials, categories] = await Promise.all([getAllTutorials(), getCategories()])

  return (
    <>
      <div className="studio-head">
        <h1>Studio</h1>
        <SaveStatus />
        <form action={logout}><button type="submit">Keluar</button></form>
      </div>

      {categories.length === 0 ? (
        <p className="empty">Buat kategori dulu di bawah, lalu tutorial pertama bisa dibuat.</p>
      ) : (
        <form action={createTutorial} className="row-form">
          <label className="grow">
            Tutorial baru
            <input name="title" required maxLength={200} />
          </label>
          <label>
            Kategori
            <select name="category_id">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <button type="submit">Buat</button>
        </form>
      )}

      {tutorials.length === 0 && <p className="empty">Belum ada tutorial.</p>}
      <ol className="studio-list">
        {tutorials.map((tutorial) => (
          <li key={tutorial.id}>
            <Link href={`/studio/${tutorial.id}`}>{tutorial.title}</Link>
            <span className="meta">
              {tutorial.category} · {tutorial.status === 'published' ? 'Terbit' : 'Draft'}
              {tutorial.in_portfolio ? ' · Portfolio' : ''}
            </span>
            <form className="row-actions">
              <button formAction={moveTutorial.bind(null, tutorial.id, -1)} aria-label={`Naikkan ${tutorial.title}`}>↑</button>
              <button formAction={moveTutorial.bind(null, tutorial.id, 1)} aria-label={`Turunkan ${tutorial.title}`}>↓</button>
            </form>
          </li>
        ))}
      </ol>

      <section className="studio-section">
        <h2>Kategori</h2>
        <form key={categories.length} action={addCategory} className="row-form">
          <label className="grow">
            Kategori baru
            <input name="name" required maxLength={60} placeholder="Web Server" />
          </label>
          <button type="submit">Tambah</button>
        </form>
        <ol className="studio-list">
          {categories.map((category) => (
            <li key={category.id}>
              <AutoSaveForm kind="category" id={category.id} refresh className="row-form category-row">
                <input name="name" defaultValue={category.name} required maxLength={60} aria-label={`Nama kategori ${category.name}`} />
                <span className="meta">{category.tutorial_count} tutorial</span>
                <div className="row-actions">
                  <button formAction={moveCategory.bind(null, category.id, -1)} formNoValidate aria-label={`Naikkan ${category.name}`}>↑</button>
                  <button formAction={moveCategory.bind(null, category.id, 1)} formNoValidate aria-label={`Turunkan ${category.name}`}>↓</button>
                  {category.tutorial_count === 0 && (
                    <ConfirmButton formAction={deleteCategory.bind(null, category.id)} message={`Hapus kategori "${category.name}"?`}>Hapus</ConfirmButton>
                  )}
                </div>
              </AutoSaveForm>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
