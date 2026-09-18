import { spezzaEnfasi } from '@/i18n'

type Livello = 'h1' | 'h2' | 'h3' | 'p'

/**
 * Titolo con una sola parola in corsivo Instrument Serif.
 * Il testo arriva dal dizionario nella forma `Oggetti che nascono **strato dopo strato**`.
 * DESIGN.md §5.2: una enfasi per titolo, mai due.
 */
export function Titolo({
  testo,
  as: Tag = 'h2',
  className = '',
  id,
}: {
  testo: string
  as?: Livello
  className?: string
  id?: string
}) {
  const { prima, enfasi, dopo } = spezzaEnfasi(testo)

  return (
    <Tag id={id} className={className}>
      {prima}
      {enfasi && <em className="emphasis">{enfasi}</em>}
      {dopo}
    </Tag>
  )
}
