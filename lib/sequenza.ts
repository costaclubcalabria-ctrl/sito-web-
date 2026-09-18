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
/**
 * Quanto è **stampato** l'oggetto i-esimo, da 0 a 1.
 *
 * È il cuore del sito: lo scroll non muove un oggetto già finito, lo
 * **deposita**. Scendendo di un millimetro si aggiunge uno strato; risalendo si
 * torna indietro. Non è un'animazione che parte e finisce, è una funzione della
 * posizione — quindi obbedisce al dito, sempre (DESIGN.md §6, regola 2).
 *
 * La finestra di stampa si apre prima del fuoco e si chiude quando l'oggetto è
 * pienamente a fuoco: quando lo leggi, è finito.
 */
export function stampa(i: number, t: number): number {
  const centro = centroFuoco(i)
  // ⚠️ Questa finestra deve stare **dentro la sosta** della linea
  // (`percorso.ts`, `conSosta`): un pezzo che si stampa mentre trasla e
  // fisicamente assurdo e si nota subito. Con sosta 0.36 in unita di indice,
  // il pezzo e fermo per |t - centro| <= 0.072: la stampa sta dentro.
  const inizio = centro - 0.068
  const fine = centro - 0.012
  if (t <= inizio) return 0
  if (t >= fine) return 1
  const v = (t - inizio) / (fine - inizio)
  // Lineare di proposito: una stampa deposita strati a velocità costante, e
  // un'accelerazione qui si leggerebbe come un difetto della macchina.
  return v
}

export function opacitaPannello(f: number): number {
  const v = (f - 0.42) / 0.36
  if (v <= 0) return 0
  if (v >= 1) return 1
  return v * v * (3 - 2 * v)
}
