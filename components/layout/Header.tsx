import Link from 'next/link'
import { Logo } from './Logo'
import { MenuMobile } from './MenuMobile'
import { t } from '@/i18n'

/**
 * Barra di navigazione fluttuante: non tocca mai i bordi del viewport
 * (DESIGN.md §1.3, reference C). Server Component: è solo link, non serve
 * JavaScript per funzionare.
 */
const VOCI = [
  { href: '/catalogo', label: t.nav.catalogo },
  { href: '/studio', label: t.nav.studio },
  { href: '/contatti', label: t.nav.contatti },
] as const

export function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 pt-3 sm:pt-5">
      <div className="content-grid">
        <nav
          aria-label={t.nav.home}
          className="glass pointer-events-auto relative flex items-center gap-2 rounded-full py-2 pr-2 pl-5 sm:gap-6 sm:pl-6"
        >
          <Link href="/" className="shrink-0 py-2" aria-label={`${t.brand.nome} — ${t.nav.home}`}>
            <Logo />
          </Link>

          <ul className="ml-auto hidden items-center gap-6 sm:flex">
            {VOCI.map((v) => (
              <li key={v.href}>
                <Link
                  href={v.href}
                  className="text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
                >
                  {v.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Il carrello arriva in Fase 3. Finché non esiste, la CTA porta dove
              qualcosa succede davvero: nessun pulsante finto in barra. */}
          <Link
            href="/su-richiesta"
            className="ml-auto inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-sky-top transition-colors duration-200 hover:bg-white sm:ml-0 sm:px-5"
          >
            {t.nav.suRichiesta}
          </Link>

          {/* Su schermi stretti le voci di nav sono nascoste: senza questo menu
              il sito sarebbe navigabile solo dal footer. */}
          <MenuMobile voci={VOCI} />
        </nav>
      </div>
    </header>
  )
}
