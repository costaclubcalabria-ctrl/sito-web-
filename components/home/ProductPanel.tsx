import type { Product } from '@/types/catalog'
import { Prezzo } from '@/components/ui/Prezzo'
import { PillLink } from '@/components/ui/Pill'
import { prezzoMinimoCent } from '@/data/products'
import { dimensioni, giorniLavorativi, indice } from '@/lib/format'
import { t, interpola } from '@/i18n'

/**
 * La scheda di un prodotto nella sequenza della home.
 *
 * Non è un pannello di vetro sospeso: è **un foglio di carta appoggiato**,
 * con spigoli vivi e un'ombra secca di due strati. Il vetro non c'entra niente
 * con un oggetto stampato.
 *
 * La struttura è quella di una **scheda di lavorazione**, non di una card di
 * e-commerce: numero del pezzo, quota di profondità, misure incolonnate,
 * spessore dello strato, tempi. I dati stanno in monospaziato e allineati a
 * destra, come su un disegno tecnico.
 *
 * Tutto il contenuto è renderizzato lato server: nome, prezzo, descrizione e
 * misure sono leggibili da Google, dagli screen reader e da `Ctrl+F`, e restano
 * identici nel fallback senza WebGL.
 *
 * Opacità, posizione e avanzamento del deposito sono scritti da `HomeSequence`
 * a ogni frame: qui c'è solo lo stato di partenza.
 */
export function ProductPanel({
  prodotto,
  indice: i,
  profonditaMm,
}: {
  prodotto: Product
  indice: number
  /** Quota a cui questo pezzo si trova nella sezione. */
  profonditaMm: number
}) {
  const variante = prodotto.varianti[0]
  const strati = variante ? Math.round(variante.dimensioniMm[2] / 0.16) : 0

  return (
    <article
      data-pannello
      aria-hidden="true"
      style={{ opacity: 0, visibility: 'hidden' }}
      className="content-grid pointer-events-none absolute inset-0 flex items-end pb-[max(1.25rem,env(safe-area-inset-bottom))] will-change-[opacity,transform] sm:items-center sm:justify-end sm:pb-0"
    >
      <div className="foglio w-full sm:w-[27rem]">
        {/* Intestazione della scheda: numero del pezzo e quota. */}
        <header
          className="flex items-baseline justify-between gap-4 border-b px-6 py-3"
          style={{ borderColor: 'rgb(23 22 26 / 0.14)' }}
        >
          <span className="font-mono text-quota tracking-[0.1em] uppercase" data-numeric>
            Pezzo {indice(i + 1)}
          </span>
          <span className="font-mono text-quota tracking-[0.1em] uppercase" data-numeric>
            {profonditaMm} mm
          </span>
        </header>

        <div className="px-6 py-6">
          <p className="font-mono text-quota tracking-[0.1em] uppercase" style={{ color: 'var(--color-ugello)' }}>
            {prodotto.disponibileSubito ? t.prodotto.disponibileSubito : t.prodotto.suMisura}
          </p>

          <h2 className="mt-3 font-display text-title-m font-bold">{prodotto.nome}</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            {prodotto.sottotitolo}
          </p>

          <p className="measure mt-5 line-clamp-3 text-sm sm:line-clamp-none" style={{ color: 'var(--color-ink-soft)' }}>
            {prodotto.descrizione}
          </p>

          {/* Le misure. Etichetta a sinistra, valore monospaziato a destra:
              si leggono in colonna, come su una distinta. */}
          <dl className="mt-6 space-y-0">
            <Quota etichetta={t.prodotto.dimensioni} valore={variante ? dimensioni(variante.dimensioniMm) : '—'} />
            <Quota etichetta="Strato" valore="0,16 mm" />
            <Quota etichetta={t.sequenza.strati} valore={`${strati}`} nascondiSuMobile />
            <Quota etichetta={t.prodotto.produzione} valore={giorniLavorativi(prodotto.tempiProduzioneGiorni)} />
          </dl>
        </div>

        <footer
          className="flex items-center justify-between gap-4 border-t px-6 py-4"
          style={{ borderColor: 'rgb(23 22 26 / 0.14)' }}
        >
          <Prezzo
            cent={prezzoMinimoCent(prodotto)}
            da={prodotto.varianti.length > 1}
            className="font-display text-title-m font-bold"
          />
          <PillLink
            href={`/prodotti/${prodotto.slug}`}
            aria-label={interpola(t.a11y.vaiAlProdotto, { nome: prodotto.nome })}
            className="!bg-ink !text-paper"
          >
            {t.sequenza.vediProdotto}
          </PillLink>
        </footer>
      </div>
    </article>
  )
}

function Quota({
  etichetta,
  valore,
  nascondiSuMobile = false,
}: {
  etichetta: string
  valore: string
  nascondiSuMobile?: boolean
}) {
  return (
    <div
      className={`items-baseline justify-between gap-3 border-b py-2 last:border-b-0 ${nascondiSuMobile ? 'hidden sm:flex' : 'flex'}`}
      style={{ borderColor: 'rgb(23 22 26 / 0.1)' }}
    >
      <dt className="font-mono text-quota tracking-[0.1em] uppercase" style={{ color: 'var(--color-ink-muted)' }}>
        {etichetta}
      </dt>
      <dd className="font-mono text-quota tracking-[0.1em] uppercase tabular-nums" data-numeric>
        {valore}
      </dd>
    </div>
  )
}
