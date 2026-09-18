'use client'

import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { frame, damp } from '@/lib/frame'

/**
 * Puntatore e giroscopio → `frame.pointerX/Y` e `frame.tiltX/Y`.
 *
 * DESIGN.md §6.3: il parallasse è **smorzato, non diretto**. Il 3D che insegue
 * il cursore 1:1 sembra un giocattolo, non uno studio. Qui l'obiettivo grezzo
 * viene inseguito con `damp` a lambda bassa, e l'ampiezza è tagliata a valle.
 *
 * Non scrive mai in uno store React: sarebbe un re-render per movimento del mouse.
 */
const obiettivo = { x: 0, y: 0 }
const tilt = { x: 0, y: 0 }

export function PointerRig() {
  useEffect(() => {
    // Su touch il mouse non esiste: niente listener, niente lavoro inutile.
    const fine = window.matchMedia('(pointer: fine)').matches

    function onMove(e: PointerEvent) {
      obiettivo.x = (e.clientX / window.innerWidth) * 2 - 1
      obiettivo.y = (e.clientY / window.innerHeight) * 2 - 1
    }

    function onLeave() {
      obiettivo.x = 0
      obiettivo.y = 0
    }

    function onOrient(e: DeviceOrientationEvent) {
      // gamma: rotazione sinistra/destra. beta: avanti/indietro.
      // Ampiezza dimezzata rispetto al mouse (DESIGN.md §6.3).
      tilt.x = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 45))
      tilt.y = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 45))
    }

    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave, { passive: true })
    } else {
      // iOS 13+ richiede un permesso esplicito, e va chiesto da un gesto utente.
      // Se il permesso non c'è, la scena resta ferma: non è mai un requisito.
      window.addEventListener('deviceorientation', onOrient, { passive: true })
    }

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])

  useFrame((_, dt) => {
    frame.pointerX = damp(frame.pointerX, obiettivo.x, 3, dt)
    frame.pointerY = damp(frame.pointerY, obiettivo.y, 3, dt)
    frame.tiltX = damp(frame.tiltX, tilt.x * 0.5, 2.4, dt)
    frame.tiltY = damp(frame.tiltY, tilt.y * 0.5, 2.4, dt)
  })

  return null
}
