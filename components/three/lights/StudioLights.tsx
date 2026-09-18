'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualitySettings } from '@/lib/quality'
import { frame, damp } from '@/lib/frame'

/**
 * Luci da studio su fondo chiaro.
 *
 * Il ribaltamento rispetto alla versione precedente è totale: lì l'oggetto era
 * chiaro su fondo scuro e serviva un controluce per staccarlo; qui l'oggetto è
 * **scuro su fondo chiaro**, e il lavoro lo fa l'ombra.
 *
 * Tre luci, come in una posa di prodotto:
 * - key alta e frontale-laterale, con ombra morbida: è lei a dare il volume
 * - fill ampia dal lato opposto, per non lasciare i neri chiusi
 * - una luce bassa e calda, radente: accende gli spigoli degli strati, che su
 *   un oggetto stampato sono la cosa da vedere
 *
 * Su fondo chiaro la tentazione è alzare l'esposizione: è l'errore. Il contrasto
 * viene dall'ombra, non dalla luce.
 */
export function StudioLights({ settings }: { settings: QualitySettings }) {
  const key = useRef<THREE.DirectionalLight>(null)

  // La key segue di pochissimo il puntatore: dà l'impressione di una sorgente
  // reale nella stanza, non incollata alla camera.
  useFrame((_, dt) => {
    const l = key.current
    if (!l) return
    l.position.x = damp(l.position.x, 2.6 + frame.pointerX * 0.5, 2, dt)
    l.position.z = damp(l.position.z, 3.2 - frame.pointerY * 0.4, 2, dt)
  })

  return (
    <>
      {/* L'ambiente della stanza. Alto: è un fondo chiaro, la luce rimbalza. */}
      <ambientLight intensity={1.35} color="#fff6e8" />

      {/* Key — il volume e l'ombra */}
      <directionalLight
        ref={key}
        position={[2.6, 4.4, 3.2]}
        intensity={2.4}
        color="#fffaf0"
        castShadow={settings.ombre === 'soft'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0009}
        shadow-normalBias={0.022}
      />

      {/* Fill — apre le ombre senza appiattire */}
      <directionalLight position={[-3.4, 2.2, 2.4]} intensity={0.75} color="#eef2ff" />

      {/* Radente dal basso — accende gli spigoli degli strati.
          È la luce che rende visibile il processo, quindi non è decorativa. */}
      <directionalLight position={[-0.8, 0.12, 3.6]} intensity={0.95} color="#ffd9a8" />
    </>
  )
}
