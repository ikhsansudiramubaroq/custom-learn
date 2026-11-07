// Isi publik jarang berubah, jadi hasil query disimpan di memori sampai Studio mengubah sesuatu.
// shortcut: memori satu proses dan tidak tahu perubahan langsung di database, jalankan satu instance dan restart setelah mengubah database manual.
globalThis.contentMemo ??= new Map()

export function remember(key, load) {
  const memo = globalThis.contentMemo
  if (!memo.has(key)) {
    memo.set(key, load().catch((error) => {
      memo.delete(key)
      throw error
    }))
  }
  return memo.get(key)
}

// Dipanggil setelah data tersimpan, supaya pembacaan yang sedang berjalan tidak menyimpan isi lama.
export function forgetContent() {
  globalThis.contentMemo.clear()
}
