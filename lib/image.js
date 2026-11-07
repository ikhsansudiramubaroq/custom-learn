import { getImageProps } from 'next/image'

// Foto asli tetap utuh. Pengunjung menerima salinan WEBP selebar yang dibutuhkan layarnya.
export function imageProps(name, width, height, sizes) {
  const { props } = getImageProps({ src: `/uploads/${name}`, alt: '', width, height, sizes })
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes }
}
