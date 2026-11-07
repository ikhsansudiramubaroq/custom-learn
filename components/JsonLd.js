// Isi berupa teks anak script. Tanda < di-escape supaya isi tutorial tidak bisa menutup tag script.
export default function JsonLd({ data }) {
  return <script type="application/ld+json">{JSON.stringify(data).replace(/</g, '\\u003c')}</script>
}
