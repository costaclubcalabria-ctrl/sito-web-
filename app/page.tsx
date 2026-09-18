import Link from 'next/link'
import { getFeatured, getProducts } from '@/data/products'
import { HomeSequence } from '@/components/home/HomeSequence'
import { Hero } from '@/components/home/Hero'
import { ProductPanel } from '@/components/home/ProductPanel'
import { Titolo } from '@/components/ui/Titolo'
import { PillLink } from '@/components/ui/Pill'
import { Prezzo } from '@/components/ui/Prezzo'
import { prezzoMinimoCent } from '@/data/products'
import { t } from '@/i18n'

/** I prodotti che compaiono nella sequenza 3D. Gli altri stanno nel catalogo. */
const IN_SEQUENZA = 4

export default function Home() {
  const sequenza = getFeatured(IN_SEQUENZA)
  const tutti = getProducts()

  return (
    <>
      {/* Senza JavaScript i pannelli resterebbero a opacity 0: queste regole li
          rendono statici e leggibili. Criterio di accettazione della Fase 1 —
          con JS disattivato, nomi e prezzi dei prodotti devono essere visibili. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-sequenza]{height:auto !important}
              [data-sequenza] .sequenza-viewport{position:static;height:auto;overflow:visible}
              [data-sequenza] .sequenza-inner{display:block;padding-block:clamp(4rem,12vh,8rem)}
              [data-sequenza] .sequenza-hero{position:static;width:auto}
              [data-sequenza] [data-pannello]{position:static;width:auto;max-width:34rem;
                margin-block:clamp(2rem,6vh,4rem);opacity:1 !important;visibility:visible !important;
                transform:none !important;pointer-events:auto !important}
            `,
          }}
        />
      </noscript>

      <div data-sequenza>
        <HomeSequence slugs={sequenza.map((p) => p.slug)} hero={<Hero />}>
          {sequenza.map((p, i) => (
            <ProductPanel key={p.slug} prodotto={p} indice={i} />
          ))}
        </HomeSequence>
      </div>

      {/* Uscita dal 3D. Il contrasto con la scena è il punto: qui si parla,
          non si guarda (DESIGN.md §6.1, tappa 1.00). */}
      <section className="content-grid relative py-28 sm:py-40" aria-labelledby="titolo-catalogo">
        <p className="spec mb-6">{t.sequenza.aFuoco}</p>
        <Titolo as="h2" testo={t.sequenza.titoloFinale} className="text-display-l text-ink" />
        <p className="measure mt-6 text-body-l text-ink-soft">{t.sequenza.sottotitoloFinale}</p>

        {/* La lista completa, in DOM. È l'indice che Google legge e la pagina
            che resta usabile quando il 3D non c'è. */}
        <h3 id="titolo-catalogo" className="sr-only">
          {t.catalogo.titolo}
        </h3>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-[24px] border border-glass-line bg-glass-line sm:grid-cols-2 lg:grid-cols-3">
          {tutti.map((p) => (
            <li key={p.slug} className="bg-sky-top/60 backdrop-blur-xl">
              <Link
                href={`/prodotti/${p.slug}`}
                className="group flex h-full flex-col justify-between gap-6 p-6 transition-colors duration-200 hover:bg-sky-mid/50"
              >
                <div>
                  <p className="spec">
                    {p.disponibileSubito ? t.prodotto.disponibileSubito : t.prodotto.suMisura}
                  </p>
                  <h4 className="mt-3 font-display text-title-m font-semibold text-ink">{p.nome}</h4>
                  <p className="mt-1 text-sm text-ink-soft">{p.sottotitolo}</p>
                </div>
                <Prezzo
                  cent={prezzoMinimoCent(p)}
                  da={p.varianti.length > 1}
                  className="text-ink transition-colors group-hover:text-accent"
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <PillLink href="/catalogo">{t.sequenza.tuttiIProdotti}</PillLink>
        </div>
      </section>

      {/* Blocco "Su richiesta" — fondo pieno, tipografico, accento --hot.
          È l'unico punto del sito dove compare quel colore. */}
      <section className="content-grid relative py-28 sm:py-36" aria-labelledby="titolo-su-richiesta">
        <div className="glass-strong overflow-hidden p-8 sm:p-14">
          <p className="spec mb-6 text-hot">{t.suRichiesta.etichetta}</p>
          <Titolo
            as="h2"
            id="titolo-su-richiesta"
            testo={t.suRichiesta.titolo}
            className="text-display-l text-ink"
          />
          <p className="measure mt-6 text-body-l text-ink-soft">{t.suRichiesta.testo}</p>
          <p className="measure mt-4 text-sm text-ink-muted">{t.suRichiesta.nota}</p>
          <div className="mt-10">
            <PillLink href="/su-richiesta">{t.suRichiesta.cta}</PillLink>
          </div>
        </div>
      </section>
    </>
  )
}
