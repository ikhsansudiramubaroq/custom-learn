'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { getIdleStatus, getStatus, retryAll, subscribe } from '@/lib/autosave'

const UNSAVED = ['failed', 'invalid', 'saving', 'dirty']

function text({ state, message, savedAt }) {
  if (state === 'failed' || state === 'invalid') return message
  if (state === 'saving' || state === 'dirty') return 'Menyimpan...'
  const saved = savedAt
    ? `Semua tersimpan ${savedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    : 'Perubahan tersimpan otomatis'
  return state === 'draft' ? `${saved}. Kotak tulis belum ditambahkan.` : saved
}

export default function SaveStatus() {
  const status = useSyncExternalStore(subscribe, getStatus, getIdleStatus)
  const unsaved = UNSAVED.includes(status.state)

  useEffect(() => {
    if (!unsaved) return
    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [unsaved])

  return (
    <p role="status" className="save-status" data-state={status.state}>
      {text(status)}
      {status.state === 'failed' && <button type="button" onClick={retryAll}>Coba lagi</button>}
    </p>
  )
}
