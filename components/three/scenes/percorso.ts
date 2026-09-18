import * as THREE from 'three'

// Rie-esportate per comodità di chi lavora sulla scena: l'implementazione sta
// in lib/sequenza.ts, che non importa three (vedi la nota in quel file).
export { centroFuoco, fuoco, opacitaPannello, stampa } from '@/lib/sequenza'

/**
 * La coreografia della home, v3.
 *
 * ============================================================================
 * LA CAMERA NON VIAGGIA. È LA LINEA CHE SCORRE.
 * ============================================================================
 *
 * Nelle versioni precedenti la camera attraversava un paesaggio in profondità.
 * Era generico — è ciò che fa qualunque sito 3D — e soprattutto contraddiceva
 * il concetto: se la camera vola, gli oggetti sono un panorama; se la camera
 * sta ferma, gli oggetti sono **pezzi che passano davanti a te**.
 *
 * Qui la camera è fissa e frontale, come quella puntata su un piatto di stampa.
 * I pezzi sono allineati su una linea orizzontale e la linea trasla: uno alla
 * volta arriva al punto di posa, si stampa, e lascia il posto al successivo.
 *
 * Il movimento residuo della camera è solo la parallasse del puntatore,
 * smorzata e minima. Non c'è altro.
 */

/** Distanza fra un pezzo e il successivo lungo la linea. */
const PASSO_X = 3.4

/**
 * Dove sta il pezzo a fuoco nell'inquadratura, in unità di scena.
 * Negativo = a sinistra, perché la scheda occupa la destra. In verticale è 0:
 * lì la scheda sta in basso e il pezzo resta centrato.
 */
const POSA_X = -1.15

/** Il punto di posa nell'hero: a destra, perché la sinistra è del titolo. */
const POSA_HERO = -0.55

export interface Composizione {
  aspetto: number
}

/**
 * Posizione del pezzo i-esimo sulla linea.
 * Le quote Y e Z variano di poco: una fila perfettamente allineata si legge
 * come una vetrina, una appena sfalsata come una linea di produzione.
 */
export function posizioneOggetto(i: number): THREE.Vector3 {
  const lato = i % 2 === 0 ? 1 : -1
  return new THREE.Vector3(i * PASSO_X, 0, lato * 0.34)
}

/**
 * Posizione della linea (il gruppo che contiene tutti i pezzi) al progresso `t`.
 *
 * `indice` è la posizione continua lungo la linea: 0 = primo pezzo al punto di
 * posa, 1 = secondo, e così via. Prima del primo fuoco resta bloccato a
 * `POSA_HERO`, così nell'hero il pezzo sta a destra del titolo e non ci finisce
 * dietro.
 */
export function posizioneLinea(t: number, comp: Composizione, out: THREE.Vector3): void {
  const verticale = comp.aspetto < 1
  const posa = verticale ? 0 : POSA_X * Math.min(1, (comp.aspetto - 0.75) / 0.6)

  // Nell'hero il pezzo resta poco a destra del titolo in orizzontale; in
  // verticale il titolo sta sotto, quindi il pezzo e' gia centrato.
  const inizio = verticale ? -0.001 : POSA_HERO
  const grezzo = Math.max(inizio, (t - 0.3) / 0.2)

  /*
   * La linea non trasla in continuo: **sosta**.
   *
   * L'idea della catena che passa senza fermarsi era piu elegante sulla carta,
   * e sbagliata alla prova: la finestra in cui la scheda di un pezzo e
   * leggibile e piu larga di quella in cui il pezzo resta inquadrato, quindi
   * il testo parlava di un oggetto che era gia mezzo tagliato dal bordo. Testo
   * e oggetto raccontavano due cose diverse — il difetto peggiore in una scena
   * guidata dallo scroll, e proprio quello che la regola "leggono lo stesso
   * numero" doveva impedire.
   *
   * Quindi il pezzo resta fermo al punto di posa per tutta la durata della sua
   * scheda, e il passaggio al successivo avviene in fretta, nel varco fra le
   * due schede. In verticale la sosta e' piu lunga, perche la mezza larghezza
   * inquadrata vale 1,16 unita contro le 2,3 dell'orizzontale: la stessa
   * traslazione porta il pezzo fuori campo in meta tempo.
   */
  const indice = conSosta(grezzo, verticale ? 0.4 : 0.36)

  out.set(-indice * PASSO_X + posa, 0, 0)
}

/**
 * Applica la sosta: piatta entro `sosta` dal punto di posa, poi il passaggio.
 * @param sosta semiampiezza della sosta, in frazioni di passo (0 = nessuna).
 */
function conSosta(grezzo: number, sosta: number): number {
  const i = Math.round(grezzo)
  const d = grezzo - i
  const a = Math.abs(d)
  if (a <= sosta) return i
  const verso = d < 0 ? -1 : 1
  return i + verso * ((a - sosta) / (0.5 - sosta)) * 0.5
}

/** La camera. Fissa: cambia solo con il formato dello schermo. */
export function camera(comp: Composizione, posOut: THREE.Vector3, miraOut: THREE.Vector3): void {
  const verticale = comp.aspetto < 1

  if (verticale) {
    /*
     * In verticale il campo orizzontale si stringe moltissimo: con `fov 38°` e
     * un rapporto 0,46 la mezza larghezza inquadrata vale solo `0.16 · d`. Con
     * la distanza del formato orizzontale il pezzo sborderebbe dallo schermo.
     *
     * Quindi la camera arretra a 7,3 (il pezzo occupa circa un quarto
     * dell'altezza) e il punto di mira scende sotto il piano: e' cosi che
     * l'oggetto sale nel terzo superiore, sopra la scheda che occupa la meta
     * bassa. Non e' un adattamento: e' un'inquadratura diversa, come si fa in
     * fotografia fra orizzontale e verticale.
     */
    posOut.set(0, 1.4, 7.3)
    miraOut.set(0, -0.6, 0)
    return
  }

  // Frontale, appena sopra la quota del pezzo: è l'inquadratura di una foto di
  // prodotto, non di un paesaggio.
  posOut.set(0, 0.74, 4.25)
  miraOut.set(0, 0.5, 0)
}

/** Altezza del piano d'appoggio: la quota 0 della stampa. */
export const QUOTA_PIATTO = 0
