'use client'

import { useEffect, useState } from 'react'
import { useScene } from '@/store/useScene'
import { getProduct } from '@/data/products'
import { indice } from '@/lib/format'

/**
 * L'indicatore del fiume.
 *
 * Una piccola lastra di vetro in basso a sinistra che dice **quale pezzo stai
 * guardando**: numero, nome, e una barra che avanza. In uno scorrimento
 * continuo, dove i pezzi entrano ed escono senza fermarsi, è la sola cosa che
 * ti dice dove sei.
 *
 * Compare solo mentre il fiume è in scena: nelle sezioni sotto non avrebbe
 * niente da indicare. E non compare affatto sui formati stretti: lì la scheda
 * occupa il basso dello schermo e la pastiglia le finiva sopra — in più il
 * numero e il totale sono già nell'intestazione della scheda. Il dato cambia poche volte per pagina, quindi uno stato
 * React va benissimo — non è informazione da leggere a ogni frame.
 */
export function IndiceFiume({ totale }: { totale: number }) {
  const focus = useScene((s) => s.focus)
  const [visibile, setVisibile] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const osserva = () => setVisibile(root.dataset['scena'] === '1')

    osserva()
    // La scena si accende e si spegne scrivendo un attributo su :root: lo
    // seguiamo con un observer invece di duplicare la logica dello scroll.
    const mo = new MutationObserver(osserva)
    mo.observe(root, { attributes: true, attributeFilter: ['data-scena'] })
    return () => mo.disconnect()
  }, [])

  const prodotto = focus ? getProduct(focus) : undefined
  if (!prodotto) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-[clamp(1rem,3vh,2rem)] left-[clamp(1rem,4vw,3.5rem)] z-30 hidden transition-opacity duration-500 sm:block"
      style={{ opacity: visibile ? 1 : 0 }}
    >
      <div className="vetro flex items-center gap-4 !rounded-full py-2.5 pr-5 pl-4">
        <span className="quota text-ink" data-numeric>
          {indice(prodotto.ordine)}
        </span>
        <span className="h-4 w-px bg-ink/15" />
        <span className="font-display text-sm font-bold">{prodotto.nome}</span>
        <span className="quota">/ {indice(totale)}</span>
      </div>
    </div>
  )
}
