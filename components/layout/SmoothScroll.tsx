'use client'

import { useEffect } from 'react'
import { preferisceMenoMovimento } from '@/lib/quality'
import { setLenis } from '@/lib/lenis'

/**
 * Scroll fluido (Lenis) sincronizzato con GSAP ScrollTrigger.
 *
 * L'ordine conta: Lenis deve guidare il ticker di GSAP, altrimenti lo scroll
 * fluido e le timeline agganciate allo scroll avanzano su due orologi diversi
 * e si vede uno sfarfallio di un frame a ogni aggiornamento.
 *
 * DESIGN.md §6.3: `lerp 0.09`, nessun rimbalzo a fine scroll.
 * Con `prefers-reduced-motion` Lenis non parte affatto: lo scroll resta quello
 * nativo del browser e ScrollTrigger continua a funzionare da solo.
 *
 * GSAP e Lenis sono importati **dinamicamente**: insieme pesano circa 40 KB
 * gzip e non servono al primo paint, perché prima che l'utente scorra passa
 * comunque qualche centinaio di millisecondi. Toglierli dal bundle iniziale è
 * banda in meno sottratta all'LCP.
 */
export function SmoothScroll() {
  useEffect(() => {
    let smontato = false
    let pulisci: (() => void) | undefined

    void (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ])
      if (smontato) return

      gsap.registerPlugin(ScrollTrigger)

      if (preferisceMenoMovimento()) {
        ScrollTrigger.refresh()
        return
      }

      const lenis = new Lenis({
        lerp: 0.09,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        // Su touch lasciamo lo scroll nativo: è più fluido di qualsiasi
        // emulazione e non litiga con pinch-zoom e pull-to-refresh.
        syncTouch: false,
        autoRaf: false,
      })

      setLenis(lenis)
      lenis.on('scroll', ScrollTrigger.update)

      const tick = (tempo: number) => lenis.raf(tempo * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      // I font cambiano l'altezza del testo: senza questo refresh, le soglie
      // calcolate prima dello swap restano sbagliate per tutta la sessione.
      void document.fonts?.ready.then(() => ScrollTrigger.refresh())

      pulisci = () => {
        gsap.ticker.remove(tick)
        setLenis(null)
        lenis.destroy()
        ScrollTrigger.getAll().forEach((s) => s.kill())
      }
    })()

    return () => {
      smontato = true
      pulisci?.()
    }
  }, [])

  return null
}
