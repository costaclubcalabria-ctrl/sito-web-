'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { ScrollTrigger as TipoScrollTrigger } from 'gsap/ScrollTrigger'
import { frame, range } from '@/lib/frame'
import { useScene } from '@/store/useScene'
import { scrollA } from '@/lib/lenis'
import { preferisceMenoMovimento } from '@/lib/quality'
import { distanza, indiceAFuoco, opacitaScheda, pixelPerUnita, posizioneFila, PASSO_X, S_INIZIO } from '@/lib/fiume'

/**
 * Il motore della home: **il fiume**.
 *
 * ============================================================================
 * PEZZI E SCHEDE SCORRONO INSIEME
 * ============================================================================
 *
 * Lo scorrimento è continuo: la fila di pezzi non si ferma mai e le schede non
 * si dissolvono l'una nell'altra — **scivolano con il loro pezzo**.
 *
 * È la soluzione a un difetto preciso delle versioni precedenti. Lì la scheda
 * stava in un punto fisso e cambiava contenuto: se l'oggetto si muoveva, testo
 * e oggetto raccontavano due cose diverse. Qui la scheda è *attaccata* al suo
 * pezzo: si muovono con lo stesso numero (`s`, la posizione della fila) e con
 * la stessa velocità, quindi non possono desincronizzarsi.
 *
 * La velocità in pixel non è scelta a occhio: `pixelPerUnita` converte un passo
 * del fiume in pixel usando fov e distanza della camera, così un passo in scena
 * e un passo nel DOM sono **lo stesso spostamento**.
 *
 * Niente di tutto questo passa da uno stato React: sarebbero 60 re-render al
 * secondo dell'intero albero (PLAN.md §3.2).
 */

/** Il titolo esce di scena entro questo progresso. */
const FINE_HERO = 0.14

/**
 * Quanta corsa fa la scheda, in frazione della corsa del suo pezzo.
 *
 * Non è 1, e la ragione è geometrica. Un passo del fiume vale ~780 px su un
 * desktop 1440×900: una scheda larga 416 px appoggiata al margine destro, che
 * si muovesse di tutta quella corsa, uscirebbe dallo schermo di 150 px mentre il
 * suo pezzo sta arrivando. È esattamente quello che faceva, e il testo si
 * leggeva a metà.
 *
 * Ridurre l'ampiezza **non** è la desincronizzazione che questa architettura
 * esiste per impedire: scheda e pezzo restano legati allo stesso `d`, quindi
 * entrano, passano a fuoco ed escono nello stesso istante. Cambia solo di
 * quanto si spostano — è una parallasse fra un piano vicino e uno lontano, ed
 * è come si legge la profondità.
 */
const FRAZIONE_SCHEDA = 0.36

/**
 * Di quanto la posa della scheda è arretrata, in slot.
 *
 * Sposta la corsa a sinistra: la scheda arriva al margine destro quando è
 * ormai trasparente (|d| ≥ 0,44) e a fuoco sta dentro lo schermo con un
 * margine. Senza, la parte in entrata sborderebbe comunque.
 */
const BIAS_SCHEDA = 0.3

/** Sotto questa larghezza la scheda occupa tutta la riga: non ha corsa orizzontale. */
const LARGHEZZA_STRETTA = 640

/** Corsa verticale della scheda sui formati stretti, in pixel. */
const CORSA_Y_STRETTA = 54

