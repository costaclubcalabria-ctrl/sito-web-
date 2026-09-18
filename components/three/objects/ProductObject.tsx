'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Product } from '@/types/catalog'
import { getColor } from '@/data/materials'
import { geometriaSegnaposto } from '@/lib/placeholders'
import { texturaStrati } from '@/lib/texture'
import { frame, damp, clamp01 } from '@/lib/frame'
import type { QualitySettings } from '@/lib/quality'

/**
 * Un pezzo sulla linea — e la sua stampa.
 *
 * ============================================================================
 * IL PEZZO NON APPARE: SI STAMPA
 * ============================================================================
 *
 * Ogni oggetto ha il **proprio piano di taglio**. La sua quota sale con il
 * valore restituito da `stampa()`, che è una funzione della posizione di
 * scroll: scendere di un millimetro aggiunge uno strato, risalire lo toglie.
 * Sotto il piano il pezzo esiste, sopra non ancora.
 *
 * Insieme al taglio viaggia la **testina**: un anello emissivo alla quota
 * corrente, che si spegne quando il pezzo è finito. È l'unico elemento della
 * scena che usa il colore dell'ugello.
 *
 * Perché un piano di clipping e non uno shader: `clippingPlanes` è una
 * primitiva stabile di three, mentre un `onBeforeCompile` si rompe ai cambi di
 * versione. Questa animazione è il sito: non può permettersi di rompersi.
 *
 * Tutto il movimento è scritto direttamente sugli oggetti three dentro
 * `useFrame`. Niente passa da React (PLAN.md §3.2).
 */
export function ProductObject({
  prodotto,
  posizione,
  fuoco,
  stampa,
  settings,
}: {
  prodotto: Product
  posizione: THREE.Vector3
  /** Quanto il pezzo è a fuoco (0→1) al frame corrente. */
  fuoco: () => number
  /** Quanto il pezzo è stampato (0→1) al frame corrente. */
  stampa: () => number
  settings: QualitySettings
}) {
  const gruppo = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const testina = useRef<THREE.Mesh>(null)

  const geometria = useMemo(() => geometriaSegnaposto(prodotto.modello.segnaposto), [prodotto.modello.segnaposto])
  const altezza = prodotto.modello.segnaposto.altezza

  /** Il piano di taglio di questo pezzo, e solo di questo. */
  const piano = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), [])

  const materiale = useMemo(() => {
    // Il colore di presentazione è dichiarato dal prodotto, non dedotto: su un
    // fondo chiaro un pezzo bianco non si vede (vedi `ProductModel.colore`).
    const scelta = prodotto.modello.colore
    const c = getColor(scelta.materiale, scelta.colore)
    // Quanti strati si vedono sull'altezza del pezzo. Un pezzo da 140 mm a
    // 0,16 mm ne ha 875: a schermo sarebbero rumore. Circa 2 mm di passo
    // apparente e' la densita' che si **legge** come stampata.
    const strati = Math.max(24, Math.round((altezza * 100) / 2))
    const rilievo = texturaStrati(strati)

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(c.hex),
      roughness: c.ruvidita,
      metalness: c.metallicita,
      // Le linee di deposizione. La luce radente le accende: e' cosi che
      // l'oggetto racconta di essere stato stampato invece di essere fuso.
      bumpMap: rilievo,
      bumpScale: 0.9,
      // Le creste sono anche piu lucide delle valli: la punta del cordone e'
      // stata schiacciata dall'ugello.
      roughnessMap: rilievo,
      // I gusci sono aperti: senza DoubleSide si vedrebbe attraverso la parete.
      side: prodotto.modello.segnaposto.kind === 'shell' ? THREE.DoubleSide : THREE.FrontSide,
    })
    // Il taglio deve valere anche per l'ombra, altrimenti il pezzo proietta
    // l'ombra della sua forma finita mentre è ancora a metà. È il dettaglio che
    // tradirebbe il trucco.
    mat.clippingPlanes = [piano]
    mat.clipShadows = true
    return mat
  }, [prodotto.modello.colore, prodotto.modello.segnaposto.kind, altezza, piano])

  const matTestina = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ff4d1f'),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  // Sfasamento deterministico: i pezzi non oscillano all'unisono, che è la cosa
  // che fa sembrare una scena 3D un salvaschermo.
  const fase = useMemo(() => (prodotto.ordine * 1.7) % (Math.PI * 2), [prodotto.ordine])

  useFrame((state, dt) => {
    const g = gruppo.current
    const m = mesh.current
    if (!g || !m) return

    const f = fuoco()
    const s = clamp01(stampa())
    const tempo = state.clock.elapsedTime

    // --- La stampa --------------------------------------------------------
    // Il piano di taglio sale con il progresso. Il margine sopra l'altezza
    // serve a far sparire il taglio del tutto quando il pezzo è finito:
    // altrimenti resta una sezione piatta sulla cima.
    const quota = posizione.y + s * (altezza + 0.06)
    piano.constant = quota

    if (testina.current) {
      testina.current.position.y = s * (altezza + 0.02)
      // La testina si vede solo mentre lavora: a 0 e a 1 è spenta.
      matTestina.opacity = s > 0.002 && s < 0.998 ? 0.9 : 0
      // Il raggio dell'anello segue la sagoma in modo approssimativo: allargarsi
      // verso il centro dell'oggetto e stringersi in cima è più credibile di un
      // anello di raggio costante.
      const r = 0.27 + Math.sin(Math.PI * s) * 0.11
      testina.current.scale.setScalar(r / 0.4)
    }

    // --- La sospensione ---------------------------------------------------
    // Un pezzo in stampa **non fluttua**: è vincolato al piatto. Comincia a
    // sollevarsi solo quando è finito. È la differenza fra un oggetto in
    // lavorazione e un oggetto finito, e si legge senza spiegazioni.
    const libero = s > 0.999 ? 1 : 0
    const galleggio = Math.sin(tempo * 0.5 + fase) * 0.035 * libero * (1 - f * 0.4)

    g.position.x = damp(g.position.x, posizione.x, 4, dt)
    g.position.y = damp(g.position.y, posizione.y + galleggio + libero * 0.06, 3.5, dt)
    g.position.z = damp(g.position.z, posizione.z, 4, dt)

    // --- Parallasse smorzato — ±3° e nulla più ----------------------------
    const px = frame.pointerX + frame.tiltX
    const py = frame.pointerY + frame.tiltY

    // Mentre stampa il pezzo sta fermo: una rotazione durante la deposizione
    // sarebbe fisicamente assurda e si nota subito.
    m.rotation.y = damp(m.rotation.y, fase + libero * tempo * 0.13 + px * 0.05 * f, 3, dt)
    m.rotation.x = damp(m.rotation.x, py * 0.045 * f * libero, 3, dt)
    m.rotation.z = Math.sin(tempo * 0.4 + fase) * 0.01 * libero

    const scala = 1 + f * 0.04
    m.scale.setScalar(damp(m.scale.x, scala, 4, dt))
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

      {/* La testina: un anello sottile alla quota di deposizione. */}
      <mesh ref={testina} material={matTestina} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.4, 48]} />
      </mesh>
    </group>
  )
}
