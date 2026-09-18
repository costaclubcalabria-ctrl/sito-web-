import Link from 'next/link'
import { t } from '@/i18n'

/**
 * Scorciatoie da tastiera, primi elementi focusabili della pagina.
 *
 * Il secondo link non è solo accessibilità: DESIGN.md §6.1 lo prescrive anche
 * come scelta di conversione. Chi vuole comprare e basta non deve subire 600vh
 * di regia per arrivare ai prodotti.
 */
export function SkipLinks() {
  return (
    <div className="absolute top-0 left-0 z-50">
      <Link
        href="#contenuto"
        className="sr-only rounded-full bg-ink px-5 py-3 text-sm font-medium text-sky-top focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:whitespace-nowrap"
      >
        {t.nav.saltaAlContenuto}
      </Link>
      <Link
        href="/catalogo"
        className="sr-only rounded-full bg-ink px-5 py-3 text-sm font-medium text-sky-top focus:not-sr-only focus:absolute focus:top-4 focus:left-56 focus:whitespace-nowrap"
      >
        {t.nav.saltaAlCatalogo}
      </Link>
    </div>
  )
}
