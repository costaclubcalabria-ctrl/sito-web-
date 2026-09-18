import Link from 'next/link'
import { getFeatured, getProducts, prezzoMinimoCent } from '@/data/products'
import { getColor } from '@/data/materials'
import { Fiume } from '@/components/home/Fiume'
import { Hero } from '@/components/home/Hero'
import { ProductPanel } from '@/components/home/ProductPanel'
import { IndiceFiume } from '@/components/layout/IndiceFiume'
import { Titolo } from '@/components/ui/Titolo'
import { PillLink } from '@/components/ui/Pill'
import { Prezzo } from '@/components/ui/Prezzo'
import { giorniLavorativi, indice } from '@/lib/format'
import { t } from '@/i18n'

/** I pezzi che passano nel fiume. Gli altri stanno in catalogo. */
const IN_FIUME = 6

/**
 * La home è **uno scorrimento continuo**.
 *
 * Il fiume di pezzi occupa la parte alta: i pezzi scorrono davanti a una camera
 * fissa e ogni scheda di vetro scivola insieme al proprio pezzo. Sotto, le
 * sezioni si susseguono sullo stesso fondo neutro, senza cambi di scena — la
 * pagina non ha "schermate", ha una corsa.
 */
export default function Home() {
  const fiume = getFeatured(IN_FIUME)
  const tutti = getProducts()

  return (
    <>
      {/* Senza JavaScript le schede resterebbero a opacity 0: queste regole le
          riportano nel flusso. È un criterio di accettazione — con JS
          disattivato nomi e prezzi dei prodotti devono essere visibili. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fiume]{height:auto !important}
              [data-fiume] .fiume-viewport{position:static;height:auto;overflow:visible}
              [data-fiume] .fiume-binario{position:static;display:grid;gap:2rem;transform:none !important;
                padding-block:clamp(3rem,10vh,7rem)}
              [data-fiume] .fiume-hero{position:static;width:auto;padding-bottom:4rem}
              [data-fiume] [data-scheda]{position:static;width:auto;max-width:34rem;
                opacity:1 !important;visibility:visible !important;transform:none !important;
                pointer-events:auto !important}
            `,
          }}
        />
      </noscript>

      <div data-fiume>
        <Fiume slugs={fiume.map((p) => p.slug)} hero={<Hero />}>
          {fiume.map((p, i) => (
            <ProductPanel key={p.slug} prodotto={p} indice={i} />
          ))}
        </Fiume>
      </div>

      <IndiceFiume totale={tutti.length} />

      {/* ------------------------------------------------------- catalogo -- */}
      <section className="content-grid relative py-24 sm:py-32" aria-labelledby="titolo-catalogo">
        <p className="quota">{t.sequenza.aFuoco}</p>

        <Titolo as="h2" id="titolo-catalogo" testo={t.sequenza.titoloFinale} className="mt-6 text-display-l" />
        <p className="measure mt-5 text-body-l text-ink-soft">{t.sequenza.sottotitoloFinale}</p>

        {/*
          Il catalogo come **distinta**, non come griglia di card: una riga per
          pezzo, incolonnata. Ogni riga porta la pastiglia del colore con cui il
          pezzo compare in scena — è l'unico colore della lista, e viene
          dall'oggetto.
        */}
        <ul className="mt-14 border-t border-ink/10">
          {tutti.map((p) => {
            const tinta = getColor(p.modello.colore.materiale, p.modello.colore.colore)
            return (
              <li key={p.slug} className="border-b border-ink/10">
                <Link
                  href={`/prodotti/${p.slug}`}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5 transition-[padding] duration-200 sm:grid-cols-[3.5rem_1fr_9rem_7rem] sm:gap-x-8 sm:hover:pl-3"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="block size-3 shrink-0 rounded-full shadow-[inset_0_1px_1px_rgb(255_255_255/0.5),0_1px_2px_rgb(0_0_0/0.18)]"
                      style={{ background: tinta.hex }}
                    />
                    <span className="quota" data-numeric>
                      {indice(p.ordine)}
                    </span>
                  </span>

                  <span className="col-start-2">
                    <span className="font-display text-title-m font-bold">{p.nome}</span>
                    <span className="ml-3 text-sm text-ink-soft">{p.sottotitolo}</span>
                  </span>

                  <span className="col-start-2 quota sm:col-start-3">
                    {p.disponibileSubito ? giorniLavorativi(p.tempiProduzioneGiorni) : t.prodotto.suMisura}
                  </span>

                  <Prezzo
                    cent={prezzoMinimoCent(p)}
                    da={p.varianti.length > 1}
                    className="col-start-3 row-start-1 text-right font-display font-bold sm:col-start-4 sm:row-start-auto"
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-12">
          <PillLink href="/catalogo">{t.sequenza.tuttiIProdotti}</PillLink>
        </div>
      </section>

      {/* ---------------------------------------------------- su richiesta -- */}
      <section className="content-grid relative py-20 sm:py-28" aria-labelledby="titolo-su-richiesta">
        <div className="vetro-scheda overflow-hidden">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:p-16">
            <div>
              <p className="quota" style={{ color: 'var(--color-ugello)' }}>
                {t.suRichiesta.etichetta}
              </p>
              <Titolo
                as="h2"
                id="titolo-su-richiesta"
                testo={t.suRichiesta.titolo}
                className="mt-5 text-display-l"
              />
              <p className="measure mt-6 text-body-l text-ink-soft">{t.suRichiesta.testo}</p>
              <p className="measure mt-4 text-sm text-ink-muted">{t.suRichiesta.nota}</p>
              <div className="mt-10">
                <PillLink href="/su-richiesta" variant="ugello">
                  {t.suRichiesta.cta}
                </PillLink>
              </div>
            </div>

            {/* I formati accettati, come una specifica. */}
            <dl className="self-start border-t border-ink/10">
              {[
                ['Formati', 'STL · 3MF · OBJ · STEP'],
                ['Anche solo', 'Foto, schizzo, disegno'],
                ['Peso massimo', '50 MB per file'],
                ['Risposta', 'Entro 48 ore'],
                ['Preventivo', 'Gratuito, non impegnativo'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 border-b border-ink/10 py-3">
                  <dt className="quota">{k}</dt>
                  <dd className="quota text-right text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- processo -- */}
      <section className="content-grid relative py-20 sm:py-28" aria-labelledby="titolo-processo">
        <p className="quota">Il processo</p>
        <Titolo
          as="h2"
          id="titolo-processo"
          testo="Tre passaggi, **nessuna sorpresa**"
          className="mt-6 text-display-l"
        />

        <ol className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            [
              '01',
              'Il file',
              'Riceviamo il tuo modello o lo disegniamo noi. Verifichiamo spessori, sporgenze e orientamento prima di accendere la macchina.',
            ],
            [
              '02',
              'La stampa',
              'Strati da 0,16 mm, o 0,025 in resina dove serve il dettaglio. Il tempo dipende dall’altezza, non dal volume.',
            ],
            [
              '03',
              'La finitura',
              'Rimozione dei supporti a mano, controllo su ogni pezzo, imballo. Quello che arriva è quello che hai visto.',
            ],
          ].map(([n, titolo, testo]) => (
            <li key={n} className="vetro-scheda p-7">
              <span className="quota" data-numeric style={{ color: 'var(--color-ugello)' }}>
                {n}
              </span>
              <h3 className="mt-4 font-display text-title-m font-bold">{titolo}</h3>
              <p className="mt-3 text-sm text-ink-soft">{testo}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
