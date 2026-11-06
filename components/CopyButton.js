'use client'

import { useState } from 'react'

export default function CopyButton({ text }) {
  const [status, setStatus] = useState('Salin')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('Tersalin')
    } catch {
      // Clipboard API hanya ada di HTTPS atau localhost.
      setStatus('Pilih teks lalu Ctrl+C')
    }
    setTimeout(() => setStatus('Salin'), 2000)
  }

  return (
    <button type="button" className="copy-button" onClick={copy} aria-live="polite">
      {status}
    </button>
  )
}
