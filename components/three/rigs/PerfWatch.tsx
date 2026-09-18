'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Monitor degli fps. DESIGN.md §9: sotto i 30 fps per più di 2 secondi
 * consecutivi si scala di un profilo, e non si risale.
 *
 * Deliberatamente non usa `PerformanceMonitor` di drei: quello promuove e
 * declassa in entrambe le direzioni, e l'oscillazione è proprio ciò che
 * vogliamo evitare.
 */
const SOGLIA_FPS = 30
const FINESTRA_S = 2
/** I primi secondi sono compilazione shader e caricamento: non contano. */
const GRAZIA_S = 2.5

export function PerfWatch({ onCalo }: { onCalo: () => void }) {
  const sotto = useRef(0)
  const eta = useRef(0)
  const scattato = useRef(false)

  useFrame((_, dt) => {
    if (scattato.current) return

    eta.current += dt
    if (eta.current < GRAZIA_S) return

    // dt anomalo: tab in background, o il sistema ha sospeso il rendering.
    if (dt > 0.5) {
      sotto.current = 0
      return
    }

    const fps = 1 / dt
    sotto.current = fps < SOGLIA_FPS ? sotto.current + dt : 0

    if (sotto.current >= FINESTRA_S) {
      scattato.current = true
      onCalo()
    }
  })

  return null
}
