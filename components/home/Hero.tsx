import { Titolo } from '@/components/ui/Titolo'
import { PillLink } from '@/components/ui/Pill'
import { t } from '@/i18n'

/**
 * L'hero.
 *
 * ⚠️ L'`<h1>` qui dentro **è l'elemento LCP** del sito. Sta nel DOM,
 * renderizzato lato server, su un fondo a colore pieno: è visibile prima che un
 * solo byte di three.js sia scaricato. Non spostarlo dentro il canvas e non
 * ritardarlo dietro un'animazione d'ingresso.
 */
export function Hero() {
  return (
    <div className="max-w-4xl">
      <p className="quota mb-7">{t.hero.sopratitolo}</p>

      <Titolo as="h1" testo={t.hero.titolo} className="text-display-xl font-bold text-balance" />

      <p className="measure mt-8 text-body-l text-ink-soft">{t.hero.sottotitolo}</p>

      <div className="mt-11 flex flex-wrap items-center gap-3">
        <PillLink href="/catalogo">{t.hero.ctaPrimaria}</PillLink>
        <PillLink href="/su-richiesta" variant="vetro">
          {t.hero.ctaSecondaria}
        </PillLink>
      </div>

      {/* Lo scroll muove i pezzi: va detto, altrimenti non si sa che c'è. */}
      <p className="quota mt-14 flex items-center gap-3" style={{ color: 'var(--color-ugello)' }}>
        <span aria-hidden="true" className="block h-px w-10 bg-ugello" />
        {t.hero.istruzione}
      </p>
    </div>
  )
}
