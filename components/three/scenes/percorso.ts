import * as THREE from 'three'

// Rie-esportate per comodità di chi lavora sulla scena: l'implementazione sta
// in lib/sequenza.ts, che non importa three (vedi la nota in quel file).
export { centroFuoco, fuoco, opacitaPannello } from '@/lib/sequenza'

/**
 * Il percorso della camera nella home.
 *
 * Le posizioni degli oggetti e le chiavi della camera stanno nello stesso file
 * di proposito: sono una coreografia sola. Cambiare una senza l'altra produce
 * inquadrature vuote, ed è l'errore più facile da fare in una scena guidata
 * dallo scroll.
 *
 * Il ritmo segue DESIGN.md §6.1: un protagonista per volta, passaggi continui,
 * mai un fotogramma in cui non c'è nessuno a fuoco.
 */

/** Distanza tra un oggetto e il successivo lungo Z. */
const PASSO_Z = 7

/**
 * Distanza della camera dall'oggetto a fuoco.
 *
 * Non è un numero scelto a occhio: con `fov 38°` l'altezza inquadrata a
 * distanza d vale `2·d·tan(19°) ≈ 0.69·d`. Gli oggetti sono alti ~1,4 unità,
 * quindi a 4,4 unità occupano circa il 46% dell'altezza dello schermo — sono
 * il protagonista senza schiacciare il pannello di testo accanto.
 */
const DISTANZA_FUOCO = 4.4

/**
 * Spostamento laterale della composizione.
 *
 * Il punto di mira **è** il centro dello schermo. Per mettere l'oggetto a
 * sinistra basta guardare un punto alla sua destra. In verticale (mobile) il
 * pannello sta in basso, quindi l'offset laterale si azzera e l'oggetto sale.
 */
const OFFSET_ORIZZONTALE = 1.25

export interface Composizione {
  /** Rapporto larghezza/altezza del viewport. */
  aspetto: number
}

/** Posizione in scena dell'oggetto i-esimo. Sfalsata, mai allineata: dà volume. */
export function posizioneOggetto(i: number): THREE.Vector3 {
  const lato = i % 2 === 0 ? -1 : 1
  const scarto = i === 0 ? 0 : lato * (0.55 + (i % 3) * 0.22)
  return new THREE.Vector3(scarto, 0.1 + (i % 2) * 0.12, -i * PASSO_Z)
}

interface Chiave {
  /** Progresso di scroll a cui questa chiave è esattamente centrata. */
  t: number
  /** Indice dell'oggetto su cui la camera è centrata. -1 = nessuno. */
  oggetto: number
  /** Distanza dall'oggetto lungo Z. */
  dist: number
  /** Altezza della camera. */
  y: number
  /** Altezza del punto di mira. */
  mira: number
  /**
   * Da che parte sta l'oggetto nell'inquadratura:
   * -1 = a destra (il titolo occupa la sinistra) · +1 = a sinistra (il pannello
   * occupa la destra) · 0 = centrato.
   */
  lato: -1 | 0 | 1
  /**
   * Di quanto sollevare l'oggetto **in verticale** (mobile), abbassando la mira.
   * Nell'hero serve molto di più: sotto ci sono titolo, testo e due CTA, e un
   * oggetto dietro al titolo lo rende illeggibile.
   */
  su: number
}

/** Le tappe di DESIGN.md §6.1. */
const CHIAVI: Chiave[] = [
  { t: 0.0, oggetto: 0, dist: 6.2, y: 1.05, mira: 0.78, lato: -1, su: 1.95 },
  { t: 0.18, oggetto: 0, dist: 5.6, y: 1.0, mira: 0.76, lato: -1, su: 1.7 },
  { t: 0.3, oggetto: 0, dist: DISTANZA_FUOCO, y: 0.98, mira: 0.74, lato: 1, su: 0.85 },
  { t: 0.5, oggetto: 1, dist: DISTANZA_FUOCO, y: 0.98, mira: 0.74, lato: 1, su: 0.85 },
  { t: 0.7, oggetto: 2, dist: DISTANZA_FUOCO, y: 0.98, mira: 0.74, lato: 1, su: 0.85 },
  { t: 0.88, oggetto: 3, dist: DISTANZA_FUOCO, y: 1.0, mira: 0.74, lato: 1, su: 0.85 },
  // Arretramento: la camera sale e rivela tutto il campo di oggetti sospesi.
  { t: 1.0, oggetto: 2, dist: 11.5, y: 3.6, mira: 0.3, lato: 0, su: 0.4 },
]

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _posB = new THREE.Vector3()
const _lookB = new THREE.Vector3()

/** Riempie pos/look per una singola chiave. */
function valutaChiave(k: Chiave, offsetX: number, pos: THREE.Vector3, look: THREE.Vector3): void {
  const o = posizioneOggetto(k.oggetto)
  const dx = k.lato * offsetX

  look.set(o.x + dx, k.mira, o.z)
  pos.set(o.x + dx, k.y, o.z + k.dist)
}

/**
 * Interpola posizione e punto di mira a un dato progresso.
 *
 * Scrive nei vettori passati invece di allocarne di nuovi: gira 60 volte al
 * secondo, e un `new Vector3()` per frame è spazzatura che il garbage
 * collector fa poi pagare con uno scatto visibile.
 */
export function campionaPercorso(
  t: number,
  posOut: THREE.Vector3,
  lookOut: THREE.Vector3,
  comp: Composizione,
): void {
  const p = Math.min(1, Math.max(0, t))

  // In verticale il pannello sta in basso, non di lato: l'oggetto resta
  // centrato e sale. È il ragionamento mobile-first di DESIGN.md §8 applicato
  // alla composizione, non solo al layout.
  const verticale = comp.aspetto < 1
  const offsetX = verticale ? 0 : OFFSET_ORIZZONTALE * Math.min(1, (comp.aspetto - 0.8) / 0.6)
  // In verticale il pannello occupa la meta bassa: l'oggetto sale e arretra,
  // cosi resta intero e sopra il testo invece che dietro.
  // 1.7× la distanza porta l'oggetto a circa un quarto dell'altezza dello
  // schermo; l'alzata (per chiave, vedi `su`) lo colloca sopra il testo invece
  // che dietro.
  const allontana = verticale ? 1.7 : 1

  let i = 0
  while (i < CHIAVI.length - 2 && p > (CHIAVI[i + 1]?.t ?? 1)) i++

  const a = CHIAVI[i]
  const b = CHIAVI[i + 1]
  if (!a || !b) return

  valutaChiave(a, offsetX, _pos, _look)
  valutaChiave(b, offsetX, _posB, _lookB)

  const span = b.t - a.t
  const locale = span <= 0 ? 0 : (p - a.t) / span
  // smoothstep: la camera non cambia direzione di scatto sulle chiavi.
  const e = locale * locale * (3 - 2 * locale)

  posOut.copy(_pos.lerp(_posB, e))
  lookOut.copy(_look.lerp(_lookB, e))

  if (allontana !== 1) posOut.z = lookOut.z + (posOut.z - lookOut.z) * allontana

  const alzata = verticale ? a.su + (b.su - a.su) * e : 0

  // In verticale l'oggetto va nella metà alta dello schermo per lasciare posto
  // al pannello: si ottiene abbassando il punto di mira.
  lookOut.y -= alzata
  posOut.y -= alzata * 0.3
}
