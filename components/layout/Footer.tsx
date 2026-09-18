import Link from 'next/link'
import { Logo } from './Logo'
import { t, interpola } from '@/i18n'
import { SHIPPING } from '@/data/shipping'
import { euro } from '@/lib/format'
import { CATEGORIES } from '@/data/categories'
import { PROFONDITA_MAX, strato } from '@/data/strati'

const LEGALI = [
  { href: '/legale/privacy', label: t.footer.privacy },
  { href: '/legale/cookie', label: t.footer.cookie },
  { href: '/legale/termini', label: t.footer.termini },
  { href: '/legale/recesso', label: t.footer.recesso },
] as const

/**
 * Il footer è **il basalto**: l'ultimo strato, il fondo della sezione.
 *
 * Non eredita il colore corrente come le altre sezioni: lo dichiara, perché è
 * la fine della carota e non un punto di passaggio. Da qui non si scende più.
 */
export function Footer() {
  const basalto = strato('basalto')

  return (
    <footer
      id="strato-basalto"
      className="relative z-10 mt-0"
      style={{ background: basalto.bg, color: 'var(--color-paper)' }}
    >
      <div className="content-grid py-16">
        <p className="flex items-center gap-4 font-mono text-quota tracking-[0.1em] uppercase" style={{ color: 'rgb(247 243 234 / 0.6)' }}>
          <span data-numeric className="tabular-nums">
            {PROFONDITA_MAX} mm
          </span>
          <span aria-hidden="true" className="block h-px w-8" style={{ background: 'rgb(247 243 234 / 0.3)' }} />
          <span>{basalto.nome}</span>
          <span className="ml-auto">Fondo della sezione</span>
        </p>

        <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="text-xl" />
            <p className="mt-5 font-display text-title-m font-bold">{t.brand.payoff}</p>
            <p className="mt-6 max-w-xs text-sm" style={{ color: 'rgb(247 243 234 / 0.7)' }}>
              {interpola(t.footer.spedizione, {
                costo: euro(SHIPPING.costoCent),
                soglia: euro(SHIPPING.sogliaGratuitaCent),
              })}
            </p>
          </div>

          <nav aria-label={t.footer.navigazione}>
            <h2 className="font-mono text-quota tracking-[0.1em] uppercase" style={{ color: 'rgb(247 243 234 / 0.5)' }}>
              {t.catalogo.titolo}
            </h2>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalogo?categoria=${c.id}`}
                    className="text-sm transition-colors hover:text-paper"
                    style={{ color: 'rgb(247 243 234 / 0.7)' }}
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.legale}>
            <h2 className="font-mono text-quota tracking-[0.1em] uppercase" style={{ color: 'rgb(247 243 234 / 0.5)' }}>
              {t.footer.legale}
            </h2>
            <ul className="mt-4 space-y-2">
              {LEGALI.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-paper"
                    style={{ color: 'rgb(247 243 234 / 0.7)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-quota tracking-[0.1em] uppercase" style={{ color: 'rgb(247 243 234 / 0.5)' }}>
              {t.footer.contatti}
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/contatti" className="text-sm transition-colors hover:text-paper" style={{ color: 'rgb(247 243 234 / 0.7)' }}>
                  {t.nav.contatti}
                </Link>
              </li>
              <li>
                <Link href="/su-richiesta" className="text-sm transition-colors hover:text-paper" style={{ color: 'rgb(247 243 234 / 0.7)' }}>
                  {t.nav.suRichiesta}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ⚠️ SEGNAPOSTO — ragione sociale, P.IVA e sede legale sono obbligatorie
            per legge su un sito di vendita. Da sostituire prima del lancio. */}
        <div
          className="mt-14 flex flex-col gap-2 border-t pt-8 font-mono text-[0.6875rem] sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'rgb(247 243 234 / 0.2)', color: 'rgb(247 243 234 / 0.5)' }}
        >
          <p>
            {t.footer.ragioneSociale} · {t.footer.piva} · {t.footer.sede}
          </p>
          <p>
            © {new Date().getFullYear()} {t.brand.nome}. {t.footer.diritti}.
          </p>
        </div>
      </div>
    </footer>
  )
}
