'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualitySettings } from '@/lib/quality'
import { frame, damp } from '@/lib/frame'

/**
 * Luci da studio su cielo al crepuscolo.
 *
 * Tre luci, come in una posa fotografica vera:
 * - key: la luce dell'orizzonte, ambra, radente da destra-basso
 * - fill: il cielo, indigo freddo, dall'alto — schiarisce le ombre senza appiattire
 * - rim: controluce stretto che stacca l'oggetto dal fondo scuro
 *
 * È il rim a fare il lavoro: su un fondo indigo profondo, senza un bordo
 * luminoso un oggetto scuro sparisce.
 */
export function StudioLights({ settings }: { settings: QualitySettings }) {
  const key = useRef<THREE.DirectionalLight>(null)

  // La key light segue di pochissimo il puntatore: dà l'impressione che la
  // scena sia illuminata da una sorgente reale, non incollata alla camera.
  useFrame((_, dt) => {
    const l = key.current
    if (!l) return
    l.position.x = damp(l.position.x, 3.4 + frame.pointerX * 0.6, 2, dt)
    l.position.y = damp(l.position.y, 1.6 - frame.pointerY * 0.3, 2, dt)
  })

  return (
    <>
      {/* Ambiente: il rimbalzo generale del cielo. Tenuto basso, il resto lo fanno le direzionali. */}
      <ambientLight intensity={0.35} color="#6b5a86" />

      {/* Key — la luce dell'orizzonte */}
      <directionalLight
        ref={key}
        position={[3.4, 1.6, 2.2]}
        intensity={3.1}
        color="#ffb974"
        castShadow={settings.ombre === 'soft'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={24}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
      />

      {/* Fill — il cielo dall'alto, freddo */}
      <directionalLight position={[-2.6, 4.2, 1.4]} intensity={0.85} color="#8ea8ff" />

      {/* Rim — controluce stretto, è ciò che stacca l'oggetto dal fondo */}
      <directionalLight position={[-1.2, 0.8, -4]} intensity={2.2} color="#c9b6ff" />

      {/* La luce che sale dall'orizzonte, dietro la scena */}
      <pointLight position={[0, -1.8, -6]} intensity={22} distance={18} decay={2} color="#f5c26b" />
    </>
  )
}
