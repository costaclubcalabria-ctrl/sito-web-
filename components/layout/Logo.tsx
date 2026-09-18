import { t } from '@/i18n'

/**
 * Il logotipo.
 *
 * Syne ExtraBold — un grotesque dalle proporzioni volutamente anomale, che non
 * si confonde con nessun altro carattere. Ma il carattere da solo non è ancora
 * un marchio: la firma sono le **linee di stampa dentro le lettere**.
 *
 * Non sono una decorazione sopra la parola: sono ritagliate nella parola con
 * `background-clip: text`, quindi esistono solo dove c'è inchiostro. È l'oggetto
 * stampato ridotto a cinque lettere — e al passaggio del mouse una linea ambra
 * le attraversa dal basso verso l'alto, come la testina che deposita uno strato.
 *
 * Il fallback conta: dove `background-clip: text` non è supportato, la parola
 * resta bianca piena (vedi `@supports` in `globals.css`). Un logotipo invisibile
 * sarebbe un difetto molto peggiore di un logotipo senza le sue righe.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <span className="logo-word">{t.brand.nome}</span>
    </span>
  )
}
