/** Formattazione per il mercato italiano. Un solo posto, nessuna divergenza. */

const EUR = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
})

/** Da centesimi interi a "39,00 €". Mai fare questa conversione a mano altrove. */
export function euro(cent: number): string {
  return EUR.format(cent / 100)
}

/** "3-5 giorni lavorativi" oppure "3 giorni lavorativi" se l'intervallo è chiuso. */
export function giorniLavorativi([min, max]: readonly [number, number]): string {
  return min === max ? `${min} giorni lavorativi` : `${min}-${max} giorni lavorativi`
}

/** "110 × 110 × 140 mm" — con il segno di moltiplicazione vero, non la x. */
export function dimensioni([l, p, h]: readonly [number, number, number]): string {
  return `${l} × ${p} × ${h} mm`
}

/** "01", "02"... per i numerali d'indice (DESIGN.md §1.3). */
export function indice(n: number): string {
  return String(n).padStart(2, '0')
}
