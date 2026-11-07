'use client'

import { useEffect, useRef } from 'react'

// Link yang dibagikan bisa menuju tutorial ke-50: daftar harus langsung memperlihatkan posisinya.
export default function TocScroll({ activeId, children }) {
  const box = useRef(null)

  useEffect(() => {
    const list = box.current
    function reveal() {
      const item = [...list.querySelectorAll('[aria-current]')].pop()
      if (!item) return
      const area = list.getBoundingClientRect()
      const { top, bottom } = item.getBoundingClientRect()
      if (top < area.top || bottom > area.bottom) list.scrollTop += top - area.top - area.height / 2
    }
    reveal()
    // Di HP daftar terlipat, jadi posisinya baru bisa dihitung setelah dibuka.
    const details = list.closest('details')
    details?.addEventListener('toggle', reveal)
    return () => details?.removeEventListener('toggle', reveal)
  }, [activeId])

  return <div ref={box} className="toc-scroll">{children}</div>
}
