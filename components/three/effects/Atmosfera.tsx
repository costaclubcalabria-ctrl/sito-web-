'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualitySettings } from '@/lib/quality'
import { frame } from '@/lib/frame'

/**
 * L'atmosfera in scena: raggi di luce che salgono dall'orizzonte e polvere in
 * sospensione.
 *
 * Servono a una cosa sola: **dare spessore all'aria**. Senza, gli oggetti
 * fluttuano in un vuoto, e un vuoto non ha profondità — la distanza si legge
 * solo dalla dimensione. Con dei volumi di luce in mezzo, lo spazio tra la
 * camera e l'oggetto diventa visibile, e la scena smette di sembrare un collage
 * di sagome.
 *
 * Costo: sette piani additivi e un sistema di punti. Nessuna texture scaricata
 * — il gradiente dei raggi è disegnato su una canvas alla prima apertura.
 */

/**
 * La texture di un raggio: luminoso in basso, si dissolve salendo, sfumato ai
 * lati. Fatta una volta e condivisa da tutti i raggi.
 */
let texRaggio: THREE.CanvasTexture | null = null

function texturaRaggio(): THREE.CanvasTexture {
  if (texRaggio) return texRaggio

  const c = document.createElement('canvas')
  c.width = 64
  c.height = 256
  const g = c.getContext('2d')

  if (g) {
    // Verticale: pieno alla base, nulla in cima.
    const vert = g.createLinearGradient(0, 256, 0, 0)
    vert.addColorStop(0, 'rgba(255,214,150,0.95)')
    vert.addColorStop(0.28, 'rgba(255,176,110,0.42)')
    vert.addColorStop(1, 'rgba(255,150,90,0)')
    g.fillStyle = vert
    g.fillRect(0, 0, 64, 256)

    // Orizzontale: i bordi netti di un rettangolo tradirebbero il trucco.
    const oriz = g.createLinearGradient(0, 0, 64, 0)
    oriz.addColorStop(0, 'rgba(0,0,0,1)')
    oriz.addColorStop(0.5, 'rgba(0,0,0,0)')
    oriz.addColorStop(1, 'rgba(0,0,0,1)')
    g.globalCompositeOperation = 'destination-out'
    g.fillStyle = oriz
    g.fillRect(0, 0, 64, 256)
  }

  texRaggio = new THREE.CanvasTexture(c)
  texRaggio.colorSpace = THREE.SRGBColorSpace
  return texRaggio
}

export function Atmosfera({ settings }: { settings: QualitySettings }) {
  return (
    <>
      {settings.raggi && <Raggi />}
      {settings.polvere > 0 && <Polvere quantita={settings.polvere} />}
    </>
  )
}

/** I fasci di luce che salgono dall'orizzonte, dietro gli oggetti. */
function Raggi() {
  const gruppo = useRef<THREE.Group>(null)
  const texture = useMemo(() => texturaRaggio(), [])

  // Disposizione deterministica: larghezze e inclinazioni diverse, mai un
  // ventaglio regolare — un ventaglio regolare si legge come una decorazione.
  const fasci = useMemo(
    () => [
      { x: -8.4, w: 2.6, h: 5.5, rot: 0.16, op: 0.05, fase: 0.0 },
      { x: -4.2, w: 1.6, h: 7.5, rot: -0.09, op: 0.08, fase: 1.3 },
      { x: -1.1, w: 3.4, h: 6.2, rot: 0.05, op: 0.07, fase: 2.6 },
      { x: 2.8, w: 1.3, h: 8.2, rot: -0.14, op: 0.09, fase: 4.1 },
      { x: 6.4, w: 2.8, h: 5.8, rot: 0.11, op: 0.055, fase: 5.4 },
      { x: 10.1, w: 1.9, h: 6.8, rot: -0.06, op: 0.045, fase: 0.8 },
    ],
    [],
  )

  useFrame((state) => {
    const g = gruppo.current
    if (!g) return
    const tempo = state.clock.elapsedTime

    // Respiro lentissimo e sfasato. È l'unica animazione autonoma ammessa
    // oltre alla sospensione degli oggetti (DESIGN.md §6, regola 2).
    for (let i = 0; i < g.children.length; i++) {
      const m = g.children[i] as THREE.Mesh
      const f = fasci[i]
      if (!m || !f) continue
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = f.op * (0.62 + 0.38 * Math.sin(tempo * 0.16 + f.fase))
      // Durante la genesi i raggi si accendono: il sole sta sorgendo davvero.
      mat.opacity *= 0.75 + frame.genesi * 0.55
    }
  })

  return (
    <group ref={gruppo} position={[0, -1.1, -24]}>
      {fasci.map((f, i) => (
        <mesh key={i} position={[f.x, f.h / 2 - 0.9, -i * 0.5]} rotation={[0, 0, f.rot]} renderOrder={-2}>
          <planeGeometry args={[f.w, f.h]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={f.op}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Polvere in sospensione.
 *
 * Un sistema di punti, non sprite: costa un draw call solo. Si muove pochissimo
 * di suo e reagisce al puntatore — è il livello che dà la parallasse in primo
 * piano, quella che le stelle CSS di sfondo non possono dare.
 */
function Polvere({ quantita }: { quantita: number }) {
  const punti = useRef<THREE.Points>(null)

  const { geometria, materiale } = useMemo(() => {
    const pos = new Float32Array(quantita * 3)
    const scale = new Float32Array(quantita)

    // PRNG deterministico: la stessa polvere a ogni caricamento. Una nuvola di
    // granelli diversa a ogni visita è rumore, non atmosfera.
    let a = 987654321
    const r = () => {
      a = (a * 1103515245 + 12345) & 0x7fffffff
      return a / 0x7fffffff
    }

    for (let i = 0; i < quantita; i++) {
      pos[i * 3] = (r() - 0.5) * 26
      pos[i * 3 + 1] = (r() - 0.2) * 9
      // Distribuiti su tutta la profondità percorsa dalla camera.
      pos[i * 3 + 2] = -r() * 30 + 4
      scale[i] = 0.4 + r() * 0.6
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))

    const m = new THREE.PointsMaterial({
      size: 0.035,
      color: new THREE.Color('#ffd9a8'),
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      toneMapped: false,
    })

    return { geometria: g, materiale: m }
  }, [quantita])

  useFrame((state, dt) => {
    const p = punti.current
    if (!p) return
    const tempo = state.clock.elapsedTime

    // Deriva lentissima verso l'alto, come pulviscolo in un fascio di luce.
    p.position.y = (tempo * 0.035) % 2
    // Parallasse: la polvere in primo piano si sposta più del fondo.
    p.position.x += ((frame.pointerX + frame.tiltX) * -0.42 - p.position.x) * Math.min(1, dt * 2)
  })

  return <points ref={punti} geometry={geometria} material={materiale} frustumCulled={false} />
}
