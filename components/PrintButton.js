'use client'

export default function PrintButton() {
  return <button type="button" className="pdf-print" onClick={() => window.print()}>Simpan PDF</button>
}
