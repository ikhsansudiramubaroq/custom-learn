// shortcut: 'unsafe-inline' dibutuhkan script bawaan Next.js tanpa nonce, pakai nonce lewat proxy jika ada isi dari pihak lain.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Tanpa includeSubDomains, supaya subdomain lain di server yang sama tidak ikut dipaksa HTTPS.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
]

/** @type {import('next').NextConfig} */
export default {
  poweredByHeader: false,
  // Kompresi dikerjakan Cloudflare, jadi CPU server tidak dipakai dua kali.
  compress: false,
  images: {
    localPatterns: [{ pathname: '/uploads/**' }],
    // Daftar pendek membatasi jumlah salinan di disk dan kerja CPU yang bisa dipicu dari URL.
    deviceSizes: [640, 1080, 1600],
    imageSizes: [352],
    qualities: [75],
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    const production = process.env.NODE_ENV === 'production'
    // Mode dev Next.js butuh eval dan websocket, jadi CSP hanya untuk produksi.
    const headers = production ? [...securityHeaders, { key: 'Content-Security-Policy', value: contentSecurityPolicy }] : securityHeaders
    return [{ source: '/:path*', headers }]
  },
}
