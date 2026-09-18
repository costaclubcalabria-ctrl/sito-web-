/**
 * La matematica del fiume.
 *
 * Sta qui, e non in `components/three/scenes/percorso.ts`, per un motivo
 * preciso: questo modulo non importa nulla. `percorso.ts` importa `three`, e il
 * componente DOM che muove le schede ha bisogno delle stesse funzioni. Tenendole
 * insieme, `three` finiva nel chunk iniziale: 140 KB gzip scaricati anche da
 * chi il 3D non lo vedra mai.
 *
 * Regola: se una cosa serve sia al DOM sia alla scena, vive qui.
 *
 * ============================================================================
 * IL FIUME
 * ============================================================================
 *
 * I pezzi stanno su una fila che scorre in continuo davanti a una camera fissa.
 * `s` e la posizione della fila: a `s = 0` il primo pezzo e al punto di posa, a
 * `s = 1` il secondo, e cosi via. Non ci sono soste e non ci sono dissolvenze
 * incrociate — la fila non si ferma mai.
 *
 * `d = i - s` e la **distanza in slot** del pezzo i dal punto di posa: 0 al
 * centro, negativo quando e gia passato, positivo quando sta arrivando. Tutto
 * quello che riguarda un pezzo — dove sta, quanto e grande, quanto si vede la
 * sua scheda — e una funzione di `d`, e nient'altro.
 *
 * E' questa la ragione per cui pezzo e scheda non possono desincronizzarsi:
 * leggono **lo stesso numero**.
 */

/** Dove comincia la fila: il primo pezzo e ancora a destra, accanto al titolo. */
export const S_INIZIO = -0.62

/**
 * Distanza fra un pezzo e il successivo, in unita di scena.
 *
 * Vive qui e non in `percorso.ts` perche serve a **entrambi** i lati: la scena
 * per posizionare i pezzi, il DOM per far scorrere le schede alla stessa
 * velocita. Era duplicato, ed era il tipo di duplicazione che un giorno si
 * disallinea e nessuno capisce perche il testo e in ritardo sull'oggetto.
 */
export const PASSO_X = 2.6

/** Il campo verticale inquadrato dalla camera, in unita di scena. */
export function altezzaInquadrata(aspetto: number): number {
  const fov = 38
  const dist = aspetto < 1 ? 7.1 : 4.35
  return 2 * Math.tan(((fov / 2) * Math.PI) / 180) * dist
}

/** Quanti pixel vale un'unita di scena al punto di posa. */
export function pixelPerUnita(altezzaViewport: number, aspetto: number): number {
  return altezzaViewport / altezzaInquadrata(aspetto)
}

/** Distanza in slot del pezzo i dal punto di posa. */
export function distanza(i: number, s: number): number {
  return i - s
}

/** Il progresso di scroll (0→1) diventa posizione della fila. */
export function posizioneFila(progresso: number, pezzi: number): number {
  const p = progresso < 0 ? 0 : progresso > 1 ? 1 : progresso
  // Si arriva un po oltre l'ultimo pezzo, cosi anche l'ultimo esce di scena
  // invece di restare fermo al centro alla fine della corsa.
  const fine = pezzi - 1 + 0.45
  return S_INIZIO + p * (fine - S_INIZIO)
}

/**
 * Opacita della scheda di un pezzo.
 *
 * Si vede solo la scheda del pezzo vicino al punto di posa. La finestra e
 * volutamente **stretta**: due schede leggibili insieme non si leggono ne l'una
 * ne l'altra, e su schermo stretto si sovrappongono. Mentre una scivola via,
 * l'altra sta arrivando — la continuita la fa il movimento, non la dissolvenza.
 */
export function opacitaScheda(d: number): number {
  const a = Math.abs(d)
  /*
   * ⚠️ Questa finestra non e' arbitraria: e' piu **stretta** del tratto in cui
   * il pezzo resta inquadrato.
   *
   * Il punto di posa e' spostato a sinistra (la scheda occupa la destra),
   * quindi al pezzo restano circa 1,35 unita prima del bordo sinistro — cioe
   * 0,44 slot. Con una finestra piu larga la scheda era ancora leggibile al
   * centro dello schermo mentre il suo pezzo era gia uscito dall'inquadratura:
   * testo e oggetto raccontavano due cose diverse.
   *
   * Cambiare `posa` o `PASSO_X` in percorso.ts significa ricontrollare questo
   * numero.
   */
  if (a >= 0.44) return 0
  if (a <= 0.2) return 1
  const v = 1 - (a - 0.2) / 0.24
  return v * v * (3 - 2 * v)
}

/** Quanto un pezzo e "a fuoco": serve a luce, scala e priorita. */
export function fuoco(d: number): number {
  const a = Math.abs(d)
  if (a >= 1) return 0
  const v = 1 - a
  return v * v * (3 - 2 * v)
}

/** Il pezzo piu vicino al punto di posa, o -1 se nessuno e abbastanza vicino. */
export function indiceAFuoco(s: number, pezzi: number): number {
  const i = Math.round(s)
  if (i < 0 || i >= pezzi) return -1
  return i
}
