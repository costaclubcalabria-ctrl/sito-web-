import * as THREE from 'three'

// Rie-esportate per comodita di chi lavora sulla scena: l'implementazione sta
// in lib/fiume.ts, che non importa three (vedi la nota in quel file).
export { distanza, fuoco, opacitaScheda, posizioneFila, indiceAFuoco, S_INIZIO, PASSO_X } from '@/lib/fiume'

/**
 * La geometria del fiume.
 *
 * ============================================================================
 * LA CAMERA NON SI MUOVE. IL FIUME SCORRE.
 * ============================================================================
 *
 * Camera fissa e frontale, come quella puntata su un banco di posa. I pezzi
 * scorrono davanti in continuo su una traiettoria ad arco: arrivano da destra
 * lontani e piccoli, passano vicini al centro, escono a sinistra.
 *
 * L'arco e la cosa che rende il movimento "vivo" invece che una fila che
 * trasla: passando dal centro il pezzo si **avvicina** e cresce, quindi il
 * movimento ha una profondita anche se la camera e immobile.
 */

import { PASSO_X } from '@/lib/fiume'

/**
 * L'arco.
 *
 * I pezzi non stanno su una retta: allontanandosi dal punto di posa **arretrano
 * e scendono**. Non e un vezzo — e cio che impedisce al pezzo che arriva di
 * passare davanti al testo della scheda, che occupa la destra dello schermo.
 * Con un arco piatto (i valori della prima versione) il pezzo successivo si
 * piazzava esattamente dietro le righe delle misure.
 */
const ARCO_Z = 1.55
const ARCO_Y = 0.42

/*
 * Quanto lontano si vede un pezzo — e **non e simmetrico**.
 *
 * A sinistra del punto di posa c'e spazio aperto: un pezzo che si allontana
 * puo restare visibile a lungo, rimpicciolirsi e dissolversi. E' la profondita
 * del fiume.
 *
 * A destra c'e la scheda di vetro. Il pezzo che arriva passa **dietro** la
 * lastra — e inevitabile: le schede stanno a destra e i pezzi arrivano da
 * destra. Dietro il vetro un pezzo colorato e un bellissimo alone; il problema
 * e il pezzo che **sporge** dal bordo della lastra, perche quello legge come
 * un rettangolo colorato incollato all'interfaccia. Succedeva esattamente a
 * `d ≈ 0,77`, dove il Blocco spuntava di venti pixel oltre il bordo sinistro
 * della scheda.
 *
 * Quindi in arrivo il pezzo e solo un alone dietro il vetro, e diventa solido
 * quando ne e uscito. Un pezzo che si annuncia come luce e poi si materializza
 * e migliore di un pezzo che spunta da un angolo.
 *
 * ⚠️ Con una eccezione, ed e il motivo del parametro `velo`: **all'apertura la
 * scheda non c'e**. Il primo pezzo sta a destra del titolo, dove non copre
 * niente e niente lo copre, e li deve essere **pieno** — e la prima cosa che
 * si vede del sito. Applicando la dissolvenza d'entrata anche lassu, il busto
 * compariva al 30% dietro le parole: sembrava un errore di caricamento.
 * Quindi la dissolvenza d'entrata entra in vigore mano a mano che il fiume
 * parte, cioe mano a mano che la scheda arriva a occupare la destra.
 */
export const ORIZZONTE = 1.65
const USCITA_DISSOLVENZA = 0.95
const ENTRATA_DISSOLVENZA = 0.34
const ENTRATA_ORIZZONTE = 0.82

export interface Composizione {
  aspetto: number
}

/**
 * Dove sta il punto di posa, in unita di scena.
 *
 * In orizzontale e spostato a sinistra: la scheda di vetro occupa la destra.
 * In verticale e centrato, perche la scheda sta sotto.
 */
export function posa(comp: Composizione): number {
  if (comp.aspetto < 1) return 0
  return -1.05 * Math.min(1, (comp.aspetto - 0.75) / 0.6)
}

/**
 * Posizione del pezzo a distanza `d` dal punto di posa.
 * Scrive nel vettore passato: gira 60 volte al secondo per ogni pezzo, e un
 * `new Vector3()` per frame e spazzatura che il garbage collector fa poi
 * pagare con uno scatto visibile.
 */
export function posizionePezzo(d: number, comp: Composizione, out: THREE.Vector3): void {
  const a = Math.abs(d)
  out.set(posa(comp) + d * PASSO_X, -a * ARCO_Y, -a * ARCO_Z)
}

/** Scala del pezzo: pieno al punto di posa, piu piccolo mentre si allontana. */
export function scalaPezzo(d: number): number {
  const a = Math.abs(d)
  return Math.max(0.5, 1 - a * 0.3)
}

/** Fin dove si vede un pezzo, dalla parte da cui arriva. */
function orizzonte(d: number, velo: number): number {
  if (d <= 0) return ORIZZONTE
  return ORIZZONTE + (ENTRATA_ORIZZONTE - ORIZZONTE) * velo
}

/**
 * Opacita del pezzo: si dissolve prima di uscire, non sparisce di scatto.
 *
 * `velo` e quanto la scheda di vetro occupa la destra dello schermo: 0 al
 * titolo, 1 a fiume avviato. Vedi la nota sull'asimmetria qui sopra.
 */
export function opacitaPezzo(d: number, velo = 1): number {
  const a = Math.abs(d)
  const fuori = orizzonte(d, velo)
  const dentro =
    d > 0 ? USCITA_DISSOLVENZA + (ENTRATA_DISSOLVENZA - USCITA_DISSOLVENZA) * velo : USCITA_DISSOLVENZA
  if (a <= dentro) return 1
  if (a >= fuori) return 0
  const v = 1 - (a - dentro) / (fuori - dentro)
  return v * v * (3 - 2 * v)
}

/**
 * Se il pezzo va disegnato. Segue la stessa asimmetria dell'opacita: oltre il
 * suo orizzonte non e solo trasparente, non esiste — e un pezzo che resta
 * visibile in fondo alla fila trasforma il fiume in una lista, e la lista non
 * ha profondita.
 */
export function pezzoVisibile(d: number, velo = 1): boolean {
  return Math.abs(d) < orizzonte(d, velo)
}

/** La camera. Fissa: cambia solo con il formato dello schermo. */
export function camera(comp: Composizione, posOut: THREE.Vector3, miraOut: THREE.Vector3): void {
  if (comp.aspetto < 1) {
    /*
     * In verticale il campo orizzontale si stringe moltissimo: con `fov 38°` e
     * un rapporto 0,46 la mezza larghezza inquadrata vale solo `0.16 · d`. Con
     * la distanza del formato orizzontale il pezzo sborderebbe.
     *
     * Quindi la camera arretra e il punto di mira scende sotto il piano: e cosi
     * che l'oggetto sale nel terzo superiore, sopra la scheda che occupa la
     * meta bassa. Non e un adattamento, e un'inquadratura diversa — come fra
     * orizzontale e verticale in fotografia.
     */
    posOut.set(0, 1.35, 7.1)
    miraOut.set(0, -0.52, 0)
    return
  }

  posOut.set(0, 0.76, 4.35)
  miraOut.set(0, 0.52, 0)
}


