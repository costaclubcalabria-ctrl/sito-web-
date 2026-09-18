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
 *
 * L'istruzione in basso non è un invito decorativo allo scroll: dice che cosa
 * fa lo scroll. In questo sito **scorrere stampa**, e se l'utente non lo sa
 * pensa che stia solo scendendo in una pagina.
 */
export function Hero() {
  return (
    <div className="max-w-4xl">
      <p className="quota mb-7">
        {t.hero.sopratitolo} · 000 mm
      </p>

      <Titolo
        as="h1"
        testo={t.hero.titolo}
        className="text-display-xl font-bold text-balance"
      />

      <p className="measure mt-8 text-body-l" style={{ color: 'var(--ink-corrente-soft)' }}>
        {t.hero.sottotitolo}
      </p>

      <div className="mt-11 flex flex-wrap items-center gap-3">
        <PillLink href="/catalogo">{t.hero.ctaPrimaria}</PillLink>
        <PillLink href="/su-richiesta" variant="secondaria">
          {t.hero.ctaSecondaria}
        </PillLink>
      </div>

      {/* Lo scroll è la testina: va detto. */}
      <p className="quota mt-14 flex items-center gap-3" style={{ color: 'var(--color-ugello)' }}>
        <span aria-hidden="true" className="block h-px w-10 bg-ugello" />
        {t.hero.istruzione}
      </p>
    </div>
  )
}
