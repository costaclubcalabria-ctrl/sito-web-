'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { ScrollTrigger as TipoScrollTrigger } from 'gsap/ScrollTrigger'
import { frame, clamp01, range } from '@/lib/frame'
import { useScene } from '@/store/useScene'
import { scrollA } from '@/lib/lenis'
import { preferisceMenoMovimento } from '@/lib/quality'
import { centroFuoco, fuoco, opacitaPannello, stampa } from '@/lib/sequenza'

/**
 * Il motore della home.
 *
 * ============================================================================
 * LO SCROLL È LA TESTINA
 * ============================================================================
 *
 * Questa è l'idea che tiene insieme tutto il sito. Lo scroll non muove una
 * camera davanti a oggetti già finiti: **deposita**. Ogni prodotto si stampa
 * mentre lo raggiungi, strato dopo strato, e se torni indietro si s-stampa.
 *
 * Non è un'animazione che parte e finisce: è una **funzione della posizione**.
 * Quindi obbedisce al dito, sempre — fermi il dito e la stampa si ferma a metà
 * pezzo. È la regola 2 del motion portata alle sue conseguenze.
 *
 * E la stessa funzione guida tre cose insieme:
 * 1. l'oggetto 3D, tramite `frame.stampa` (un piano di taglio che sale);
 * 2. il testo della scheda, tramite `--deposito` (una maschera a gradini);
 * 3. la linea della testina, che è dove il deposito sta arrivando adesso.
 *
 * Testo e oggetto crescono insieme perché leggono **lo stesso numero**. Due
 * curve diverse li farebbero arrivare in momenti leggermente sfasati, ed è il
 * tipo di difetto che si nota senza saper dire perché.
 *
 * Niente di tutto questo passa da uno stato React: sarebbero 60 re-render al
 * secondo dell'intero albero (PLAN.md §3.2).
 */

/** Il titolo esce di scena entro questo progresso. */
const FINE_HERO = 0.18

