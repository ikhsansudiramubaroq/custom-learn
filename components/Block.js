import { markStyle } from '@/lib/validate'
import CopyButton from './CopyButton'

export default function Block({ block }) {
  const { type, content, label } = block

  if (type === 'text') return <p className="block-text">{content}</p>

  if (type === 'image') {
    return (
      <figure className="block-image">
        <div className="marked-image">
          <img
            src={`/uploads/${content}`}
            alt={`${label || 'Screenshot langkah ini'}${block.marks.length ? ', dengan bagian penting ditandai kotak merah' : ''}`}
            loading="lazy"
          />
          {block.marks.map((box) => <span key={box.join()} className="mark" style={markStyle(box)} />)}
        </div>
        {label && <figcaption>{label}</figcaption>}
      </figure>
    )
  }

  if (type === 'link') {
    return (
      <p className="block-link">
        <a href={content} target="_blank" rel="noopener noreferrer">{label || content}</a>
      </p>
    )
  }

  return (
    <div className={`block-${type}`}>
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
