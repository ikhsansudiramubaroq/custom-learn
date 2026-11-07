import { imageProps } from '@/lib/image'
import { markStyle } from '@/lib/validate'
import CopyButton from './CopyButton'

export default function Block({ block, eager = false }) {
  const { type, content, label } = block
  const id = `b-${block.id}`

  if (type === 'text') return <p id={id} className="block-text">{content}</p>

  if (type === 'image') {
    return (
      <figure id={id} className="block-image">
        <div className="marked-image">
          <img
            // Versi PDF memakai foto asli supaya tetap tajam saat dicetak.
            {...(eager ? { src: `/uploads/${content}` } : imageProps(content, 1600, 900, '(max-width: 52rem) 100vw, 70vw'))}
            alt={`${label || 'Screenshot langkah ini'}${block.marks.length ? ', dengan bagian penting ditandai kotak merah' : ''}`}
            // Foto lazy belum termuat saat dicetak, jadi halaman PDF memuat semuanya.
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
          {block.marks.map((box) => <span key={box.join()} className="mark" style={markStyle(box)} />)}
        </div>
        {label && <figcaption>{label}</figcaption>}
      </figure>
    )
  }

  if (type === 'link') {
    return (
      <p id={id} className="block-link">
        <a href={content} target="_blank" rel="noopener noreferrer">{label || content}</a>
      </p>
    )
  }

  return (
    <div id={id} className={`block-${type}`}>
      <div className="block-bar">
        <span>{type === 'command' ? 'terminal' : label || 'kode'}</span>
        <CopyButton text={content} />
      </div>
      <pre tabIndex={0}>
        <code>{type === 'command' ? <CommandLines content={content} /> : content}</code>
      </pre>
    </div>
  )
}

function CommandLines({ content }) {
  const lines = content.split('\n')
  return lines.map((line, index) => (
    // Baris setelah "\" adalah lanjutan perintah yang sama, jadi tanpa tanda $.
    <span key={index} className={lines[index - 1]?.endsWith('\\') ? undefined : 'command-line'}>
      {line}
      {index < lines.length - 1 && '\n'}
    </span>
  ))
}
