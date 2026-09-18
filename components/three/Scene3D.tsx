'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useRef, useState } from 'react'
import * as THREE from 'three'
import { declassa, settingsFor, type QualitySettings, type QualityTier } from '@/lib/quality'
import { SceneDirector } from './SceneDirector'
import { StudioLights } from './lights/StudioLights'
import { PointerRig } from './rigs/PointerRig'
import { PerfWatch } from './rigs/PerfWatch'

/**
 * Il `<Canvas>` persistente. Uno solo per tutto il sito, montato nel root
 * layout, mai smontato (PLAN.md §3.1).
 *
 * È trasparente: lo sfondo è il gradiente CSS che sta sotto (`.sky`), non un
 * colore di scena. Così il cielo è già a posto prima che React monti, il
 * fallback statico è identico al sito vero, e non esiste una giuntura visibile
 * tra DOM e WebGL.
 */
export function Scene3D({
  tierIniziale,
  settingsIniziali,
}: {
  tierIniziale: QualityTier
  settingsIniziali: QualitySettings
}) {
  const [settings, setSettings] = useState<QualitySettings>(settingsIniziali)
  // Il declassamento è a una via: una volta scesi non si risale nella stessa
  // sessione. L'oscillazione tra profili è più fastidiosa del profilo basso.
  const fondo = useRef(tierIniziale === 'low')

  const declassaUnaVolta = useCallback(() => {
    if (fondo.current) return
    setSettings((s) => {
      const nuovo = declassa(s.tier)
      if (nuovo === s.tier) {
        fondo.current = true
        return s
      }
      if (nuovo === 'low') fondo.current = true
      document.documentElement.dataset['quality'] = nuovo
      return settingsFor(nuovo)
    })
  }, [])

  return (
    <Canvas
      dpr={settings.dpr}
      shadows={settings.ombre === 'soft'}
      gl={{
        alpha: true,
        antialias: settings.antialias,
        powerPreference: 'high-performance',
        // Il tone mapping filmico è ciò che rende credibile la luce del tramonto:
        // senza, l'ambra dell'orizzonte va in clipping e diventa una macchia.
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [0, 0.9, 5.2], fov: 38, near: 0.1, far: 120 }}
      // Il canvas non intercetta i click: li gestiscono le ancore DOM, che sono
      // veri <button> e quindi funzionano da tastiera (PLAN.md §3.1).
      style={{ pointerEvents: 'none' }}
      frameloop="always"
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
      }}
    >
      <Suspense fallback={null}>
        <StudioLights settings={settings} />
        <SceneDirector settings={settings} />
      </Suspense>

      <PointerRig />
      <PerfWatch onCalo={declassaUnaVolta} />
    </Canvas>
  )
}
