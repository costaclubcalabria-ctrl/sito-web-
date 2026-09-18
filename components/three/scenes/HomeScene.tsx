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
import { camera as chiaveCamera, posizioneLinea, posizioneOggetto, type Composizione } from './percorso'
import { stampa } from '@/lib/sequenza'

/**
 * La scena della home: una linea di pezzi che passa davanti a una camera fissa,
 * e ognuno si stampa quando arriva al punto di posa.
 *
 * La camera non viaggia (vedi `percorso.ts`): è la linea che trasla. L'unico
 * stato React qui dentro è la prima stampa, che avviene una volta per sessione.
 */

/** Durata della prima stampa, quella automatica all'apertura. */
const PRIMA_STAMPA_S = 2.1
/** Se a questo istante la scena non è pronta si salta al pezzo finito. */
const TIMEOUT_S = 1.2

export function HomeScene({ prodotti, settings }: { prodotti: readonly Product[]; settings: QualitySettings }) {
  const camera = useThree((s) => s.camera)
  const dimensioni = useThree((s) => s.size)
  const genesiVista = useScene((s) => s.genesiVista)
  const segnaGenesiVista = useScene((s) => s.segnaGenesiVista)

  const linea = useRef<THREE.Group>(null)

  // Riusati a ogni frame: allocare vettori a 60 fps produce spazzatura che il
  // garbage collector fa poi pagare con uno scatto visibile.
  const posLinea = useRef(new THREE.Vector3())
  const posCam = useRef(new THREE.Vector3(0, 0.72, 4.75))
  const miraCam = useRef(new THREE.Vector3(0, 0.5, 0))
  const mira = useRef(new THREE.Vector3(0, 0.5, 0))

  const comp = useRef<Composizione>({ aspetto: 1.6 })
  comp.current.aspetto = dimensioni.height > 0 ? dimensioni.width / dimensioni.height : 1.6

  const posizioni = useMemo(() => prodotti.map((_, i) => posizioneOggetto(i)), [prodotti])

  /**
   * La prima stampa.
   *
   * Il primo pezzo non aspetta lo scroll: si stampa da sé all'apertura, in
   * poco più di due secondi. È l'unica animazione autonoma del sito, e c'è per
   * una ragione precisa — insegna la regola. Dopo averla vista una volta,
   * l'utente capisce che scorrendo ne stampa altri.
   *
   * Si vede **una volta per sessione**: alla seconda visita è una tassa.
   * Qualsiasi gesto la conclude. Se a `TIMEOUT_S` la scena non è ancora
   * pronta, si salta al pezzo finito: nessuno resta davanti a un piatto vuoto.
   */
  const avvio = useRef<number | null>(null)
  const prima = useRef(genesiVista ? 1 : 0)
  const conclusa = useRef(genesiVista)
  const saltata = useRef(false)

  useFrame((state, dt) => {
    const t = frame.scroll
    const tempo = state.clock.elapsedTime

    // --- La prima stampa ---------------------------------------------------
    if (!conclusa.current) {
      if (avvio.current === null) avvio.current = tempo
      const trascorso = tempo - avvio.current

      // Qualsiasi scroll conclude la prima stampa: il dito ha la precedenza.
      if (!saltata.current && (t > 0.004 || trascorso > TIMEOUT_S + PRIMA_STAMPA_S)) {
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

    // --- La linea ----------------------------------------------------------
    posizioneLinea(t, comp.current, posLinea.current)
    const g = linea.current
    if (g) {
      // lambda 4: la linea insegue lo scroll con un ritardo percepibile ma non
      // molle. Più alto sembra incollata, più basso sembra trascinata.
      g.position.x = damp(g.position.x, posLinea.current.x, 4, dt)
      g.position.y = damp(g.position.y, posLinea.current.y, 4, dt)
    }

    // --- La camera: ferma, con la sola parallasse del puntatore ------------
    chiaveCamera(comp.current, posCam.current, miraCam.current)

    const px = frame.pointerX + frame.tiltX
    const py = frame.pointerY + frame.tiltY
    posCam.current.x += px * 0.2
    posCam.current.y += -py * 0.12

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
      <group ref={linea}>
        {prodotti.map((p, i) => (
          <ProductObject
            key={p.slug}
            prodotto={p}
            posizione={posizioni[i] ?? new THREE.Vector3()}
            fuoco={() => fuocoLocale(i, frame.scroll)}
            // Il primo pezzo si stampa da sé all'apertura; gli altri li stampa
            // lo scroll. È la stessa funzione, con una sorgente diversa.
            stampa={i === 0 ? () => frame.genesi : () => stampa(i, frame.scroll)}
            settings={settings}
          />
        ))}
      </group>

      {/*
        L'ombra di contatto.

        Su fondo chiaro è **l'elemento più importante della scena**: è ciò che
        appoggia il pezzo su un piano invece di lasciarlo galleggiare in un
        vuoto bianco. Senza, un oggetto su fondo chiaro è un ritaglio.

        `ContactShadows` renderizza la scena dall'alto in una texture e la sfoca:
        costa una passata, non un secondo render completo come uno specchio.
      */}
      {settings.ombre !== 'none' && (
        <ContactShadows
          position={[0, -0.002, 0]}
          scale={26}
          resolution={settings.ombre === 'soft' ? 1024 : 512}
          blur={2}
          far={2.4}
          opacity={0.58}
          color="#2a2118"
          frames={Infinity}
        />
      )}
    </>
  )
}

/**
 * Il fuoco, calcolato qui invece di importarlo: `HomeScene` gira nel chunk 3D e
 * questa è l'unica funzione che gli serve oltre a `stampa`.
 */
function fuocoLocale(i: number, t: number): number {
  const centro = 0.3 + i * 0.2
  const d = Math.abs(t - centro) / 0.17
  if (d >= 1) return 0
  return 0.5 + 0.5 * Math.cos(Math.PI * d)
}
