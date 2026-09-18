'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useScene } from '@/store/useScene'
import { modalitaStatica, rilevaTier, settingsFor, type QualityTier } from '@/lib/quality'
import { t } from '@/i18n'

/**
 * Il contenitore del 3D.
 *
 * Questo componente è leggerissimo di proposito: decide **se** caricare la
 * scena, e solo dopo importa il chunk three/r3f/drei. Su un dispositivo senza
 * WebGL o con `prefers-reduced-motion` quel chunk non viene mai scaricato —
 * il fallback statico non paga nemmeno un byte del 3D.
 *
 * Il `<Canvas>` che sta dentro `Scene3D` è montato nel root layout e **non
 * viene mai smontato** al cambio rotta: è ciò che rende possibile la
 * transizione dell'oggetto tra le pagine (PLAN.md §3.1).
 */
const Scene3D = dynamic(() => import('./Scene3D').then((m) => m.Scene3D), {
  ssr: false,
  loading: () => null,
})

export function Stage() {
  const setStatica = useScene((s) => s.setStatica)
  const [tier, setTier] = useState<QualityTier | null>(null)

  useEffect(() => {
    // La rilevazione tocca `window` e `navigator`: solo dopo il mount.
    if (modalitaStatica()) {
      setStatica(true)
      document.documentElement.dataset['quality'] = 'low'
      return
    }

    let annullato = false
    let idle = 0

    /**
     * Il chunk 3D pesa circa 180 KB gzip. Montarlo appena React si idrata
     * significa metterlo in gara con i font e con le immagini per la banda,
     * proprio nella finestra in cui si misura l'LCP.
     *
     * Quindi si aspetta il `load` della pagina e poi il primo momento di quiete.
     * Il timeout di 1500 ms è la rete di sicurezza: su una connessione lenta il
     * browser potrebbe non essere mai "inattivo", e la scena deve comunque
     * partire.
     */
    function avvia() {
      if (annullato) return
      const iniziale = rilevaTier()
      document.documentElement.dataset['quality'] = iniziale
      setTier(iniziale)
    }

    // Safari ha aggiunto requestIdleCallback tardi: il ripiego serve davvero.
    const haIdle = typeof window.requestIdleCallback === 'function'

    function pianifica() {
      if (annullato) return
      idle = haIdle
        ? window.requestIdleCallback(avvia, { timeout: 1500 })
        : window.setTimeout(avvia, 300)
    }

    if (document.readyState === 'complete') pianifica()
    else window.addEventListener('load', pianifica, { once: true })

    return () => {
      annullato = true
      window.removeEventListener('load', pianifica)
      if (haIdle) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [setStatica])

  if (tier === null) return null

  return (
    <div
      className="palco pointer-events-none fixed inset-0 z-[2]"
      // La scena è decorativa: ogni informazione esiste anche come testo nel DOM.
      role="presentation"
      aria-label={t.a11y.scenaDecorativa}
    >
      <Scene3D tierIniziale={tier} settingsIniziali={settingsFor(tier)} />
    </div>
  )
}
