'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { ScrollTrigger as TipoScrollTrigger } from 'gsap/ScrollTrigger'
import { frame, clamp01, range } from '@/lib/frame'
import { useScene } from '@/store/useScene'
import { scrollA } from '@/lib/lenis'
import { preferisceMenoMovimento } from '@/lib/quality'
import { centroFuoco, fuoco, opacitaPannello } from '@/lib/sequenza'

/**
 * Il motore dello scroll della home.
 *
 * Hero e sequenza prodotti stanno dentro **un solo viewport fisso** e dentro
 * **un solo ScrollTrigger**. È una scelta precisa: due trigger separati
 * significherebbero due progressi da sincronizzare, e basta un frame di
 * sfasamento perché il titolo esca prima che la camera sia partita. Con un
 * progresso solo, il taglio non può esistere (DESIGN.md §6.1).
 *
 * Fa tre cose, nessuna delle quali passa da uno stato React per frame:
 *
 * 1. Scrive `frame.scroll` (0→1). È l'unico canale tra lo scroll del DOM e la
 *    camera 3D: la scena legge quel numero e nient'altro (PLAN.md §3.2).
 * 2. Muove opacità e traslazione dei pannelli scrivendo **direttamente sugli
 *    elementi**, con la stessa funzione `fuoco()` che usa la scena. Due curve
 *    diverse farebbero arrivare pannello e oggetto in momenti leggermente
 *    diversi: è il tipo di sfasamento che si nota senza saper dire perché.
 * 3. Aggiorna il prodotto a fuoco nello store **solo al cambio di indice**:
 *    è informazione semantica, cambia 4 volte in tutta la corsa.
 *
 * Il focus da tastiera porta lo scroll sull'oggetto corrispondente: è così che
 * `Tab` "muove la camera" (DESIGN.md §8) senza una riga di logica 3D.
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

    // Con `prefers-reduced-motion` la sequenza non esiste: i pannelli si
    // impilano e si leggono uno dopo l'altro. Il sito perde il movimento e non
    // perde nulla di funzionale (DESIGN.md §6, regola 5).
    // Nota: qui usciamo **prima** di importare GSAP, quindi chi ha chiesto meno
    // movimento non scarica nemmeno la libreria delle animazioni.
    if (preferisceMenoMovimento()) {
      root.classList.add('sequenza-statica')
      return
    }

    const pannelli = Array.from(root.querySelectorAll<HTMLElement>('[data-pannello]'))
    const heroEl = heroRef.current
    let ultimoIndice = -1

    const applica = (p: number) => {
      frame.scroll = p

      // L'hero si smaterializza salendo. Non sparisce e basta: se ne va.
      if (heroEl) {
        const uscita = range(p, 0, FINE_HERO)
        const visibile = uscita < 0.995
        heroEl.style.opacity = String(1 - uscita)
        heroEl.style.transform = `translate3d(0, ${-uscita * 70}px, 0)`
        heroEl.style.visibility = visibile ? 'visible' : 'hidden'
        heroEl.style.pointerEvents = uscita < 0.35 ? 'auto' : 'none'
        heroEl.setAttribute('aria-hidden', visibile ? 'false' : 'true')
      }

      let attivo = -1
      let massimo = 0

      for (let i = 0; i < pannelli.length; i++) {
        const el = pannelli[i]
        if (!el) continue

        const f = fuoco(i, p)
        if (f > massimo) {
          massimo = f
          attivo = i
        }

        // Il testo si alterna in fretta anche se la scena si passa il testimone
        // con calma: due schede in dissolvenza non si leggono (vedi percorso.ts).
        const o = opacitaPannello(f)
        const visibile = o > 0.01
        el.style.opacity = visibile ? String(o) : '0'
        el.style.visibility = visibile ? 'visible' : 'hidden'
        el.style.transform = `translate3d(0, ${(1 - o) * 22}px, 0)`
        el.setAttribute('aria-hidden', visibile ? 'false' : 'true')
        // Un pannello che non si vede non deve essere raggiungibile da Tab.
        el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
      }

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
      // dentro lo stesso pannello è disorientante.
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
      })

      // Stato iniziale coerente anche prima del primo evento di scroll (per
      // esempio tornando indietro su una posizione già scrollata).
      applica(st.progress)
    })()

    root.addEventListener('focusin', onFocusIn)

    return () => {
      smontato = true
      root.removeEventListener('focusin', onFocusIn)
      st?.kill()
      frame.scroll = 0
    }
  }, [slugs, setFocus])

  return (
    <div
      ref={contenitore}
      className="relative"
      // 100svh per l'hero + ~110svh per prodotto. Con 4 prodotti fa 540svh:
      // nell'ordine di grandezza prescritto da DESIGN.md §6.1 (~600vh).
      style={{ height: `${100 + slugs.length * 110}svh` }}
    >
      <div className="sequenza-viewport sticky top-0 h-svh overflow-hidden">
        {/* Ogni livello e a tutto schermo e si porta i propri margini: cosi il
            testo non esce mai dalla gabbia, in nessun formato. */}
        <div className="sequenza-inner relative h-full">
          <div
            ref={heroRef}
            className="sequenza-hero velo-testo content-grid absolute inset-0 isolate flex items-end pb-[max(5rem,18svh)] will-change-[opacity,transform] sm:items-center sm:pb-0"
          >
            {hero}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
