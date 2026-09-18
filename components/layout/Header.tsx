import Link from 'next/link'
import { Logo } from './Logo'
import { MenuMobile } from './MenuMobile'
import { t } from '@/i18n'

/**
 * L'intestazione.
 *
 * Una barra piena larghezza con una **cucitura** sotto, non un'isola
 * fluttuante: in una pagina fatta di strati sovrapposti, un elemento che
 * galleggia contraddice il sistema. Questo è il primo strato, e sta attaccato
 * al bordo.
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
    <header
      className="sticky top-0 z-30 backdrop-blur-[2px]"
      style={{ background: 'color-mix(in srgb, var(--bg-corrente) 88%, transparent)' }}
    >
      <div className="content-grid">
        <nav
          aria-label={t.nav.home}
          className="flex items-center gap-3 border-b py-3 sm:gap-8"
          style={{ borderColor: 'var(--linea-corrente)' }}
        >
          <Link href="/" className="shrink-0 py-1" aria-label={`${t.brand.nome} — ${t.nav.home}`}>
            <Logo />
          </Link>

          {/* La profondità corrente, sempre visibile. Su desktop la colonna
              laterale la mostra per esteso; qui è il numero e basta. */}
          <span className="quota ml-auto hidden tabular-nums sm:inline lg:hidden" data-numeric>
            <span data-profondita-testo>000</span> mm
          </span>

          <ul className="ml-auto hidden items-center gap-7 sm:flex lg:ml-8">
            {VOCI.map((v) => (
              <li key={v.href}>
                <Link
                  href={v.href}
                  className="text-sm transition-colors duration-200"
                  style={{ color: 'var(--ink-corrente-soft)' }}
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
            className="ml-auto inline-flex min-h-11 items-center rounded-[var(--radius-strato)] bg-ugello px-4 text-sm font-medium text-paper transition-transform duration-200 hover:translate-x-px hover:translate-y-px sm:ml-0 sm:px-5"
          >
            {t.nav.suRichiesta}
          </Link>

          <MenuMobile voci={VOCI} />
        </nav>
      </div>
    </header>
  )
}
