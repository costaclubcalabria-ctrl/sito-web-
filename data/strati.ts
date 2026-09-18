/**
 * ============================================================================
 * GLI STRATI
 * ============================================================================
 *
 * Non è una palette: è una **sezione stratigrafica**.
 *
 * La pagina è una carota geologica. Si comincia in superficie, nella luce, e
 * scendendo si attraversano strati sempre più profondi e più scuri, fino al
 * basalto del footer. La posizione nello scroll non è una percentuale: è una
 * **profondità in millimetri**, la stessa unità con cui si misura l'altezza di
 * una stampa.
 *
 * Ogni colore ha un nome di materiale reale, e non per vezzo: terracotta,
 * sabbia, ardesia e ocra sono colori di filamento che produciamo davvero. La
 * palette del sito e la palette del catalogo sono la stessa cosa.
 *
 * ⚠️ Il contrasto non è negoziabile: ogni strato dichiara il proprio colore di
 * testo, e il rapporto è verificato (ultima colonna della tabella in
 * DESIGN.md §4). Gli strati chiari portano inchiostro, quelli profondi portano
 * carta. Il punto in cui si inverte è tra ocra e terracotta, e il codice non
 * deve poter sbagliare: è scritto qui, non deciso in ogni componente.
 */

export interface Strato {
  id: string
  /** Il nome del materiale. Compare nell'indicatore di profondità. */
  nome: string
  /** Profondità a cui comincia questo strato, in millimetri. */
  profonditaMm: number
  /** Colore dello strato. */
  bg: string
  /** Inchiostro o carta: lo decide lo strato, non il componente. */
  scuro: boolean
}

/** La sezione completa, dalla superficie al basalto. */
export const STRATI: readonly Strato[] = [
  { id: 'gesso', nome: 'Gesso', profonditaMm: 0, bg: '#EDE7DA', scuro: false },
  { id: 'sabbia', nome: 'Sabbia', profonditaMm: 40, bg: '#E0D3B8', scuro: false },
  { id: 'ocra', nome: 'Ocra', profonditaMm: 96, bg: '#CFA65B', scuro: false },
  { id: 'terracotta', nome: 'Terracotta', profonditaMm: 152, bg: '#A4542F', scuro: true },
  { id: 'ardesia', nome: 'Ardesia', profonditaMm: 196, bg: '#3F464F', scuro: true },
  { id: 'basalto', nome: 'Basalto', profonditaMm: 240, bg: '#23262B', scuro: true },
] as const

/** Profondità totale della sezione. È il fondo scala dell'indicatore. */
export const PROFONDITA_MAX = 240

export function strato(id: string): Strato {
  const s = STRATI.find((x) => x.id === id)
  if (!s) throw new Error(`Strato sconosciuto: ${id}`)
  return s
}

/**
 * Interpola tra due strati. Serve alla sezione dei prodotti, il cui fondo
 * **si deposita** mentre si scorre: il colore non salta da uno strato al
 * successivo, ci arriva.
 */
export function misceleStrati(daId: string, aId: string, t: number): string {
  const a = strato(daId).bg
  const b = strato(aId).bg
  const k = t < 0 ? 0 : t > 1 ? 1 : t

  const ca = leggiHex(a)
  const cb = leggiHex(b)

  // Miscela in spazio lineare: in sRGB diretto due colori caldi passano per un
  // marrone spento che non esiste in nessuno dei due.
  const m = (i: number) => {
    const x = srgbLineare(ca[i] ?? 0)
    const y = srgbLineare(cb[i] ?? 0)
    return lineareSrgb(x + (y - x) * k)
  }

  return `rgb(${m(0)} ${m(1)} ${m(2)})`
}

function leggiHex(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const srgbLineare = (c: number) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

const lineareSrgb = (v: number) => {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, c)) * 255)
}

/** Da progresso di scroll (0→1) a profondità in millimetri. */
export function profonditaMm(progresso: number): number {
  const p = progresso < 0 ? 0 : progresso > 1 ? 1 : progresso
  return Math.round(p * PROFONDITA_MAX)
}
