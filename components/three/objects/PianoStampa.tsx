'use client'

import { useMemo } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import type { QualitySettings } from '@/lib/quality'

/**
 * Il piano di stampa.
 *
 * Una superficie scura e specchiante sotto agli oggetti, con una griglia tenue
 * incisa: il piatto di una stampante 3D, letto come un lago all'alba.
 *
 * Fa tre cose in una:
 * 1. **Dà un pavimento allo spazio.** Senza, gli oggetti non fluttuano: stanno
 *    semplicemente in un vuoto, e il vuoto non ha scala né distanza.
 * 2. **Raddoppia la scena.** Il riflesso ripete l'oggetto capovolto e sfocato:
 *    è l'immagine che fa sembrare "prodotta" una scena 3D invece che montata.
 * 3. **Racconta il processo.** La griglia è il reticolo del piatto di stampa —
 *    lo stesso che l'utente vedrebbe nello slicer.
 *
 * Gli oggetti restano **sospesi molto sopra** il piano: non ci appoggiano
 * (DESIGN.md §1.4, punto 1). L'aria in mezzo è ciò che rende il riflesso una
 * scelta e non una scorciatoia.
 *
 * Costo: il riflesso richiede un secondo render della scena, quindi vive solo
 * sul profilo alto. Sul medio resta il piano, opaco: la composizione non cambia,
 * cambia solo quanto è ricca.
 */

const QUOTA = -0.62
/** Raggio del disco. Oltre la distanza di nebbia (40) non serve: sparirebbe. */
const RAGGIO = 34

/** La griglia del piatto, disegnata una volta su canvas e ripetuta. */
let texGriglia: THREE.CanvasTexture | null = null

function texturaGriglia(): THREE.CanvasTexture {
  if (texGriglia) return texGriglia

  const lato = 256
  const c = document.createElement('canvas')
  c.width = lato
  c.height = lato
  const g = c.getContext('2d')

  if (g) {
    g.fillStyle = '#070511'
    g.fillRect(0, 0, lato, lato)

    // Reticolo fine + un reticolo maggiore ogni 4 celle, come in uno slicer.
    g.strokeStyle = 'rgba(180,150,220,0.16)'
    g.lineWidth = 1
    for (let i = 0; i <= lato; i += lato / 8) {
      g.beginPath()
      g.moveTo(i + 0.5, 0)
      g.lineTo(i + 0.5, lato)
      g.moveTo(0, i + 0.5)
      g.lineTo(lato, i + 0.5)
      g.stroke()
    }

    g.strokeStyle = 'rgba(245,194,107,0.22)'
    g.lineWidth = 1.5
    g.strokeRect(0.75, 0.75, lato - 1.5, lato - 1.5)
  }

  texGriglia = new THREE.CanvasTexture(c)
  texGriglia.wrapS = THREE.RepeatWrapping
  texGriglia.wrapT = THREE.RepeatWrapping
  texGriglia.repeat.set(RAGGIO / 1.5, RAGGIO / 1.5)
  texGriglia.colorSpace = THREE.SRGBColorSpace
  texGriglia.anisotropy = 4
  return texGriglia
}

export function PianoStampa({ settings }: { settings: QualitySettings }) {
  const griglia = useMemo(() => texturaGriglia(), [])

  if (settings.maxOggetti === 0) return null

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, QUOTA, -10]} receiveShadow={settings.ombre === 'soft'}>
      {/* Un disco e non un quadrato: un piano quadrato mostra due spigoli in
          diagonale appena la camera si alza, e non c'e nebbia che li nasconda. */}
      <circleGeometry args={[RAGGIO, 96]} />

      {settings.riflessi ? (
        <MeshReflectorMaterial
          // Risoluzione bassa di proposito: il riflesso è comunque sfocato, e
          // raddoppiare la risoluzione raddoppierebbe il costo per una
          // differenza che nessuno vede.
          resolution={512}
          // Sfocatura moderata: a 900 il riflesso smette di essere un riflesso
          // e diventa un alone viola sotto l'oggetto — sembra un difetto.
          blur={[320, 130]}
          mixBlur={0.85}
          // E non deve mai essere piu luminoso dell'oggetto che riflette.
          mixStrength={9}
          // Il riflesso non deve essere uno specchio: a 0.45 è un'eco, che è
          // quello che fa una superficie appena bagnata.
          mirror={0.5}
          depthScale={1.4}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.6}
          // Ruvido e per nulla metallico: il riflesso planare lo fa gia
          // `mirror`, mentre la componente speculare PBR, su un piano cosi
          // grande, produce solo una macchia luminosa sotto ogni luce — che il
          // bloom poi amplifica in un alone. Le due cose non vanno sommate.
          roughness={0.94}
          metalness={0.06}
          color="#070511"
          map={griglia}
          // La griglia si vede in trasparenza sotto il riflesso.
          distortion={0}
        />
      ) : (
        <meshStandardMaterial map={griglia} color="#070511" roughness={0.9} metalness={0.08} />
      )}
    </mesh>
  )
}
