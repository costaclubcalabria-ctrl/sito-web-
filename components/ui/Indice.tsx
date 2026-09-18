import { indice } from '@/lib/format'

/** Il numerale d'indice del prodotto (01, 02...) — DESIGN.md §1.3. Decorativo. */
export function Indice({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-numeric
      className={`font-display text-index font-bold text-ink-soft/30 ${className}`}
    >
      {indice(n)}
    </span>
  )
}