export function HomeSequence({
  slugs,
  hero,
  children,
}: {
  /** Slug dei prodotti nella sequenza, nell'ordine di scroll. */
  slugs: readonly string[]
  hero: ReactNode
  children: ReactNode
}) {
  const contenitore = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const setRotta = useScene((s) => s.setRotta)
  const setFocus = useScene((s) => s.setFocus)

  useEffect(() => {
    setRotta('home')
    return () => setRotta('nessuna')
  }, [setRotta])

  useEffect(() => {
    const root = contenitore.current
    if (!root) return

    // Con `prefers-reduced-motion` la sequenza non esiste: le schede si
    // impilano e si leggono una dopo l'altra, già stampate. Il sito perde il
    // movimento e non perde nulla di funzionale.
    // Nota: usciamo **prima** di importare GSAP, quindi chi ha chiesto meno
    // movimento non scarica nemmeno la libreria delle animazioni.
    if (preferisceMenoMovimento()) {
      root.classList.add('sequenza-statica')
      return
    }

    // Acceso di default: la sequenza comincia in cima alla pagina.
    document.documentElement.dataset['scena'] = '1'

    const pannelli = Array.from(root.querySelectorAll<HTMLElement>('[data-pannello]'))
    const heroEl = heroRef.current
    let ultimoIndice = -1

    const applica = (p: number) => {
      frame.scroll = p

      // L'hero non si dissolve: si ritira verso l'alto e si spegne.
      if (heroEl) {
        const uscita = range(p, 0, FINE_HERO)
        const visibile = uscita < 0.995
        heroEl.style.opacity = String(1 - uscita)
        heroEl.style.transform = `translate3d(0, ${-uscita * 64}px, 0)`
        heroEl.style.visibility = visibile ? 'visible' : 'hidden'
        heroEl.style.pointerEvents = uscita < 0.35 ? 'auto' : 'none'
        heroEl.setAttribute('aria-hidden', visibile ? 'false' : 'true')
      }

      let attivo = -1
      let massimo = 0
      let stampaAttiva = 0

      for (let i = 0; i < pannelli.length; i++) {
        const el = pannelli[i]
        if (!el) continue

        const f = fuoco(i, p)
        const s = stampa(i, p)

        if (f > massimo) {
          massimo = f
          attivo = i
          stampaAttiva = s
        }

        // Il testo si alterna in fretta anche se la scena si passa il testimone
        // con calma: due schede in dissolvenza non si leggono.
        const o = opacitaPannello(f)
        const visibile = o > 0.01

        el.style.opacity = visibile ? String(o) : '0'
        el.style.visibility = visibile ? 'visible' : 'hidden'
        el.style.transform = `translate3d(0, ${(1 - o) * 18}px, 0)`
        el.setAttribute('aria-hidden', visibile ? 'false' : 'true')
        el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'

        // Il deposito del testo: la stessa funzione che stampa l'oggetto.
        el.style.setProperty('--deposito', s.toFixed(3))
      }

      // L'unico canale fra lo scroll e la testina della scena 3D.
      frame.stampa = stampaAttiva

      if (attivo !== ultimoIndice) {
        ultimoIndice = attivo
        setFocus(attivo >= 0 ? (slugs[attivo] ?? null) : null)
      }
    }

    let smontato = false
    let st: TipoScrollTrigger | undefined

    function onFocusIn(e: FocusEvent) {
      const target = e.target
      if (!(target instanceof HTMLElement) || !st) return

      const pannello = target.closest<HTMLElement>('[data-pannello]')
      if (!pannello) return

      const i = pannelli.indexOf(pannello)
      if (i < 0) return

      const y = st.start + (st.end - st.start) * clamp01(centroFuoco(i))

      // Se siamo già lì non muovere nulla: uno scroll che riparte a ogni Tab
      // dentro la stessa scheda è disorientante.
      if (Math.abs(window.scrollY - y) < window.innerHeight * 0.35) return
      scrollA(y)
    }

    // GSAP arriva in modo dinamico: non serve al primo paint e toglierlo dal
    // bundle iniziale è banda che resta all'LCP.
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (smontato) return

      gsap.registerPlugin(ScrollTrigger)

      st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => applica(self.progress),
        /*
         * Superata la sequenza la scena non ha piu niente da dire: se resta
         * accesa, l'ultimo pezzo rimane appeso al bordo dello schermo per
         * tutta la parte bassa della pagina.
         *
         * `onLeave`/`onEnterBack` e non `onToggle`: all'apertura il trigger
         * non e ancora "attivo" — comincia esattamente a scrollY 0 — e con
         * onToggle il palco partiva spento, quindi il pezzo dell'hero non si
         * vedeva affatto.
         *
         * Un attributo su :root, non uno stato React: il CSS fa la dissolvenza.
         */
        onLeave: () => {
          document.documentElement.dataset['scena'] = '0'
        },
        onEnterBack: () => {
          document.documentElement.dataset['scena'] = '1'
        },
      })

      applica(st.progress)
    })()

    root.addEventListener('focusin', onFocusIn)

    return () => {
      smontato = true
      root.removeEventListener('focusin', onFocusIn)
      st?.kill()
      delete document.documentElement.dataset['scena']
      frame.scroll = 0
      frame.stampa = 0
    }
  }, [slugs, setFocus])

  return (
    <div
      ref={contenitore}
      className="relative"
      // 100svh per l'hero + ~120svh per pezzo. Più lento della versione
      // precedente di proposito: qui lo scroll non scorre, deposita, e una
      // stampa troppo rapida non si legge come una stampa.
      style={{ height: `${100 + slugs.length * 120}svh` }}
    >
      <div className="sequenza-viewport sticky top-0 h-svh overflow-hidden">
        <div className="sequenza-inner relative h-full">
          <div
            ref={heroRef}
            className="sequenza-hero content-grid absolute inset-0 flex items-end pb-[max(4rem,14svh)] will-change-[opacity,transform] sm:items-center sm:pb-0"
          >
            {hero}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
