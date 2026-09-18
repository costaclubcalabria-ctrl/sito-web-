import type { Metadata } from 'next'
import Link from 'next/link'
import { CATEGORIES } from '@/data/categories'
import { getProducts, prezzoMinimoCent } from '@/data/products'
import { Prezzo } from '@/components/ui/Prezzo'
import { Titolo } from '@/components/ui/Titolo'
import { giorniLavorativi } from '@/lib/format'
import { t } from '@/i18n'
import type { CategoryId } from '@/types/catalog'

export const metadata: Metadata = {
  title: t.catalogo.titolo,
  description: 'Tutti gli oggetti pronti da spedire: decor, illuminazione, scrittoio e regali personalizzati.',
  alternates: { canonical: '/catalogo' },
}

/**
 * Catalogo. Fase 2 aggiungerà l'anteprima 3D all'hover e la scena filtrabile;
 * il filtro per categoria è già qui e funziona **senza JavaScript**, perché è
 * fatto di link e non di stato client.
 */
export default async function Catalogo({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const valida = CATEGORIES.find((c) => c.id === categoria)?.id as CategoryId | undefined

  const prodotti = valida ? getProducts().filter((p) => p.categoria === valida) : getProducts()

  return (
    <div className="content-grid pt-40 pb-28 sm:pt-52">
      <p className="spec mb-6">{t.brand.posizionamento}</p>
      <Titolo as="h1" testo={t.catalogo.titolo} className="text-display-l text-ink" />

      <nav aria-label={t.catalogo.filtraPer} className="mt-10 flex flex-wrap gap-2">
        <FiltroLink href="/catalogo" attivo={!valida}>
          {t.catalogo.tutti}
        </FiltroLink>
        {CATEGORIES.map((c) => (
          <FiltroLink key={c.id} href={`/catalogo?categoria=${c.id}`} attivo={valida === c.id}>
            {c.nome}
          </FiltroLink>
        ))}
      </nav>

      {prodotti.length === 0 ? (
        <p className="mt-16 text-ink-soft">{t.catalogo.vuoto}</p>
      ) : (
        <ul className="mt-14 grid gap-px overflow-hidden rounded-[24px] border border-glass-line bg-glass-line sm:grid-cols-2 lg:grid-cols-3">
          {prodotti.map((p) => (
            <li key={p.slug} className="bg-sky-top/60 backdrop-blur-xl">
              <Link
                href={`/prodotti/${p.slug}`}
                className="group flex h-full flex-col justify-between gap-8 p-7 transition-colors duration-200 hover:bg-sky-mid/50"
              >
                <div>
                  <p className="spec">
                    {p.disponibileSubito ? t.prodotto.disponibileSubito : t.prodotto.suMisura}
                  </p>
                  <h2 className="mt-3 font-display text-title-m font-semibold text-ink">{p.nome}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{p.sottotitolo}</p>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <Prezzo
                    cent={prezzoMinimoCent(p)}
                    da={p.varianti.length > 1}
                    className="text-ink transition-colors group-hover:text-accent"
                  />
                  <span className="spec text-right">{giorniLavorativi(p.tempiProduzioneGiorni)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FiltroLink({ href, attivo, children }: { href: string; attivo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={attivo ? 'page' : undefined}
      className={
        'inline-flex min-h-11 items-center rounded-full border px-5 text-sm transition-colors duration-200 ' +
        (attivo
          ? 'border-transparent bg-ink text-sky-top'
          : 'border-glass-line bg-glass text-ink-soft hover:text-ink')
      }
    >
      {children}
    </Link>
  )
}
