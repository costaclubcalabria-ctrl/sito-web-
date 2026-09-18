'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { Product } from '@/types/catalog'
import type { QualitySettings } from '@/lib/quality'
import { frame, damp, clamp01 } from '@/lib/frame'
import { useScene } from '@/store/useScene'
import { ProductObject } from '../objects/ProductObject'
import { camera as chiaveCamera, type Composizione } from './percorso'
import { distanza } from '@/lib/fiume'

/**
 * La scena della home: il fiume di pezzi che scorre davanti a una camera fissa.
 *
 * La camera non viaggia (vedi `percorso.ts`): scorre la fila. L'unico stato
 * React qui dentro è la prima stampa, che avviene una volta per sessione.
 */

/** Durata della prima stampa, quella automatica all'apertura. */
const PRIMA_STAMPA_S = 2.2
/** Se a questo istante la scena non è pronta si salta al pezzo finito. */
const TIMEOUT_S = 1.2

export function HomeScene({ prodotti, settings }: { prodotti: readonly Product[]; settings: QualitySettings }) {
  const camera = useThree((s) => s.camera)
  const dimensioni = useThree((s) => s.size)
  const genesiVista = useScene((s) => s.genesiVista)
  const segnaGenesiVista = useScene((s) => s.segnaGenesiVista)

  // Riusati a ogni frame: allocare vettori a 60 fps produce spazzatura che il
  // garbage collector fa poi pagare con uno scatto visibile.
  const posCam = useRef(new THREE.Vector3(0, 0.76, 4.35))
  const miraCam = useRef(new THREE.Vector3(0, 0.52, 0))
  const mira = useRef(new THREE.Vector3(0, 0.52, 0))

  const comp = useRef<Composizione>({ aspetto: 1.6 })
  comp.current.aspetto = dimensioni.height > 0 ? dimensioni.width / dimensioni.height : 1.6

  /**
   * La prima stampa.
   *
   * Il primo pezzo non arriva finito: si **stampa da sé** all'apertura, in poco
   * più di due secondi. È l'unica animazione autonoma del sito, e resta anche
   * ora che lo scorrimento è continuo — perché è il momento in cui il sito dice
   * che cosa siamo, e dura il tempo di un colpo d'occhio.
   *
   * Si vede **una volta per sessione**: alla seconda visita è una tassa.
   * Qualsiasi gesto la conclude. Se a `TIMEOUT_S` la scena non è ancora pronta
   * si salta al pezzo finito: nessuno resta davanti a un piatto vuoto.
   */
  const avvio = useRef<number | null>(null)
  const prima = useRef(genesiVista ? 1 : 0)
  const conclusa = useRef(genesiVista)
  const saltata = useRef(false)

  const distanze = useMemo(() => prodotti.map(() => ({ d: 0 })), [prodotti])

  useFrame((state, dt) => {
    const s = frame.fiume
    const tempo = state.clock.elapsedTime

    // --- La prima stampa ---------------------------------------------------
    if (!conclusa.current) {
      if (avvio.current === null) avvio.current = tempo
      const trascorso = tempo - avvio.current

      // Qualsiasi scorrimento la conclude: il dito ha la precedenza.
      if (!saltata.current && (s > -0.6 || trascorso > TIMEOUT_S + PRIMA_STAMPA_S)) {
        saltata.current = true
      }

      if (saltata.current) {
        prima.current = damp(prima.current, 1, 9, dt)
        if (prima.current > 0.995) {
          prima.current = 1
          conclusa.current = true
          segnaGenesiVista()
        }
      } else {
        prima.current = clamp01(trascorso / PRIMA_STAMPA_S)
        if (prima.current >= 1) {
          conclusa.current = true
          segnaGenesiVista()
        }
      }
      frame.genesi = prima.current
    } else {
      frame.genesi = 1
    }

    // --- Le distanze, calcolate una volta per frame ------------------------
    for (let i = 0; i < distanze.length; i++) {
      const slot = distanze[i]
      if (slot) slot.d = distanza(i, s)
    }

    // --- La camera: ferma, con la sola parallasse del puntatore ------------
    chiaveCamera(comp.current, posCam.current, miraCam.current)

    const px = frame.pointerX + frame.tiltX
    const py = frame.pointerY + frame.tiltY
    posCam.current.x += px * 0.18
    posCam.current.y += -py * 0.11

    camera.position.x = damp(camera.position.x, posCam.current.x, 3, dt)
    camera.position.y = damp(camera.position.y, posCam.current.y, 3, dt)
    camera.position.z = damp(camera.position.z, posCam.current.z, 3, dt)

    mira.current.x = damp(mira.current.x, miraCam.current.x, 3, dt)
    mira.current.y = damp(mira.current.y, miraCam.current.y, 3, dt)
    mira.current.z = damp(mira.current.z, miraCam.current.z, 3, dt)
    camera.lookAt(mira.current)
  })

  return (
    <>
      {prodotti.map((p, i) => (
        <ProductObject
          key={p.slug}
          prodotto={p}
          // Una funzione e non un valore: il componente legge la distanza
          // dentro il proprio `useFrame`, senza passare da React.
          distanza={() => distanze[i]?.d ?? 0}
          // Solo il primo pezzo si stampa: e lo fa una volta, all'apertura.
          stampa={i === 0 ? () => frame.genesi : null}
          comp={comp.current}
          settings={settings}
        />
      ))}

      {/*
        L'ombra di contatto.

        Su fondo chiaro è **l'elemento più importante della scena**: è ciò che
        appoggia il pezzo su un piano invece di lasciarlo galleggiare in un
        vuoto bianco. Senza, un oggetto su fondo chiaro è un ritaglio.

        `ContactShadows` renderizza la scena dall'alto in una texture e la
        sfoca: costa una passata, non un secondo render completo.
      */}
      {settings.ombre !== 'none' && (
        <ContactShadows
          position={[0, -0.002, 0]}
          scale={30}
          resolution={settings.ombre === 'soft' ? 1024 : 512}
          blur={2.1}
          far={2.6}
          opacity={0.5}
          color="#1d1d24"
          frames={Infinity}
        />
      )}
    </>
  )
}
