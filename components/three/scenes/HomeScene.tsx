'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Product } from '@/types/catalog'
import type { QualitySettings } from '@/lib/quality'
import { frame, damp } from '@/lib/frame'
import { useScene } from '@/store/useScene'
import { ProductObject } from '../objects/ProductObject'
import { LayerReveal, useLayerRevealPlane } from '../effects/LayerReveal'
import { campionaPercorso, posizioneOggetto, type Composizione } from './percorso'
import { fuoco } from '@/lib/sequenza'

/**
 * La scena della home: la camera percorre il campo di oggetti sospesi guidata
 * dallo scroll, e il primo oggetto nasce a strati (DESIGN.md §6.1 e §7).
 *
 * Tutto ciò che cambia per frame è letto da `frame` e scritto direttamente
 * sugli oggetti three. L'unico stato React qui dentro è `genesiInCorso`, che
 * cambia una volta sola per sessione.
 */
export function HomeScene({ prodotti, settings }: { prodotti: readonly Product[]; settings: QualitySettings }) {
  const camera = useThree((s) => s.camera)
  const dimensioni = useThree((s) => s.size)
  const genesiVista = useScene((s) => s.genesiVista)

  const faiGenesi = settings.genesi && !genesiVista
  const [genesiInCorso, setGenesiInCorso] = useState(faiGenesi)

  const planes = useLayerRevealPlane(genesiInCorso)
  const fineGenesi = useCallback(() => setGenesiInCorso(false), [])

  // Riusati a ogni frame: allocare vettori a 60 fps produce spazzatura che il
  // garbage collector fa poi pagare con uno scatto visibile.
  const posDesiderata = useRef(new THREE.Vector3(0, 0.95, 5.2))
  const miraDesiderata = useRef(new THREE.Vector3(0, 0.45, 0))
  const mira = useRef(new THREE.Vector3(0, 0.45, 0))

  const posizioni = useMemo(() => prodotti.map((_, i) => posizioneOggetto(i)), [prodotti])

  const comp = useRef<Composizione>({ aspetto: 1.6 })
  comp.current.aspetto = dimensioni.height > 0 ? dimensioni.width / dimensioni.height : 1.6

  useFrame((_, dt) => {
    const t = frame.scroll

    campionaPercorso(t, posDesiderata.current, miraDesiderata.current, comp.current)

    // Parallasse della camera: ±20px tradotti in unità di scena, smorzati.
    // È l'ultima cosa applicata, così non interferisce con la coreografia.
    const px = frame.pointerX + frame.tiltX
    const py = frame.pointerY + frame.tiltY
    posDesiderata.current.x += px * 0.16
    posDesiderata.current.y += -py * 0.1

    // lambda 3.2: la camera insegue il percorso con un ritardo percepibile ma
    // non molle. Più alto sembra incollata allo scroll, più basso sembra ubriaca.
    camera.position.x = damp(camera.position.x, posDesiderata.current.x, 3.2, dt)
    camera.position.y = damp(camera.position.y, posDesiderata.current.y, 3.2, dt)
    camera.position.z = damp(camera.position.z, posDesiderata.current.z, 3.2, dt)

    mira.current.x = damp(mira.current.x, miraDesiderata.current.x, 2.8, dt)
    mira.current.y = damp(mira.current.y, miraDesiderata.current.y, 2.8, dt)
    mira.current.z = damp(mira.current.z, miraDesiderata.current.z, 2.8, dt)
    camera.lookAt(mira.current)
  })

  return (
    <>
      {prodotti.map((p, i) => (
        <ProductObject
          key={p.slug}
          prodotto={p}
          posizione={posizioni[i] ?? new THREE.Vector3()}
          fuoco={() => fuoco(i, frame.scroll)}
          settings={settings}
          // Solo il primo oggetto nasce a strati: la genesi si vede una volta.
          clippingPlanes={i === 0 && genesiInCorso ? planes : undefined}
        />
      ))}

      {genesiInCorso && <LayerReveal planes={planes} onFine={fineGenesi} />}

      {settings.ombre === 'contact' && <OmbreDiContatto posizioni={posizioni} />}
    </>
  )
}

/**
 * Ombre di contatto per il profilo medio: un disco scuro sotto ogni oggetto.
 * Costa un draw call invece di una shadow map — DESIGN.md §9.
 */
function OmbreDiContatto({ posizioni }: { posizioni: THREE.Vector3[] }) {
  return (
    <>
      {posizioni.map((p, i) => (
        <mesh key={i} position={[p.x, p.y - 0.19, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.66, 24]} />
          <meshBasicMaterial color="#0d0a1a" transparent opacity={0.26} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
