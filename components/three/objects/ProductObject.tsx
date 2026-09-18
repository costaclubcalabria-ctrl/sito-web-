'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Placeholder, Product } from '@/types/catalog'
import { getColor } from '@/data/materials'
import { geometriaSegnaposto } from '@/lib/placeholders'
import { texturaStrati } from '@/lib/texture'
import { frame, damp, clamp01 } from '@/lib/frame'
import type { QualitySettings } from '@/lib/quality'
import { opacitaPezzo, pezzoVisibile, posizionePezzo, scalaPezzo, type Composizione } from '../scenes/percorso'
import { fuoco as fuocoDa, S_INIZIO } from '@/lib/fiume'

/**
 * Un pezzo nel fiume.
 *
 * ============================================================================
 * SI MUOVE SEMPRE
 * ============================================================================
 *
 * Tutto quello che riguarda il pezzo è funzione della sua **distanza in slot**
 * dal punto di posa: posizione lungo l'arco, scala, quanto è illuminato, se si
 * disegna. Un numero solo, lo stesso che muove la sua scheda nel DOM.
 *
 * La rotazione invece è continua e indipendente dallo scroll. È l'unica
 * animazione autonoma ammessa, e serve a una cosa: un oggetto che ruota
 * lentamente si legge come **manipolabile**. Un oggetto fermo si legge come
 * un'immagine.
 *
 * Il primo pezzo, e solo lui, riceve una funzione `stampa`: si costruisce a
 * strati all'apertura. Gli altri arrivano finiti — in un fiume continuo non
 * avrebbe senso stampare mentre si scorre.
 *
 * Tutto il movimento è scritto direttamente sugli oggetti three dentro
 * `useFrame`. Niente passa da React (PLAN.md §3.2).
 */
/**
 * L'angolo di presentazione, per forma.
 *
 * Non tutti i pezzi hanno un davanti, ma quelli che l'hanno vanno mostrati da
 * lì. Il blocco ha le borchie su una faccia sola: visto di fronte le borchie
 * sono cerchi invisibili, visto di dietro è un rettangolo liscio. A tre quarti
 * si legge per quello che è. Vale lo stesso, in misura minore, per il busto e
 * per le targhe.
 */
const INQUADRATURA: Record<Placeholder['kind'], number> = {
  blocco: -0.44,
  plate: -0.4,
  busto: 0.2,
  lathe: 0,
  shell: 0,
  knot: 0,
  prism: 0,
}

