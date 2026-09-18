import Link from 'next/link'
import { getFeatured, getProducts, prezzoMinimoCent } from '@/data/products'
import { STRATI, strato } from '@/data/strati'
import { HomeSequence } from '@/components/home/HomeSequence'
import { Hero } from '@/components/home/Hero'
import { ProductPanel } from '@/components/home/ProductPanel'
import { Titolo } from '@/components/ui/Titolo'
import { PillLink } from '@/components/ui/Pill'
import { Prezzo } from '@/components/ui/Prezzo'
import { giorniLavorativi, indice } from '@/lib/format'
import { t } from '@/i18n'

/** I pezzi che passano sulla linea. Gli altri stanno in catalogo. */
const IN_SEQUENZA = 4

/**
 * La home è una **sezione stratigrafica**: si comincia in superficie, nella
 * luce, e si scende attraverso materiali sempre più profondi.
 *
 * Ogni sezione dichiara il proprio strato con un `id` (`#strato-…`): sono gli
 * stessi ancoraggi a cui punta l'indicatore di profondità, che così è anche
 * navigazione.
 */
export default function Home() {
  const sequenza = getFeatured(IN_SEQUENZA)
  const tutti = getProducts()

  return (
    <>
      {/* Senza JavaScript le schede resterebbero a opacity 0 e il deposito a
          zero: queste regole le riportano nel flusso, già stampate. È un
          criterio di accettazione — con JS disattivato nomi e prezzi dei
          prodotti devono essere visibili. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-sequenza]{height:auto !important}
              [data-sequenza] .sequenza-viewport{position:static;height:auto;overflow:visible}
              [data-sequenza] .sequenza-inner{display:block;padding-block:clamp(4rem,12vh,8rem)}
              [data-sequenza] .sequenza-hero{position:static;width:auto;padding-bottom:0}
              [data-sequenza] [data-pannello]{position:static;width:auto;max-width:38rem;
                margin-block:clamp(2rem,6vh,4rem);opacity:1 !important;visibility:visible !important;
                transform:none !important;pointer-events:auto !important}
              .deposito{-webkit-mask-image:none !important;mask-image:none !important}
            `,
          }}
        />
      </noscript>

      {/* ------------------------------------------------- 000 mm · Gesso -- */}
      <span id="strato-gesso" className="sr-only" />

      {/*
        Gli ancoraggi degli strati sono **posizioni reali** nel documento, non
        etichette: `Stratigrafia.tsx` misura dove cadono e interpola il
        materiale fra due consecutivi. Metterli tutti in cima faceva partire la
        quota da 45 mm invece di 0 — quindi "sabbia" sta dove sabbia comincia
        davvero, a meta della sequenza.
      */}
      <div data-sequenza className="relative">
        <span id="strato-sabbia" className="sr-only absolute top-[42%]" aria-hidden="true" />
        <HomeSequence slugs={sequenza.map((p) => p.slug)} hero={<Hero />}>
          {sequenza.map((p, i) => (
            <ProductPanel
              key={p.slug}
              prodotto={p}
              indice={i}
              profonditaMm={40 + i * 28}
            />
          ))}
        </HomeSequence>
      </div>

      {/* -------------------------------------------------- 096 mm · Ocra -- */}
      <section
        id="strato-ocra"
        className="cucitura content-grid relative py-24 sm:py-32"
        aria-labelledby="titolo-catalogo"
      >
        <IntestazioneStrato id="ocra" />

        <Titolo as="h2" id="titolo-catalogo" testo={t.sequenza.titoloFinale} className="mt-10 text-display-l" />
        <p className="measure mt-5 text-body-l" style={{ color: 'var(--ink-corrente-soft)' }}>
          {t.sequenza.sottotitoloFinale}
        </p>

        {/*
          Il catalogo come **distinta di produzione**, non come griglia di card.
          Una riga per pezzo, incolonnata: numero, nome, tempi, prezzo. È la
          forma che prende un elenco quando le informazioni sono misure.
        */}
        <ul className="mt-14 border-t" style={{ borderColor: 'var(--linea-corrente)' }}>
          {tutti.map((p) => (
            <li key={p.slug} className="border-b" style={{ borderColor: 'var(--linea-corrente)' }}>
              <Link
                href={`/prodotti/${p.slug}`}
                className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5 transition-[padding] duration-200 sm:grid-cols-[4rem_1fr_10rem_7rem] sm:gap-x-8 sm:hover:pl-3"
              >
                <span className="font-mono text-quota tabular-nums" data-numeric style={{ color: 'var(--ink-corrente-soft)' }}>
                  {indice(p.ordine)}
                </span>

                <span className="col-start-2">
                  <span className="font-display text-title-m font-bold">{p.nome}</span>
                  <span className="ml-3 text-sm" style={{ color: 'var(--ink-corrente-soft)' }}>
                    {p.sottotitolo}
                  </span>
                </span>

                <span
                  className="col-start-2 font-mono text-quota uppercase sm:col-start-3"
                  style={{ color: 'var(--ink-corrente-soft)' }}
                >
                  {p.disponibileSubito ? giorniLavorativi(p.tempiProduzioneGiorni) : t.prodotto.suMisura}
                </span>

                <Prezzo
                  cent={prezzoMinimoCent(p)}
                  da={p.varianti.length > 1}
                  className="col-start-3 row-start-1 text-right font-display font-bold sm:col-start-4 sm:row-start-auto"
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <PillLink href="/catalogo">{t.sequenza.tuttiIProdotti}</PillLink>
        </div>
      </section>

      {/* -------------------------------------------- 152 mm · Terracotta -- */}
      <section
        id="strato-terracotta"
        className="cucitura content-grid relative py-24 sm:py-36"
        aria-labelledby="titolo-su-richiesta"
      >
        <IntestazioneStrato id="terracotta" />

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <Titolo as="h2" id="titolo-su-richiesta" testo={t.suRichiesta.titolo} className="text-display-l" />
            <p className="measure mt-6 text-body-l" style={{ color: 'var(--ink-corrente-soft)' }}>
              {t.suRichiesta.testo}
            </p>
            <p className="measure mt-4 text-sm" style={{ color: 'var(--ink-corrente-soft)' }}>
              {t.suRichiesta.nota}
            </p>
            <div className="mt-10">
              <PillLink href="/su-richiesta" variant="ugello">
                {t.suRichiesta.cta}
              </PillLink>
            </div>
          </div>

          {/* I formati accettati, come una specifica. */}
          <dl className="self-start border-t" style={{ borderColor: 'var(--linea-corrente)' }}>
            {[
              ['Formati', 'STL · 3MF · OBJ · STEP'],
              ['Anche solo', 'Foto, schizzo, disegno'],
              ['Peso massimo', '50 MB per file'],
              ['Risposta', 'Entro 48 ore'],
              ['Preventivo', 'Gratuito, non impegnativo'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-6 border-b py-3"
                style={{ borderColor: 'var(--linea-corrente)' }}
              >
                <dt className="font-mono text-quota uppercase" style={{ color: 'var(--ink-corrente-soft)' }}>
                  {k}
                </dt>
                <dd className="text-right font-mono text-quota uppercase">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ----------------------------------------------- 196 mm · Ardesia -- */}
      <section id="strato-ardesia" className="cucitura content-grid relative py-24 sm:py-36" aria-labelledby="titolo-processo">
        <IntestazioneStrato id="ardesia" />

        <Titolo as="h2" id="titolo-processo" testo="Tre passaggi, **nessuna sorpresa**" className="mt-10 text-display-l" />

        <ol className="mt-14 grid gap-px sm:grid-cols-3" style={{ background: 'var(--linea-corrente)' }}>
          {[
            ['01', 'Il file', 'Riceviamo il tuo modello o lo disegniamo noi. Verifichiamo spessori, sporgenze e orientamento prima di accendere la macchina.'],
            ['02', 'La stampa', 'Strati da 0,16 mm, o 0,025 in resina dove serve il dettaglio. Il tempo dipende dall’altezza, non dal volume.'],
            ['03', 'La finitura', 'Rimozione dei supporti a mano, controllo su ogni pezzo, imballo. Quello che arriva è quello che hai visto.'],
          ].map(([n, titolo, testo]) => (
            <li key={n} className="p-7" style={{ background: 'var(--bg-corrente)' }}>
              <span className="font-mono text-quota tabular-nums" data-numeric style={{ color: 'var(--color-ugello)' }}>
                {n}
              </span>
              <h3 className="mt-4 font-display text-title-m font-bold">{titolo}</h3>
              <p className="mt-3 text-sm" style={{ color: 'var(--ink-corrente-soft)' }}>
                {testo}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

/**
 * L'intestazione di uno strato: nome del materiale, quota, e la cucitura.
 * È la stessa informazione che l'indicatore laterale dà in continuo, qui
 * fissata al punto esatto in cui il materiale cambia.
 */
function IntestazioneStrato({ id }: { id: string }) {
  const s = strato(id)
  const i = STRATI.findIndex((x) => x.id === id)

  return (
    <p className="quota flex items-center gap-4">
      <span data-numeric className="tabular-nums">
        {String(s.profonditaMm).padStart(3, '0')} mm
      </span>
      <span aria-hidden="true" className="block h-px w-8" style={{ background: 'var(--linea-corrente)' }} />
      <span>{s.nome}</span>
      <span aria-hidden="true" className="ml-auto tabular-nums" data-numeric>
        {indice(i + 1)}/{STRATI.length}
      </span>
    </p>
  )
}
