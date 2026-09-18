import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * I controlli.
 *
 * Sono di vetro come il resto dell'interfaccia, tranne la primaria: quella è
 * piena, perché un'azione principale che si vede attraverso non è un'azione
 * principale.
 *
 * - `primaria`: inchiostro pieno. Una per schermata.
 * - `vetro`: lastra sottile con bordo speculare.
 * - `ugello`: il colore della testina. Solo per l'azione che produce qualcosa —
 *   chiedere un preventivo, avviare una lavorazione. Mai per "vedi tutti".
 * - `fantasma`: testo con linea sotto.
 */
export type PillVariant = 'primaria' | 'vetro' | 'ugello' | 'fantasma'

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium select-none ' +
  'min-h-11 px-6 text-[0.9375rem] leading-none rounded-full ' +
  'transition-[background-color,color,box-shadow,translate] duration-200 ' +
  'disabled:opacity-50 disabled:pointer-events-none'

const VARIANTI: Record<PillVariant, string> = {
  primaria:
    'bg-ink text-white shadow-[0_1px_2px_rgb(20_20_28/0.2),0_10px_22px_-10px_rgb(20_20_28/0.45)] ' +
    'hover:bg-carbone hover:-translate-y-px',
  vetro:
    'vetro !rounded-full text-ink hover:bg-white/60',
  ugello:
    'bg-ugello text-white shadow-[0_1px_2px_rgb(180_40_10/0.3),0_10px_22px_-10px_rgb(255_77_31/0.6)] ' +
    'hover:-translate-y-px hover:brightness-105',
  fantasma:
    'px-0 text-ink-soft underline decoration-ink-muted/50 underline-offset-4 ' +
    'hover:text-ink hover:decoration-ugello',
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
