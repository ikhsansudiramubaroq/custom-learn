import Link from 'next/link'
import { notFound } from 'next/navigation'
import AutoSaveForm from '@/components/AutoSaveForm'
import Composer from '@/components/Composer'
import ConfirmButton from '@/components/ConfirmButton'
import MarkEditor from '@/components/MarkEditor'
import SaveStatus from '@/components/SaveStatus'
import { getCategories, getTutorialForEdit } from '@/lib/content'
import { requireAdmin } from '@/lib/session'
import {
  addSection,
  deleteBlock,
  deleteSection,
  deleteTutorial,
  moveBlock,
  moveSection,
} from '../actions'

const BLOCK_LABELS = {
  text: 'Teks',
  image: 'Foto',
  link: 'Link',
  command: 'Command',
  code: 'Code',
}
const LABEL_HINTS = { image: 'Caption', link: 'Teks link', code: 'Bahasa' }

function BlockForm({ block }) {
  return (
    <AutoSaveForm kind="block" id={block.id} className="block-form">
      <span className="meta">{BLOCK_LABELS[block.type]}</span>
      {block.type === 'image' ? (
        <MarkEditor blockId={block.id} name={block.content} alt={block.label || 'Foto'} initialMarks={block.marks} />
      ) : (
        <textarea
          name="content"
          defaultValue={block.content}
          required
          rows={Math.min(block.content.split('\n').length + 1, 16)}
          spellCheck={block.type === 'text'}
          className={block.type === 'text' ? undefined : 'mono'}
          aria-label={`Isi ${BLOCK_LABELS[block.type]}`}
        />
      )}
      {LABEL_HINTS[block.type] && (
        <input name="label" defaultValue={block.label} maxLength={255} placeholder={LABEL_HINTS[block.type]} aria-label={LABEL_HINTS[block.type]} />
      )}
      <div className="row-actions">
        <button formAction={moveBlock.bind(null, block.id, -1)} formNoValidate aria-label="Naikkan blok">↑</button>
        <button formAction={moveBlock.bind(null, block.id, 1)} formNoValidate aria-label="Turunkan blok">↓</button>
        <ConfirmButton formAction={deleteBlock.bind(null, block.id)} message="Hapus blok ini?">Hapus</ConfirmButton>
      </div>
    </AutoSaveForm>
  )
}

export default async function EditTutorialPage({ params }) {
  await requireAdmin()
  const { id } = await params
  const [tutorial, categories] = await Promise.all([getTutorialForEdit(id), getCategories()])
  if (!tutorial) notFound()

  return (
    <>
      <div className="studio-bar">
        <Link href="/studio">← Studio</Link>
        <SaveStatus />
        {tutorial.status === 'published' && (
          <span className="row-actions">
            <Link href={`/tutorial/${tutorial.slug}`}>Halaman publik</Link>
            <Link href={`/tutorial/${tutorial.slug}/pdf`}>PDF</Link>
          </span>
        )}
      </div>

      <AutoSaveForm kind="tutorial" id={tutorial.id} refresh className="stack">
        <label>
          Judul
          <input name="title" defaultValue={tutorial.title} required maxLength={200} />
        </label>
        <label>
          Ringkasan
          <textarea name="summary" defaultValue={tutorial.summary} maxLength={500} rows={2} />
        </label>
        <div className="row-form">
          <label>
            Kategori
            <select name="category_id" defaultValue={tutorial.category_id}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={tutorial.status}>
              <option value="draft">Draft</option>
              <option value="published">Terbit</option>
            </select>
          </label>
        </div>

        <fieldset className="stack">
          <legend>Portfolio</legend>
          <label className="check">
            <input type="checkbox" name="in_portfolio" defaultChecked={Boolean(tutorial.in_portfolio)} />
            Tampilkan di portfolio
          </label>
          <label>
            Hasil akhir
            <input name="outcome" defaultValue={tutorial.outcome} maxLength={300} />
          </label>
          <div className="row-form">
            <label className="grow">
              Tools
              <input name="tools" defaultValue={tutorial.tools} maxLength={200} placeholder="Proxmox, Ubuntu, Apache" />
            </label>
            <label>
              Tanggal selesai
              <input type="date" name="finished_on" defaultValue={tutorial.finished_on ?? ''} />
            </label>
          </div>
        </fieldset>

        <div className="row-actions">
          <ConfirmButton formAction={deleteTutorial.bind(null, tutorial.id)} message={`Hapus "${tutorial.title}" beserta semua isi dan fotonya?`}>
            Hapus tutorial
          </ConfirmButton>
        </div>
      </AutoSaveForm>

      {tutorial.sections.map((section, index) => (
        <section key={section.id} className="studio-section">
          <AutoSaveForm kind="section" id={section.id} className="row-form">
            <label className="grow">
              Sub judul {index + 1}
              <input name="title" defaultValue={section.title} required maxLength={200} />
            </label>
            <div className="row-actions">
              <button formAction={moveSection.bind(null, section.id, -1)} formNoValidate aria-label="Naikkan sub judul">↑</button>
              <button formAction={moveSection.bind(null, section.id, 1)} formNoValidate aria-label="Turunkan sub judul">↓</button>
              <ConfirmButton formAction={deleteSection.bind(null, section.id)} message={`Hapus sub judul "${section.title}" beserta isinya?`}>
                Hapus
              </ConfirmButton>
            </div>
          </AutoSaveForm>
          {section.blocks.map((block) => <BlockForm key={block.id} block={block} />)}
          <Composer sectionId={section.id} />
        </section>
      ))}

      <form key={tutorial.sections.length} action={addSection.bind(null, tutorial.id)} className="row-form studio-section">
        <label className="grow">
          Sub judul baru
          <input name="title" required maxLength={200} />
        </label>
        <button type="submit">Tambah</button>
      </form>
    </>
  )
}
