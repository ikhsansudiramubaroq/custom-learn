'use client'

import { useEffect, useRef } from 'react'

// Link yang dibagikan bisa menuju tutorial ke-50: daftar harus langsung memperlihatkan posisinya.
export default function TocScroll({ activeId, toggleId, children }) {
  const box = useRef(null)

  useEffect(() => {
    const list = box.current
    const toggle = document.getElementById(toggleId)
    function reveal() {
      const item = [...list.querySelectorAll('[aria-current]')].pop()
      if (!item) return
      const area = list.getBoundingClientRect()
      const { top, bottom } = item.getBoundingClientRect()
      if (top < area.top || bottom > area.bottom) list.scrollTop += top - area.top - area.height / 2
    }
    // Di HP daftar menutup isi halaman, jadi dilipat lagi setelah pindah halaman tanpa reload.
    toggle.checked = false
    reveal()
    toggle.addEventListener('change', reveal)
    return () => toggle.removeEventListener('change', reveal)
  }, [activeId, toggleId])

  return <div ref={box} className="toc-scroll">{children}</div>
}
