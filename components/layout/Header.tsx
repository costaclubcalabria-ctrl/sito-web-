import Link from 'next/link'
import { Logo } from './Logo'
import { MenuMobile } from './MenuMobile'
import { t } from '@/i18n'

/**
 * L'intestazione: una **lastra di vetro che galleggia**.
 *
 * Non tocca i bordi e non è attaccata alla pagina: sta sopra la scena, prende
 * la luce da ciò che ha dietro e ha la sua ombra. È il primo pezzo di vetro che
 * si vede, e dà la misura di tutto il resto.
 *
 * Server Component: è solo link, non serve JavaScript per funzionare.
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
          className="vetro pointer-events-auto flex items-center gap-2 !rounded-full py-2 pr-2 pl-5 sm:gap-8 sm:pl-7"
        >
          <Link href="/" className="shrink-0 py-2" aria-label={`${t.brand.nome} — ${t.nav.home}`}>
            <Logo />
          </Link>

          <ul className="ml-auto hidden items-center gap-7 sm:flex">
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
              qualcosa succede davvero: nessun pulsante finto in barra.
              Colore dell'ugello perché è l'azione che produce un oggetto. */}
          <Link
            href="/su-richiesta"
            className="ml-auto inline-flex min-h-11 items-center rounded-full bg-ugello px-4 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-px sm:ml-0 sm:px-5"
          >
            {t.nav.suRichiesta}
          </Link>

          <MenuMobile voci={VOCI} />
        </nav>
      </div>
    </header>
  )
}
