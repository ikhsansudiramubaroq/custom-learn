'use client'

export default function StudioError({ reset }) {
  return (
    <>
      <h1>Gagal menyimpan</h1>
      <p>Periksa isian lalu coba lagi.</p>
      <button type="button" onClick={reset}>Kembali</button>
    </>
  )
}
