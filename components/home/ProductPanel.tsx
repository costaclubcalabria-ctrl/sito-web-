import type { Product } from '@/types/catalog'
import { Prezzo } from '@/components/ui/Prezzo'
import { PillLink } from '@/components/ui/Pill'
import { prezzoMinimoCent } from '@/data/products'
import { getColor } from '@/data/materials'
import { dimensioni, giorniLavorativi, indice } from '@/lib/format'
import { t, interpola } from '@/i18n'

/**
 * La scheda di un pezzo: una **lastra di vetro** che scorre insieme al suo
 * oggetto.
 *
 * Non sta in un punto fisso cambiando contenuto: appartiene al pezzo e si
 * muove con lui (vedi `Fiume.tsx`). È per questo che testo e oggetto non
 * possono raccontare due cose diverse.
 *
 * Tutto il contenuto è renderizzato lato server: nome, prezzo, descrizione e
 * misure sono leggibili da Google, dagli screen reader e da `Ctrl+F`, e restano
 * identici nel fallback senza WebGL.
 *
 * Trasformazione e opacità sono scritte da `Fiume` a ogni frame: qui c'è solo
 * lo stato di partenza.
 */
export function ProductPanel({ prodotto, indice: i }: { prodotto: Product; indice: number }) {
  const variante = prodotto.varianti[0]
  const strati = variante ? Math.round(variante.dimensioniMm[2] / 0.16) : 0
  const tinta = getColor(prodotto.modello.colore.materiale, prodotto.modello.colore.colore)

  return (
    <article className="content-grid pointer-events-none absolute inset-0 flex items-end pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:items-center sm:justify-end sm:pb-0">
      {/*
        ⚠️ Trasformazione e opacità stanno **su questo elemento**, non sul
        contenitore. Non è una preferenza di stile: `backdrop-filter` sfoca ciò
        che c'è dietro la *backdrop root*, e un antenato con `opacity < 1`, una
        trasformazione o un `will-change` ne apre una nuova. Con lo stato di
        scorrimento scritto sull'`<article>`, il vetro non sfocava niente — era
        solo un velo bianco al 52%, e i pezzi che passavano dietro si vedevano
        nitidi attraverso il testo. Spostando le due proprietà sulla lastra
        stessa il blur torna a funzionare.
      */}
      <div
        data-scheda
        aria-hidden="true"
        style={{ opacity: 0, visibility: 'hidden' }}
        className="vetro-scheda w-full overflow-hidden will-change-[opacity,transform] sm:w-[26rem]"
      >
        {/* Intestazione: numero del pezzo e pastiglia del colore in scena.
            La pastiglia non è decorativa: dice di che colore è il pezzo che
            stai guardando, ed è lo stesso colore che tinge il fondo. */}
        <header className="flex items-center justify-between gap-4 px-6 py-3.5">
          <span className="quota" data-numeric>
            {indice(i + 1)} / {t.sequenza.pezzi}
          </span>
          <span className="flex items-center gap-2">
            <span className="quota">{tinta.nome}</span>
            <span
              aria-hidden="true"
              className="block size-4 rounded-full shadow-[inset_0_1px_1px_rgb(255_255_255/0.6),0_1px_2px_rgb(0_0_0/0.18)]"
              style={{ background: tinta.hex }}
            />
          </span>
        </header>

        <div className="vetro-linea px-6 pt-5 pb-6">
          <p className="quota" style={{ color: 'var(--color-ugello)' }}>
            {prodotto.disponibileSubito ? t.prodotto.disponibileSubito : t.prodotto.suMisura}
          </p>

          <h2 className="mt-3 font-display text-title-m font-bold">{prodotto.nome}</h2>
          <p className="mt-1 text-sm text-ink-soft">{prodotto.sottotitolo}</p>

          <p className="measure mt-4 line-clamp-3 text-sm text-ink-soft sm:line-clamp-4">
            {prodotto.descrizione}
          </p>

          {/* Le misure. Etichetta a sinistra, valore monospaziato a destra:
              si leggono in colonna, come su una distinta. */}
          <dl className="mt-5">
            <Quota etichetta={t.prodotto.dimensioni} valore={variante ? dimensioni(variante.dimensioniMm) : '—'} />
            <Quota etichetta="Strato" valore="0,16 mm" />
            <Quota etichetta={t.sequenza.strati} valore={`${strati}`} nascondiSuMobile />
            <Quota etichetta={t.prodotto.produzione} valore={giorniLavorativi(prodotto.tempiProduzioneGiorni)} />
          </dl>
        </div>

        <footer className="vetro-linea flex items-center justify-between gap-4 px-6 py-4">
          <Prezzo
            cent={prezzoMinimoCent(prodotto)}
            da={prodotto.varianti.length > 1}
            className="font-display text-title-m font-bold"
          />
          <PillLink
            href={`/prodotti/${prodotto.slug}`}
            aria-label={interpola(t.a11y.vaiAlProdotto, { nome: prodotto.nome })}
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
      className={`items-baseline justify-between gap-3 border-b border-[rgb(22_22_26/0.07)] py-2 last:border-b-0 ${
        nascondiSuMobile ? 'hidden sm:flex' : 'flex'
      }`}
    >
      <dt className="quota">{etichetta}</dt>
      <dd className="quota text-right text-ink">{valore}</dd>
    </div>
  )
}
