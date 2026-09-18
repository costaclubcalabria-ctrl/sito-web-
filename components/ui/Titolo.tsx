import { spezzaEnfasi } from '@/i18n'

type Livello = 'h1' | 'h2' | 'h3' | 'p'

/**
 * Titolo con le parole che contano **cavate a strati**.
 *
 * Il testo arriva dal dizionario nella forma `Oggetti che nascono
 * **strato dopo strato**`. Le parole tra asterischi ricevono lo stesso
 * trattamento del logotipo: righe orizzontali da uno strato, ritagliate nel
 * pieno delle lettere. Marchio e titolo parlano la stessa lingua.
 *
 * Una sola enfasi per titolo: due enfasi significano zero enfasi.
 * Dove `background-clip: text` non è supportato il testo resta pieno — mai
 * invisibile.
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
      {enfasi && <span className="strati-testo">{enfasi}</span>}
      {dopo}
    </Tag>
  )
}
