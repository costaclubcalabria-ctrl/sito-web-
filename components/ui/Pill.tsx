import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * I controlli.
 *
 * Rettangoli, non pillole: un oggetto stampato ha spigoli, e tutto il sistema
 * di forme del sito discende da quello. L'unico raggio ammesso è uno strato.
 *
 * - `primaria`: pieno inchiostro (o carta sugli strati profondi). Una per schermata.
 * - `secondaria`: solo contorno.
 * - `ugello`: il colore della testina. Solo per l'azione che produce qualcosa —
 *   chiedere un preventivo, avviare una lavorazione. Mai per "vedi tutti".
 * - `fantasma`: testo con linea sotto.
 */
export type PillVariant = 'primaria' | 'secondaria' | 'ugello' | 'fantasma'

const BASE =
  'group/ctrl inline-flex items-center justify-center gap-2 font-medium ' +
  'transition-[background-color,color,border-color,box-shadow,translate] duration-200 ' +
  'min-h-11 px-6 text-[0.9375rem] leading-none select-none rounded-[var(--radius-strato)] ' +
  'disabled:opacity-50 disabled:pointer-events-none'

const VARIANTI: Record<PillVariant, string> = {
  // L'ombra secca a due strati e il suo annullarsi alla pressione: il controllo
  // si "appoggia" e si "posa". Nessuna transizione di scala, nessun rimbalzo.
  primaria:
    'bg-[var(--ink-corrente)] text-[var(--bg-corrente)] ' +
    'shadow-[var(--strato)_var(--strato)_0_var(--linea-corrente)] ' +
    'hover:translate-x-px hover:translate-y-px hover:shadow-none',
  secondaria:
    'border border-[var(--linea-corrente)] text-[var(--ink-corrente)] ' +
    'hover:bg-[var(--ink-corrente)] hover:text-[var(--bg-corrente)]',
  ugello:
    'bg-ugello text-paper shadow-[var(--strato)_var(--strato)_0_rgb(23_22_26_/_0.22)] ' +
    'hover:translate-x-px hover:translate-y-px hover:shadow-none',
  fantasma:
    'px-0 text-[var(--ink-corrente-soft)] underline decoration-[var(--linea-corrente)] ' +
    'underline-offset-4 hover:text-[var(--ink-corrente)] hover:decoration-[var(--color-ugello)]',
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
