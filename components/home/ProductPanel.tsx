import type { Product } from '@/types/catalog'
import { Indice } from '@/components/ui/Indice'
import { Prezzo } from '@/components/ui/Prezzo'
import { SpecList } from '@/components/ui/SpecList'
import { PillLink } from '@/components/ui/Pill'
import { prezzoMinimoCent } from '@/data/products'
import { giorniLavorativi } from '@/lib/format'
import { t, interpola } from '@/i18n'

/**
 * Il pannello di un prodotto nella sequenza della home.
 *
 * Tutto il contenuto sta nel DOM, renderizzato lato server: nome, prezzo,
 * descrizione e specifiche sono leggibili da Google, dagli screen reader e da
 * `Ctrl+F` — e restano identici nel fallback senza WebGL. Il 3D è l'immagine
 * del prodotto, non il suo contenuto (DESIGN.md §8).
 *
 * L'opacità e la posizione sono scritte da `HomeSequence` a ogni frame: qui
 * non c'è nessuna animazione, solo lo stato di partenza.
 */
export function ProductPanel({ prodotto, indice }: { prodotto: Product; indice: number }) {
  return (
    <article
      data-pannello
      aria-hidden="true"
      style={{ opacity: 0, visibility: 'hidden' }}
      className="content-grid pointer-events-none absolute inset-0 flex items-end pb-[max(1.25rem,env(safe-area-inset-bottom))] will-change-[opacity,transform] sm:items-center sm:justify-end sm:pb-0"
    >
      <div className="glass-strong w-full p-6 sm:w-[26rem] sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="spec">
              {prodotto.disponibileSubito ? t.prodotto.disponibileSubito : t.prodotto.suMisura}
            </p>
            <h2 className="mt-2 text-title-m font-semibold text-ink">{prodotto.nome}</h2>
            <p className="mt-1 text-sm text-ink-soft">{prodotto.sottotitolo}</p>
          </div>
          <Indice n={indice + 1} className="-mt-2 shrink-0" />
        </div>

        <p className="measure text-sm text-ink-soft">{prodotto.descrizione}</p>

        <SpecList specs={prodotto.specifiche.slice(0, 2)} colonne={1} className="mt-5" />

        <div className="mt-6 flex items-center justify-between gap-4">
          <Prezzo cent={prezzoMinimoCent(prodotto)} da={prodotto.varianti.length > 1} className="text-title-m text-ink" />
          <PillLink
            href={`/prodotti/${prodotto.slug}`}
            aria-label={interpola(t.a11y.vaiAlProdotto, { nome: prodotto.nome })}
          >
            {t.sequenza.vediProdotto}
          </PillLink>
        </div>

        <p className="spec mt-4 border-t border-glass-line pt-4">
          {t.prodotto.produzione} · {giorniLavorativi(prodotto.tempiProduzioneGiorni)}
        </p>
      </div>
    </article>
  )
}
