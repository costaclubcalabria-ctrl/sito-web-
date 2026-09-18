/**
 * La matematica della sequenza della home.
 *
 * Sta qui, e **non** in `components/three/scenes/percorso.ts`, per un motivo
 * preciso: questo modulo non importa nulla. `percorso.ts` importa `three`, e
 * `HomeSequence` — che è un componente del bundle iniziale — ha bisogno di
 * queste tre funzioni. Tenendole nello stesso file della coreografia, `three`
 * finiva nel chunk iniziale insieme a loro: 140 KB gzip scaricati anche da chi
 * il 3D non lo vedrà mai.
 *
 * Regola: se una cosa serve sia al DOM sia alla scena, vive qui.
 */

/** Il momento in cui l'oggetto i-esimo è pienamente a fuoco. */
export function centroFuoco(i: number): number {
  return 0.3 + i * 0.2
}

/**
 * Quanto l'oggetto i-esimo è "a fuoco", da 0 a 1.
 *
 * Le finestre si sovrappongono: mentre uno esce, l'altro è già entrato. È ciò
 * che rende il passaggio continuo invece di una successione di stacchi
 * (DESIGN.md §6, regola 1).
 */
export function fuoco(i: number, t: number): number {
  const d = Math.abs(t - centroFuoco(i)) / 0.17
  if (d >= 1) return 0
  // Coseno rialzato: salita e discesa morbide, nessuno spigolo.
  return 0.5 + 0.5 * Math.cos(Math.PI * d)
}

/**
 * Opacità del **pannello di testo**, derivata dal fuoco ma molto più decisa.
 *
 * La scena 3D deve restare continua, ma il testo no: due schede in dissolvenza
 * incrociata si sovrappongono e non si legge né l'una né l'altra. Su mobile,
 * dove i pannelli occupano la stessa area, è illeggibile.
 *
 * Quindi: gli oggetti si passano il testimone con calma, le parole si alternano
 * in fretta.
 */
export function opacitaPannello(f: number): number {
  const v = (f - 0.42) / 0.36
  if (v <= 0) return 0
  if (v >= 1) return 1
  return v * v * (3 - 2 * v)
}
