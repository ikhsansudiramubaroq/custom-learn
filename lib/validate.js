export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const IMAGE_NAME = /^[a-f0-9]{32}\.(jpg|png|webp|gif)$/

export function slugify(title) {
  const slug = title
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 100)
    .replace(/^-+|-+$/g, '')
  return slug || 'tutorial'
}

export function isHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

// Jenis file ditentukan dari byte awal, karena nama dan tipe kiriman browser bisa dipalsukan.
export function detectImageType(bytes) {
  const starts = (text, at = 0) => bytes.subarray(at, at + text.length).toString('latin1') === text
  if (starts('\xFF\xD8\xFF')) return 'jpg'
  if (starts('\x89PNG\r\n\x1A\n')) return 'png'
  if (starts('GIF87a') || starts('GIF89a')) return 'gif'
  if (starts('RIFF') && starts('WEBP', 8)) return 'webp'
  return null
}
