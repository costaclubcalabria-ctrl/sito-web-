import Link from 'next/link'
import { Logo } from './Logo'
import { t, interpola } from '@/i18n'
import { SHIPPING } from '@/data/shipping'
import { euro } from '@/lib/format'
import { CATEGORIES } from '@/data/categories'

const LEGALI = [
  { href: '/legale/privacy', label: t.footer.privacy },
  { href: '/legale/cookie', label: t.footer.cookie },
  { href: '/legale/termini', label: t.footer.termini },
  { href: '/legale/recesso', label: t.footer.recesso },
] as const

export function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-glass-line bg-sky-top/70 backdrop-blur-xl">
      <div className="content-grid py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="text-xl" />
            <p className="emphasis mt-4 text-body-l text-ink-soft">{t.brand.payoff}</p>
            <p className="mt-6 max-w-xs text-sm text-ink-soft">
              {interpola(t.footer.spedizione, {
                costo: euro(SHIPPING.costoCent),
                soglia: euro(SHIPPING.sogliaGratuitaCent),
              })}
            </p>
          </div>

          <nav aria-label={t.footer.navigazione}>
            <h2 className="spec mb-4">{t.catalogo.titolo}</h2>
            <ul className="space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalogo?categoria=${c.id}`}
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.legale}>
            <h2 className="spec mb-4">{t.footer.legale}</h2>
            <ul className="space-y-2">
              {LEGALI.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="spec mb-4">{t.footer.contatti}</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/contatti" className="text-sm text-ink-soft transition-colors hover:text-ink">
                  {t.nav.contatti}
                </Link>
              </li>
              <li>
                <Link href="/su-richiesta" className="text-sm text-ink-soft transition-colors hover:text-ink">
                  {t.nav.suRichiesta}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ⚠️ SEGNAPOSTO — ragione sociale, P.IVA e sede legale sono obbligatorie
            per legge su un sito di vendita. Da sostituire prima del lancio. */}
        <div className="mt-14 flex flex-col gap-2 border-t border-glass-line pt-8 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
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
