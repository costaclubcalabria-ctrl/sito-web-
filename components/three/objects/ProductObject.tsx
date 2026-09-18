'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Product } from '@/types/catalog'
import { getMaterial } from '@/data/materials'
import { geometriaSegnaposto, geometriaPiedistallo } from '@/lib/placeholders'
import { frame, damp } from '@/lib/frame'
import type { QualitySettings } from '@/lib/quality'

/**
 * Un oggetto in scena, sul suo piedistallo sospeso.
 *
 * Tre movimenti, tutti scritti direttamente sugli oggetti three dentro
 * `useFrame`: nessuno passa da React (PLAN.md §3.2).
 *
 * 1. Sospensione: oscillazione lenta e rotazione di idle. È l'unica animazione
 *    autonoma ammessa (DESIGN.md §6.2) e comunica "questo oggetto fluttua,
 *    si può manipolare".
 * 2. Fuoco: quando è il protagonista si avvicina, si raddrizza e si illumina;
 *    quando non lo è arretra e si spegne. La gerarchia si fa con profondità e
 *    luce, mai con il colore — quello è riservato al prodotto.
 * 3. Parallasse: reazione smorzata a mouse e giroscopio, ampiezza minima.
 */
export function ProductObject({
  prodotto,
  posizione,
  fuoco,
  settings,
  clippingPlanes,
}: {
  prodotto: Product
  posizione: THREE.Vector3
  /** Funzione che restituisce quanto l'oggetto è a fuoco (0→1) al frame corrente. */
  fuoco: () => number
  settings: QualitySettings
  /** Piano di taglio dell'animazione di genesi. Vuoto quando non serve. */
  clippingPlanes?: THREE.Plane[]
}) {
  const gruppo = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const base = useRef<THREE.Mesh>(null)

  const geometria = useMemo(() => geometriaSegnaposto(prodotto.modello.segnaposto), [prodotto.modello.segnaposto])
  const geoBase = useMemo(() => geometriaPiedistallo(), [])

  // Il colore predefinito è il primo del primo materiale del prodotto.
  const materiale = useMemo(() => {
    const m = getMaterial(prodotto.materiali[0] ?? 'pla-opaco')
    const c = m.colori[0]
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(c?.hex ?? '#E8E4DC'),
      roughness: c?.ruvidita ?? 0.85,
      metalness: c?.metallicita ?? 0,
      // L'emissive parte a zero e sale col fuoco: è così che l'oggetto
      // protagonista "si accende" senza cambiare colore.
      emissive: new THREE.Color('#f5c26b'),
      emissiveIntensity: 0,
      transparent: c?.trasmissione !== undefined,
      opacity: c?.trasmissione !== undefined ? 0.9 : 1,
      // I gusci sono aperti: senza DoubleSide si vedrebbe attraverso la parete
      // e l'oggetto sembrerebbe piatto.
      side: prodotto.modello.segnaposto.kind === 'shell' ? THREE.DoubleSide : THREE.FrontSide,
    })
    if (clippingPlanes?.length) {
      mat.clippingPlanes = clippingPlanes
      mat.clipShadows = true
    }
    return mat
  }, [prodotto.materiali, prodotto.modello.segnaposto.kind, clippingPlanes])

  const matBase = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#171225'),
        roughness: 0.88,
        metalness: 0.04,
      }),
    [],
  )

  // Sfasamento deterministico: gli oggetti non oscillano all'unisono, che è
  // la cosa che fa sembrare una scena 3D un salvaschermo.
  const fase = useMemo(() => (prodotto.ordine * 1.7) % (Math.PI * 2), [prodotto.ordine])

  useFrame((state, dt) => {
    const g = gruppo.current
    const m = mesh.current
    if (!g || !m) return

    const f = fuoco()
    const tempo = state.clock.elapsedTime

    // 1. Sospensione — ampiezza ridotta quando è a fuoco: il protagonista deve
    //    stare fermo abbastanza da poter essere letto.
    const ampiezza = 0.055 * (1 - f * 0.55)
    const galleggio = Math.sin(tempo * 0.55 + fase) * ampiezza

    // 2. Fuoco — si avvicina di poco e si alza. Il movimento è sottile:
    //    se è evidente, sembra un pulsante che si gonfia.
    g.position.x = damp(g.position.x, posizione.x, 3, dt)
    g.position.y = damp(g.position.y, posizione.y + galleggio + f * 0.14, 3.5, dt)
    g.position.z = damp(g.position.z, posizione.z + f * 0.3, 3, dt)

    // 3. Parallasse smorzato — ±3° e nulla più (DESIGN.md §6.3).
    const px = frame.pointerX + frame.tiltX
    const py = frame.pointerY + frame.tiltY
    const inclinazioneX = py * 0.052 * f
    const inclinazioneY = px * 0.052 * f

    // Rotazione di idle: lenta, continua, mai completa entro una schermata.
    m.rotation.y = tempo * 0.16 + fase + inclinazioneY
    m.rotation.x = inclinazioneX
    m.rotation.z = Math.sin(tempo * 0.4 + fase) * 0.012

    const scala = 1 + f * 0.06
    m.scale.setScalar(damp(m.scale.x, scala, 4, dt))

    materiale.emissiveIntensity = damp(materiale.emissiveIntensity, f * 0.14, 4, dt)

    if (base.current) {
      base.current.rotation.y = -tempo * 0.06
      matBase.opacity = 1
    }
  })

  return (
    <group ref={gruppo} position={posizione}>
      <mesh
        ref={mesh}
        geometry={geometria}
        material={materiale}
        castShadow={settings.ombre === 'soft'}
        receiveShadow={settings.ombre === 'soft'}
      />

      {/* Il piedistallo sospeso — DESIGN.md §7, idea A. */}
      <mesh
        ref={base}
        geometry={geoBase}
        material={matBase}
        position={[0, -0.06, 0]}
        receiveShadow={settings.ombre === 'soft'}
      />

      {/* Alone caldo sotto il piedistallo: suggerisce la luce dell'orizzonte
          che passa sotto l'oggetto e lo stacca dal buio. Costo: un solo sprite. */}
      <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 32]} />
        <meshBasicMaterial color="#f5c26b" transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
  )
}
