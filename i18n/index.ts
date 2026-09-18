import { it } from './it'

/**
 * Accesso alle stringhe. Oggi è un semplice re-export del dizionario italiano:
 * `t.hero.titolo` è tipizzato, autocompletato, e una chiave inesistente non
 * compila. Zero costo a runtime.
 *
 * Quando arriverà l'inglese, questo file diventa la funzione che sceglie il
 * dizionario in base al locale, e **nessun componente cambia**.
 */
export const t = it

export type { Dizionario } from './it'

/** Sostituisce i segnaposto `{nome}` in una stringa del dizionario. */
export function interpola(testo: string, valori: Record<string, string | number>): string {
  return testo.replace(/\{(\w+)\}/g, (intero, chiave: string) => {
    const v = valori[chiave]
    return v === undefined ? intero : String(v)
  })
}

/**
 * Divide un titolo che contiene `**una parola**` nelle tre parti prima/enfasi/dopo.
 * L'enfasi è resa in Instrument Serif corsivo: una sola per titolo (DESIGN.md §5.2).
 */
export function spezzaEnfasi(titolo: string): { prima: string; enfasi: string; dopo: string } {
  const m = /^(.*?)\*\*(.+?)\*\*(.*)$/s.exec(titolo)
  if (!m) return { prima: titolo, enfasi: '', dopo: '' }
  return { prima: m[1] ?? '', enfasi: m[2] ?? '', dopo: m[3] ?? '' }
}
