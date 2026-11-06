'use client'

import { useEffect, useRef, useState } from 'react'

const SHOW_MS = 2000

export default function Flash({ value }) {
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    if (!value) return
    setMessage(value.slice(value.indexOf('|') + 1))
    // Cookie dibuang di sini supaya pesan tidak muncul lagi saat halaman dimuat ulang.
    document.cookie = 'flash=; Max-Age=0; path=/'
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), SHOW_MS)
  }, [value])

  return <div role="status" className="flash">{message}</div>
}
