import { euro } from '@/lib/format'

/**
 * Prezzo. Sempre `tabular-nums`: le cifre non devono ballare quando cambia la
 * variante (DESIGN.md §5.2). Il valore arriva in centesimi interi, sempre.
 */
export function Prezzo({
  cent,
  da = false,
  className = '',
}: {
  cent: number
  /** Mostra "da 29,00 €" per la card di catalogo. */
  da?: boolean
  className?: string
}) {
  return (
    <span data-numeric className={className}>
      {da && <span className="text-ink-soft">da </span>}
      {euro(cent)}
    </span>
  )
}
