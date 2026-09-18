import { Titolo } from '@/components/ui/Titolo'
import { PillLink } from '@/components/ui/Pill'
import { t } from '@/i18n'

/**
 * L'hero.
 *
 * ⚠️ L'`<h1>` qui dentro **è l'elemento LCP** del sito (PLAN.md §8). Sta nel
 * DOM, renderizzato lato server, sopra un gradiente CSS: è visibile prima che
 * un solo byte di three.js sia scaricato. Non spostarlo dentro il canvas e non
 * ritardarlo dietro un'animazione d'ingresso, o l'obiettivo di 2,5 s salta.
 */
export function Hero() {
  return (
    <div className="max-w-3xl">
      <p className="spec mb-6">{t.hero.sopratitolo}</p>

      <Titolo
        as="h1"
        testo={t.hero.titolo}
        className="text-display-xl font-semibold text-balance text-ink"
      />

      <p className="measure mt-7 text-body-l text-ink-soft">{t.hero.sottotitolo}</p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <PillLink href="/catalogo">{t.hero.ctaPrimaria}</PillLink>
        <PillLink href="/su-richiesta" variant="secondaria">
          {t.hero.ctaSecondaria}
        </PillLink>
      </div>
    </div>
  )
}
