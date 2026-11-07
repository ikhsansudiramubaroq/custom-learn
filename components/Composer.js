'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { addBlock } from '@/app/studio/actions'
import { report } from '@/lib/autosave'
import { isHttpUrl } from '@/lib/validate'

const TYPES = [['text', 'Teks'], ['command', 'Command'], ['code', 'Code'], ['link', 'Link']]
const LABEL_HINTS = { code: 'Bahasa, contoh: nginx', link: 'Teks link, opsional' }

export default function Composer({ sectionId }) {
  const router = useRouter()
  const [type, setType] = useState('text')
  const [content, setContent] = useState('')
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const typeBeforeLink = useRef(null)
  const draftKey = `composer-${sectionId}`
  const hasDraft = Boolean(content.trim())

  // Kotak tulis belum menjadi blok, jadi isinya dititipkan di browser supaya tidak hilang saat pindah halaman.
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey))
      if (draft) {
        setType(draft.type)
        setContent(draft.content)
        setLabel(draft.label)
      }
    } catch {}
  }, [draftKey])

  useEffect(() => {
    report(draftKey, hasDraft ? 'draft' : null)
    try {
      if (hasDraft) localStorage.setItem(draftKey, JSON.stringify({ type, content, label }))
      else localStorage.removeItem(draftKey)
    } catch {}
    return () => report(draftKey, null)
  }, [draftKey, hasDraft, type, content, label])

  async function upload(files) {
    setBusy(true)
    setError('')
    for (const file of files) {
      const body = new FormData()
      body.set('file', file)
      body.set('section_id', sectionId)
      const response = await fetch('/api/upload', { method: 'POST', body }).catch(() => null)
      if (!response?.ok) {
        const reply = await response?.json().catch(() => null)
        setError(reply?.error ?? 'Foto gagal diunggah.')
        break
      }
    }
    setBusy(false)
    router.refresh()
  }

  function handlePaste(event) {
    const text = event.clipboardData.getData('text/plain')
    const images = [...event.clipboardData.files].filter((file) => file.type.startsWith('image/'))
    // Word dan Excel menaruh teks dan gambar sekaligus. Teks diutamakan karena itu yang dimaksud.
    if (!text && images.length) {
      event.preventDefault()
      upload(images)
    } else if (!content && type !== 'link' && isHttpUrl(text.trim())) {
      typeBeforeLink.current = type
      setType('link')
    }
  }

  async function save() {
    if (!content.trim() || busy) return
    setBusy(true)
    setError('')
    const form = new FormData()
    form.set('type', type)
    form.set('content', content)
    form.set('label', label)
    try {
      await addBlock(sectionId, form)
      setContent('')
      setLabel('')
      if (typeBeforeLink.current) setType(typeBeforeLink.current)
      typeBeforeLink.current = null
    } catch {
      setError('Gagal menyimpan, isian tidak hilang. Periksa lalu coba lagi.')
    }
    setBusy(false)
  }

  return (
    <div className="composer">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onPaste={handlePaste}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            save()
          }
        }}
        rows={3}
        spellCheck={type === 'text'}
        className={type === 'command' || type === 'code' ? 'mono' : undefined}
        placeholder="Paste screenshot, command, code, atau link di sini"
        aria-label="Isi blok baru"
      />
      {LABEL_HINTS[type] && (
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          maxLength={255}
          placeholder={LABEL_HINTS[type]}
          aria-label={LABEL_HINTS[type]}
        />
      )}
      <div className="composer-bar">
        <div role="radiogroup" aria-label="Jenis blok" className="type-picker">
          {TYPES.map(([value, name]) => (
            <label key={value}>
              <input
                type="radio"
                name={`type-${sectionId}`}
                checked={type === value}
                onChange={() => setType(value)}
              />
              <span>{name}</span>
            </label>
          ))}
        </div>
        <div className="row-actions">
          <label className="file-button">
            Pilih foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(event) => {
                upload([...event.target.files])
                event.target.value = ''
              }}
            />
          </label>
          <button type="button" className="primary" onClick={save} disabled={busy || !content.trim()}>
            Tambah <kbd>Ctrl+Enter</kbd>
          </button>
        </div>
      </div>
      <p role="status" className={error ? 'form-error' : 'meta'}>{error || (busy ? 'Menyimpan...' : hasDraft ? 'Belum menjadi blok, tekan Tambah.' : '')}</p>
    </div>
  )
}
