'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { createSaver } from '@/lib/autosave'

// Lewat fetch, bukan Server Action: Next.js membuang Server Action yang sedang berjalan
// saat pindah halaman, sehingga hasilnya tidak pernah diketahui.
async function post(kind, id, form) {
  const body = new FormData(form)
  body.set('kind', kind)
  body.set('id', id)
  const response = await fetch('/api/autosave', { method: 'POST', body }).catch(() => null)
  if (response?.ok) return
  const reply = await response?.json().catch(() => null)
  throw new Error(reply?.error ?? 'Tidak tersambung ke server.')
}

export default function AutoSaveForm({ kind, id, refresh = false, children, ...props }) {
  const router = useRouter()
  const form = useRef(null)
  const saver = useRef(null)

  useEffect(() => {
    const element = form.current
    const current = createSaver({
      key: `${kind}-${id}`,
      isValid: () => element.checkValidity(),
      send: async () => {
        await post(kind, id, element)
        if (refresh) router.refresh()
      },
    })
    saver.current = current
    return () => current.stop()
  }, [kind, id, refresh, router])

  return (
    <form
      {...props}
      ref={form}
      onChange={() => saver.current?.change()}
      onBlur={() => saver.current?.flush()}
      onKeyDown={(event) => {
        // Tanpa ini, Enter menekan tombol pertama di form, yaitu tombol urutan atau hapus.
        if (event.key === 'Enter' && event.target.matches('input')) {
          event.preventDefault()
          saver.current?.flush()
        }
      }}
    >
      {children}
    </form>
  )
}
