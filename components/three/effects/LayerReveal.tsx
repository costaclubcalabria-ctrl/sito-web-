'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { frame, clamp01 } from '@/lib/frame'
import { useScene } from '@/store/useScene'

/**
 * "Strato dopo strato" — l'hero (DESIGN.md §7, idea C).
 *
 * Una linea di luce ambra sale, e sotto di lei l'oggetto si costruisce a
 * strati. Quella linea è due cose insieme: il sole che sorge e la testina di
 * stampa. Quando arriva in cima si ferma all'orizzonte e diventa il tramonto
 * che illumina la scena.
 *
 * Implementazione: un `THREE.Plane` di clipping la cui costante sale, più un
 * disco emissivo che viaggia alla stessa quota. Niente shader custom — non
 * perché non si potrebbe, ma perché un piano di clipping è una primitiva
 * stabile di three, mentre un `onBeforeCompile` si rompe ai cambi di versione
 * e questa animazione non può permettersi di rompersi: è la prima cosa che
 * l'utente vede.
 *
 * ⚠️ Le mitigazioni dell'LCP (PLAN.md §7, Fase 1) sono nel contratto di questo
 * componente, non opzionali:
 * - l'elemento LCP è l'`<h1>` nel DOM, non il canvas
 * - se a `TIMEOUT_MS` la scena non è pronta, si salta alla scena finita
 * - si vede una volta per sessione
 * - qualsiasi scroll, tap o tasto la conclude subito
 */

const DURATA_S = 1.8
const TIMEOUT_MS = 1200
/** Da dove parte e dove arriva il taglio, in unità di scena. */
const Y_MIN = -0.05
const Y_MAX = 2.1

export function useLayerRevealPlane(attiva: boolean): THREE.Plane[] {
  // Un piano solo, condiviso da tutti i materiali che devono essere tagliati.
  return useMemo(() => (attiva ? [new THREE.Plane(new THREE.Vector3(0, -1, 0), Y_MIN)] : []), [attiva])
}

export function LayerReveal({ planes, onFine }: { planes: THREE.Plane[]; onFine: () => void }) {
  const linea = useRef<THREE.Mesh>(null)
  const alone = useRef<THREE.Mesh>(null)
  const avvio = useRef<number | null>(null)
  const finita = useRef(false)
  const segnaGenesiVista = useScene((s) => s.segnaGenesiVista)

  const concludi = useRef(() => {})
  concludi.current = () => {
    if (finita.current) return
    finita.current = true
    frame.genesi = 1
    const p = planes[0]
    if (p) p.constant = Y_MAX + 1 // taglio fuori campo: l'oggetto è tutto visibile
    segnaGenesiVista()
    onFine()
  }

  useEffect(() => {
    // Saltabile da qualsiasi gesto. Non è una cortesia: un'animazione
    // d'ingresso che non si può saltare è una tassa (DESIGN.md §7).
    const salta = () => concludi.current()
    const opts = { passive: true, once: true } as const

    window.addEventListener('wheel', salta, opts)
    window.addEventListener('touchstart', salta, opts)
    window.addEventListener('keydown', salta, { once: true })
    window.addEventListener('pointerdown', salta, opts)

    // Rete di sicurezza: se qualcosa non si carica, non si resta al buio.
    const timeout = window.setTimeout(() => concludi.current(), TIMEOUT_MS + DURATA_S * 1000)

    return () => {
      window.removeEventListener('wheel', salta)
      window.removeEventListener('touchstart', salta)
      window.removeEventListener('keydown', salta)
      window.removeEventListener('pointerdown', salta)
      window.clearTimeout(timeout)
    }
  }, [])

  useFrame((state) => {
    if (finita.current) return

    if (avvio.current === null) avvio.current = state.clock.elapsedTime

    const t = clamp01((state.clock.elapsedTime - avvio.current) / DURATA_S)
    // expo.out: parte veloce e si posa piano. Dà la sensazione di massa che si
    // deposita, non di un riempimento lineare.
    const e = t === 1 ? 1 : 1 - Math.pow(2, -9 * t)
    frame.genesi = e

    const y = Y_MIN + (Y_MAX - Y_MIN) * e
    const p = planes[0]
    if (p) p.constant = y

    if (linea.current) {
      linea.current.position.y = y
      // La linea si affievolisce mentre arriva in cima: sta diventando orizzonte.
      const mat = linea.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.85 * (1 - e * 0.55)
      linea.current.scale.setScalar(1 + e * 0.35)
    }

    if (alone.current) {
      alone.current.position.y = y
      const mat = alone.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.3 * (1 - e * 0.7)
    }

    if (t >= 1) concludi.current()
  })

  return (
    <group>
      {/* La linea di stampa / il sole che sorge */}
      <mesh ref={linea} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.02, 0.62, 64]} />
        <meshBasicMaterial color="#ffd489" transparent opacity={0.85} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* L'alone che la accompagna: senza, la linea sembra un anello di plastica */}
      <mesh ref={alone} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 48]} />
        <meshBasicMaterial color="#f5c26b" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