export function ProductObject({
  prodotto,
  distanza,
  stampa,
  comp,
  settings,
}: {
  prodotto: Product
  /** Distanza in slot dal punto di posa, al frame corrente. */
  distanza: () => number
  /** Progresso di stampa (0→1), oppure `null` se il pezzo arriva finito. */
  stampa: (() => number) | null
  comp: Composizione
  settings: QualitySettings
}) {
  const gruppo = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const testina = useRef<THREE.Mesh>(null)
  const obiettivo = useRef(new THREE.Vector3())

  const geometria = useMemo(() => geometriaSegnaposto(prodotto.modello.segnaposto), [prodotto.modello.segnaposto])
  const altezza = prodotto.modello.segnaposto.altezza

  /** Il piano di taglio della stampa. Esiste solo per il pezzo che si stampa. */
  const piano = useMemo(
    () => (stampa ? new THREE.Plane(new THREE.Vector3(0, -1, 0), 0) : null),
    [stampa],
  )

  const materiale = useMemo(() => {
    // Il colore di presentazione è dichiarato dal prodotto, non dedotto: su un
    // fondo chiaro un pezzo bianco non si vede (vedi `ProductModel.colore`).
    const scelta = prodotto.modello.colore
    const c = getColor(scelta.materiale, scelta.colore)

    // Quanti strati si vedono sull'altezza del pezzo. Un pezzo da 140 mm a
    // 0,16 mm ne ha 875: a schermo sarebbero rumore. Circa 2 mm di passo
    // apparente è la densità che si **legge** come stampata.
    const strati = Math.max(24, Math.round((altezza * 100) / 2))
    const rilievo = texturaStrati(strati)

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(c.hex),
      roughness: c.ruvidita,
      metalness: c.metallicita,
      // Le linee di deposizione. La luce radente le accende: è così che
      // l'oggetto racconta di essere stato stampato invece di essere fuso.
      bumpMap: rilievo,
      bumpScale: 0.85,
      // Le creste sono anche più lucide delle valli: la punta del cordone è
      // stata schiacciata dall'ugello.
      roughnessMap: rilievo,
      // I gusci sono aperti: senza DoubleSide si vedrebbe attraverso la parete.
      side: prodotto.modello.segnaposto.kind === 'shell' ? THREE.DoubleSide : THREE.FrontSide,
      transparent: true,
      opacity: 1,
      // I pezzi in fondo al fiume si dissolvono: senza questo, sparirebbero di
      // scatto al limite dell'orizzonte.
      depthWrite: true,
    })

    if (piano) {
      mat.clippingPlanes = [piano]
      // Il taglio deve valere anche per l'ombra, altrimenti il pezzo proietta
      // l'ombra della sua forma finita mentre è ancora a metà. È il dettaglio
      // che tradirebbe il trucco.
      mat.clipShadows = true
    }

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
  /** L'angolo da cui il pezzo si presenta meglio. */
  const imbardata = useMemo(() => INQUADRATURA[prodotto.modello.segnaposto.kind], [prodotto.modello.segnaposto.kind])

  useFrame((state, dt) => {
    const g = gruppo.current
    const m = mesh.current
    if (!g || !m) return

    const d = distanza()
    const tempo = state.clock.elapsedTime

    // Quanto la scheda di vetro ha preso possesso della destra dello schermo:
    // 0 al titolo, 1 appena il fiume e partito. Decide se al pezzo in arrivo
    // si applica la dissolvenza d'entrata (vedi `percorso.ts`).
    const velo = clamp01((frame.fiume - S_INIZIO) / 0.45)

    // --- Oltre l'orizzonte non si disegna --------------------------------
    // Non è un dettaglio di performance: un pezzo che resta visibile in fondo
    // alla fila trasforma il fiume in una lista, e la lista non ha profondità.
    const dentro = pezzoVisibile(d, velo)
    if (g.visible !== dentro) g.visible = dentro
    if (!dentro) return

    const f = fuocoDa(d)

    // --- Posizione lungo l'arco -------------------------------------------
    posizionePezzo(d, comp, obiettivo.current)

    // Lo smorzamento è alto (lambda 12): la posizione è già una funzione
    // continua dello scroll, quindi non serve inerzia — serve solo evitare lo
    // scatto quando il viewport cambia formato.
    g.position.x = damp(g.position.x, obiettivo.current.x, 12, dt)
    g.position.y = damp(g.position.y, obiettivo.current.y, 12, dt)
    g.position.z = damp(g.position.z, obiettivo.current.z, 12, dt)

    const scala = scalaPezzo(d)
    g.scale.setScalar(damp(g.scale.x, scala, 10, dt))

    // --- La dissolvenza ai bordi del fiume --------------------------------
    materiale.opacity = opacitaPezzo(d, velo)

    // --- La stampa, solo per il primo pezzo -------------------------------
    if (piano && stampa) {
      const s = clamp01(stampa())
      // Il margine sopra l'altezza serve a far sparire il taglio quando il
      // pezzo è finito: altrimenti resta una sezione piatta sulla cima.
      piano.constant = s * (altezza + 0.06)

      if (testina.current) {
        testina.current.position.y = s * (altezza + 0.02)
        // La testina si vede solo mentre lavora: a 0 e a 1 è spenta.
        matTestina.opacity = s > 0.002 && s < 0.998 ? 0.9 : 0
        const r = 0.27 + Math.sin(Math.PI * s) * 0.11
        testina.current.scale.setScalar(r / 0.4)
      }
    }

    // --- La rotazione: continua, indipendente dallo scroll -----------------
    // Un pezzo in stampa non ruota: sarebbe fisicamente assurdo. Appena finito,
    // comincia.
    const finito = piano && stampa ? (clamp01(stampa()) > 0.999 ? 1 : 0) : 1
    const px = frame.pointerX + frame.tiltX
    const py = frame.pointerY + frame.tiltY

    // L'oscillazione, non il giro completo. Vedi INQUADRATURA: un pezzo
    // asimmetrico che compie un giro mostra il suo dietro per metà del tempo,
    // e il dietro di una lampada a borchie è un rettangolo liscio. Qui il
    // pezzo resta sempre entro ±27° dal suo angolo di presentazione, e
    // l'ampiezza si stringe quando arriva a fuoco: da lontano si muove di più,
    // a fuoco si mostra.
    const ampiezza = 0.2 + 0.28 * (1 - f)
    m.rotation.y = imbardata + finito * Math.sin(tempo * 0.3 + fase) * ampiezza + px * 0.06 * f
    m.rotation.x = damp(m.rotation.x, py * 0.05 * f * finito, 3, dt)
    // Un'oscillazione minima: l'oggetto non è appeso a un asse rigido.
    m.rotation.z = Math.sin(tempo * 0.42 + fase) * 0.012 * finito

    // Il pezzo a fuoco si stacca dal piano di pochissimo: è la differenza fra
    // "in mostra" e "in fila".
    m.position.y = damp(m.position.y, f * 0.05 * finito, 4, dt)
  })

  return (
    <group ref={gruppo}>
      <mesh
        ref={mesh}
        geometry={geometria}
        material={materiale}
        castShadow={settings.ombre === 'soft'}
        receiveShadow={settings.ombre === 'soft'}
      />

      {/* La testina: un anello sottile alla quota di deposizione. Solo sul
          pezzo che si stampa. */}
      {piano && (
        <mesh ref={testina} material={matTestina} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.4, 48]} />
        </mesh>
      )}
    </group>
  )
}
