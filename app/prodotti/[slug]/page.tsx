import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, getProducts, prezzoMinimoCent } from '@/data/products'
import { getMaterial } from '@/data/materials'
import { getCategory } from '@/data/categories'
import { Prezzo } from '@/components/ui/Prezzo'
import { SpecList } from '@/components/ui/SpecList'
import { Indice } from '@/components/ui/Indice'
import { PillLink } from '@/components/ui/Pill'
import { dimensioni, giorniLavorativi } from '@/lib/format'
import { assoluto, jsonLdProdotto } from '@/lib/seo'
import { t } from '@/i18n'

/** Le 10 schede sono statiche: generarle a build time costa nulla e serve tutto. */
export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = getProduct(slug)
  if (!p) return { title: t.errori.prodottoNonTrovato }

  return {
    title: `${p.nome} — ${p.sottotitolo}`,
    description: p.descrizione.slice(0, 160),
    alternates: { canonical: `/prodotti/${p.slug}` },
    openGraph: {
      title: `${p.nome} — ${t.brand.nome}`,
      description: p.descrizione.slice(0, 200),
      url: assoluto(`/prodotti/${p.slug}`),
      type: 'website',
    },
  }
}

/**
 * Scheda prodotto.
 *
 * Fase 1: tutto il contenuto, renderizzato lato server. Il viewer 3D
 * orbitabile, la capsula di vetro e il cambio materiale dal vivo arrivano in
 * Fase 2 — e si innestano **sopra** questa pagina senza sostituirla, perché il
 * testo deve restare nel DOM comunque (DESIGN.md §8).
 */
export default async function PaginaProdotto({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProduct(slug)
  if (!p) notFound()

  const categoria = getCategory(p.categoria)
  const materiali = p.materiali.map(getMaterial)
  const variante = p.varianti[0]

  return (
    <article className="content-grid pt-40 pb-28 sm:pt-52">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProdotto(p)) }}
      />

      <nav aria-label="Percorso" className="spec mb-8">
        <Link href="/catalogo" className="transition-colors hover:text-ink">
          {t.catalogo.titolo}
        </Link>
        <span className="mx-2 text-ink-muted">/</span>
        <Link href={`/catalogo?categoria=${p.categoria}`} className="transition-colors hover:text-ink">
          {categoria.nome}
        </Link>
      </nav>

      <div className="grid gap-14 lg:grid-cols-[1fr_26rem]">
        <div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="spec">{p.disponibileSubito ? t.prodotto.disponibileSubito : t.prodotto.suMisura}</p>
              <h1 className="mt-3 text-display-l font-semibold text-ink">{p.nome}</h1>
              <p className="mt-2 text-body-l text-ink-soft">{p.sottotitolo}</p>
            </div>
            <Indice n={p.ordine} />
          </div>

          <p className="measure mt-10 text-body-l text-ink-soft">{p.descrizione}</p>

          <h2 className="spec mt-14 mb-5">{t.prodotto.specifiche}</h2>
          <SpecList specs={p.specifiche} />

          <h2 className="spec mt-12 mb-5">{t.prodotto.variante}</h2>
          <ul className="space-y-2">
            {p.varianti.map((v) => (
              <li
                key={v.id}
                className="glass flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <span className="text-ink">{v.nome}</span>
                <span className="spec">{dimensioni(v.dimensioniMm)}</span>
                <Prezzo cent={v.prezzoCent} className="text-ink" />
              </li>
            ))}
          </ul>

          <h2 className="spec mt-12 mb-5">{t.prodotto.materiale}</h2>
          <ul className="space-y-4">
            {materiali.map((m) => (
              <li key={m.id} className="glass p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-ink">{m.nome}</h3>
                  {m.sovrapprezzoCent > 0 && (
                    <Prezzo cent={m.sovrapprezzoCent} className="spec text-accent" />
                  )}
                </div>
                <p className="mt-2 text-sm text-ink-soft">{m.descrizione}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label={t.prodotto.colore}>
                  {m.colori.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 text-xs text-ink-soft">
                      <span
                        aria-hidden="true"
                        className="inline-block size-4 rounded-full border border-glass-line"
                        style={{ background: c.hex }}
                      />
                      {c.nome}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {/* Il pannello d'acquisto. In Fase 3 diventa interattivo (variante,
            materiale, quantità, aggiungi al carrello). Oggi è già completo come
            informazione: è quello che conta per la SEO e per il fallback. */}
        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <div className="glass-strong p-7">
            <p className="spec">{t.prodotto.da}</p>
            <Prezzo cent={prezzoMinimoCent(p)} className="mt-2 block text-display-l text-ink" />

            <dl className="mt-8 space-y-3">
              <Riga etichetta={t.prodotto.dimensioni} valore={variante ? dimensioni(variante.dimensioniMm) : '—'} />
              <Riga etichetta={t.prodotto.peso} valore={variante ? `${variante.pesoG} g` : '—'} />
              <Riga etichetta={t.prodotto.produzione} valore={giorniLavorativi(p.tempiProduzioneGiorni)} />
            </dl>

            <div className="mt-8">
              {/* Nessun pulsante finto: il carrello arriva in Fase 3, e fino ad
                  allora la CTA porta dove qualcosa succede davvero. */}
              <PillLink href="/su-richiesta" className="w-full">
                {t.suRichiesta.cta}
              </PillLink>
            </div>

            {!p.disponibileSubito && (
              <p className="mt-6 border-t border-glass-line pt-5 text-xs text-ink-muted">
                Prodotto realizzato su misura. Ai beni personalizzati non si applica il diritto di recesso
                (art. 59 Codice del Consumo).
              </p>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}

function Riga({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-glass-line pb-3">
      <dt className="spec">{etichetta}</dt>
      <dd className="spec text-right text-ink">{valore}</dd>
    </div>
  )
}
