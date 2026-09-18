import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * La CTA a pillola (DESIGN.md §4.4). Tre livelli:
 * - primaria: bianca piena, l'elemento più luminoso dello schermo. UNA per viewport.
 * - secondaria: vetro con bordo.
 * - fantasma: solo testo, nessun contenitore.
 */
export type PillVariant = 'primaria' | 'secondaria' | 'fantasma'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'transition-[background-color,color,border-color,opacity] duration-200 ' +
  'min-h-11 px-6 text-[0.9375rem] leading-none select-none ' +
  'disabled:opacity-50 disabled:pointer-events-none'

const VARIANTI: Record<PillVariant, string> = {
  primaria: 'bg-ink text-sky-top hover:bg-white',
  secondaria: 'border border-glass-line bg-glass text-ink hover:bg-glass-strong backdrop-blur-xl',
  fantasma: 'px-0 text-ink-soft hover:text-ink underline underline-offset-4 decoration-ink-muted',
}

export function Pill({
  variant = 'primaria',
  className = '',
  children,
  ...props
}: ComponentProps<'button'> & { variant?: PillVariant; children: ReactNode }) {
  return (
    <button className={`${BASE} ${VARIANTI[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function PillLink({
  variant = 'primaria',
  className = '',
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: PillVariant; children: ReactNode }) {
  return (
    <Link className={`${BASE} ${VARIANTI[variant]} ${className}`} {...props}>
      {children}
    </Link>
  )
}
