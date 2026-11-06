'use client'

import { useRef, useState } from 'react'
import { updateMarks } from '@/app/studio/actions'
import { MAX_MARKS, markStyle } from '@/lib/validate'

const percent = (value) => Math.round(Math.min(100, Math.max(0, value)) * 100) / 100

function toBox(from, to) {
  return [
    Math.min(from[0], to[0]),
    Math.min(from[1], to[1]),
    percent(Math.abs(to[0] - from[0])),
    percent(Math.abs(to[1] - from[1])),
  ]
}

export default function MarkEditor({ blockId, name, alt, initialMarks }) {
  const stage = useRef(null)
  const start = useRef(null)
  const [marks, setMarks] = useState(initialMarks)
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState('')

  function pointAt(event) {
    const area = stage.current.getBoundingClientRect()
    return [
      percent(((event.clientX - area.left) / area.width) * 100),
      percent(((event.clientY - area.top) / area.height) * 100),
    ]
  }

  async function save(next) {
    setMarks(next)
    setStatus('Menyimpan...')
    try {
      await updateMarks(blockId, JSON.stringify(next))
      setStatus('Tersimpan')
    } catch {
      setStatus('Gagal menyimpan kotak. Coba lagi.')
    }
  }

  function handleDown(event) {
    if (event.target.closest('button')) return
    if (marks.length >= MAX_MARKS) {
      setStatus(`Maksimal ${MAX_MARKS} kotak.`)
      return
    }
    event.preventDefault()
    stage.current.setPointerCapture(event.pointerId)
    start.current = pointAt(event)
  }

  function handleMove(event) {
    if (start.current) setDraft(toBox(start.current, pointAt(event)))
  }

  function handleUp(event) {
    if (!start.current) return
    const box = toBox(start.current, pointAt(event))
    start.current = null
    setDraft(null)
    // Klik tanpa seret tidak membuat kotak.
    if (box[2] >= 1 && box[3] >= 1) save([...marks, box])
  }

  return (
    <div>
      <div
        ref={stage}
        className="marked-image mark-stage"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={() => {
          start.current = null
          setDraft(null)
        }}
      >
        <img src={`/uploads/${name}`} alt={alt} draggable={false} />
        {marks.map((box, index) => (
          <span key={box.join()} className="mark" style={markStyle(box)}>
            <button
              type="button"
              aria-label={`Hapus kotak ${index + 1}`}
              onClick={() => save(marks.filter((item) => item !== box))}
            >
              ×
            </button>
          </span>
        ))}
        {draft && <span className="mark" style={markStyle(draft)} />}
      </div>
      <p role="status" className="meta mark-hint">{status || 'Seret di gambar untuk memberi kotak merah.'}</p>
    </div>
  )
}
