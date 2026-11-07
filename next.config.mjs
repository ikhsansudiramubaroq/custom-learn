/** @type {import('next').NextConfig} */
export default {
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
}