export function Fiume({
  slugs,
  hero,
  children,
}: {
  /** Slug dei pezzi nel fiume, nell'ordine di scorrimento. */
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

    // Con `prefers-reduced-motion` il fiume non esiste: le schede si impilano e
    // si leggono una dopo l'altra. Il sito perde il movimento e non perde nulla
    // di funzionale. Usciamo **prima** di importare GSAP, quindi chi ha chiesto
    // meno movimento non scarica nemmeno la libreria delle animazioni.
    if (preferisceMenoMovimento()) {
      root.classList.add('fiume-statico')
      return
    }

    document.documentElement.dataset['scena'] = '1'

    const schede = Array.from(root.querySelectorAll<HTMLElement>('[data-scheda]'))
    const heroEl = heroRef.current
    let ultimoFocus = -2
    let corsaX = 0
    let biasX = 0
    let corsaY = 0

    /**
     * Quanti pixel vale un passo del fiume, e quanta parte di quella corsa
     * tocca alla scheda. Ricalcolato al ridimensionamento: dipende da altezza
     * del viewport, fov e distanza della camera.
     *
     * La conversione vive in `lib/fiume.ts`, che non importa `three`: così la
     * scena e il DOM partono **dalla stessa funzione** invece di due copie, ed
     * è la ragione per cui scheda e pezzo non possono scorrere a tempi diversi.
     */
    function misura() {
      const aspetto = window.innerWidth / window.innerHeight
      const passoPx = PASSO_X * pixelPerUnita(window.innerHeight, aspetto)
      const stretto = window.innerWidth < LARGHEZZA_STRETTA

      // Su un telefono la scheda è larga quanto lo schermo: non c'è un solo
      // pixel di gioco laterale, e qualunque corsa orizzontale le taglierebbe
      // il testo. Lì scorre in verticale, di poco.
      corsaX = stretto ? 0 : passoPx * FRAZIONE_SCHEDA
      biasX = -BIAS_SCHEDA * corsaX
      corsaY = stretto ? CORSA_Y_STRETTA : 0
    }

    const applica = (p: number) => {
      const s = posizioneFila(p, slugs.length)
      frame.fiume = s

      // L'hero non si dissolve: si ritira verso l'alto e si spegne.
      if (heroEl) {
        const uscita = range(p, 0, FINE_HERO)
        const visibile = uscita < 0.995
        heroEl.style.opacity = String(1 - uscita)
        heroEl.style.transform = `translate3d(0, ${-uscita * 60}px, 0)`
        heroEl.style.visibility = visibile ? 'visible' : 'hidden'
        heroEl.style.pointerEvents = uscita < 0.35 ? 'auto' : 'none'
        heroEl.setAttribute('aria-hidden', visibile ? 'false' : 'true')
      }

      for (let i = 0; i < schede.length; i++) {
        const el = schede[i]
        if (!el) continue

        const d = distanza(i, s)
        const o = opacitaScheda(d)
        const visibile = o > 0.004

        // La scheda scorre con il suo pezzo. Un filo di ritardo verticale
        // mentre entra: scivola, non compare.
        const x = d * corsaX + biasX
        const y = (1 - o) * 14 + d * corsaY
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
        el.style.opacity = visibile ? String(o) : '0'
        el.style.visibility = visibile ? 'visible' : 'hidden'
        el.setAttribute('aria-hidden', visibile ? 'false' : 'true')
        el.style.pointerEvents = o > 0.7 ? 'auto' : 'none'
      }

      const i = indiceAFuoco(s, slugs.length)
      if (i !== ultimoFocus) {
        ultimoFocus = i
        setFocus(i >= 0 ? (slugs[i] ?? null) : null)
      }
    }

    let smontato = false
    let st: TipoScrollTrigger | undefined

    function onFocusIn(e: FocusEvent) {
      const target = e.target
      if (!(target instanceof HTMLElement) || !st) return

      const scheda = target.closest<HTMLElement>('[data-scheda]')
      if (!scheda) return

      const i = schede.indexOf(scheda)
      if (i < 0) return

      // Il progresso a cui il pezzo i è al punto di posa.
      const fine = slugs.length - 1 + 0.45
      const p = (i - S_INIZIO) / (fine - S_INIZIO)
      const y = st.start + (st.end - st.start) * Math.min(1, Math.max(0, p))

      // Se siamo già lì non muovere nulla: uno scroll che riparte a ogni Tab
      // dentro la stessa scheda è disorientante.
      if (Math.abs(window.scrollY - y) < window.innerHeight * 0.35) return
      scrollA(y)
    }

    function onResize() {
      misura()
      if (st) applica(st.progress)
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
      misura()

      st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => applica(self.progress),
        /*
         * Superato il fiume la scena non ha più niente da dire: se resta
         * accesa, l'ultimo pezzo rimane appeso al bordo dello schermo per tutta
         * la parte bassa della pagina.
         *
         * `onLeave`/`onEnterBack` e non `onToggle`: all'apertura il trigger non
         * è ancora "attivo" — comincia esattamente a scrollY 0 — e con onToggle
         * il palco partirebbe spento.
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
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      smontato = true
      root.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('resize', onResize)
      st?.kill()
      delete document.documentElement.dataset['scena']
      frame.fiume = 0
    }
  }, [slugs, setFocus])

  return (
    <div
      ref={contenitore}
      className="relative"
      // ~110svh per pezzo, più l'hero. Il fiume scorre in continuo, quindi la
      // corsa serve tutta: è la durata del movimento, non una somma di soste.
      style={{ height: `${100 + slugs.length * 110}svh` }}
    >
      <div className="fiume-viewport sticky top-0 h-svh overflow-hidden">
        <div className="relative h-full">
          <div
            ref={heroRef}
            className="fiume-hero content-grid absolute inset-0 flex items-end pb-[max(4rem,13svh)] will-change-[opacity,transform] sm:items-center sm:pb-0"
          >
            {hero}
          </div>

          {/* Il binario delle schede. Ogni scheda è al punto di posa e viene
              traslata dal suo `d`: non c'è un layout da mantenere, solo una
              posizione da scrivere. */}
          <div className="fiume-binario absolute inset-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
