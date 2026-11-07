import { isHttpUrl } from './validate.js'

export function field(formData, name, max) {
  return String(formData.get(name) ?? '').trim().slice(0, max)
}

export function required(formData, name, max) {
  const value = field(formData, name, max)
  if (!value) throw new Error(`${name} wajib diisi`)
  return value
}

export function categoryId(formData) {
  const id = Number(formData.get('category_id'))
  if (!Number.isInteger(id) || id <= 0) throw new Error('Kategori tidak dikenal')
  return id
}

// Form mengirim baris baru sebagai \r\n. Selain itu isi blok disimpan persis seperti di-paste.
export function blockContent(type, formData) {
  const content = String(formData.get('content') ?? '').replace(/\r\n/g, '\n')
  if (!content.trim()) throw new Error('Isi blok wajib diisi')
  if (type === 'link' && !isHttpUrl(content.trim())) throw new Error('Link harus http atau https')
  return type === 'link' ? content.trim() : content
}
