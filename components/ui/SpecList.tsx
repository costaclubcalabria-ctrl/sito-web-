import type { Spec } from '@/types/catalog'

/**
 * Colonne di micro-testo tecnico in maiuscolo — DESIGN.md §1.3.
 * Sono dati, non promesse: etichetta a sinistra, valore a destra, niente aggettivi.
 */
export function SpecList({
  specs,
  colonne = 2,
  className = '',
}: {
  specs: readonly Spec[]
  /** Due colonne in pagina prodotto, una nei pannelli stretti della home. */
  colonne?: 1 | 2
  className?: string
}) {
  return (
    <dl className={`grid gap-x-6 gap-y-2 ${colonne === 2 ? 'sm:grid-cols-2' : ''} ${className}`}>
      {specs.map((s) => (
        <div key={s.etichetta} className="flex items-baseline justify-between gap-3 border-b border-glass-line pb-2">
          <dt className="spec shrink-0">{s.etichetta}</dt>
          <dd className="spec text-right text-ink">{s.valore}</dd>
        </div>
      ))}
    </dl>
  )
}
