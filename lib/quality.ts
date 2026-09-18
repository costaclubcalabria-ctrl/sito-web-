/**
 * Profili di qualità — DESIGN.md §9.
 *
 * Il principio: non si adatta la grafica *dopo* aver misurato un calo, si parte
 * già dal profilo giusto e si **scala di un livello senza mai risalire**.
 * L'oscillazione tra profili è più fastidiosa del profilo basso.
 */

export type QualityTier = 'high' | 'medium' | 'low'

export interface QualitySettings {
  tier: QualityTier
  /** Limite superiore al device pixel ratio. */
  dpr: [number, number]
  /**
   * L'ombra di contatto.
   * Su fondo chiaro è l'elemento che appoggia il pezzo su un piano: senza,
   * un oggetto è un ritaglio incollato. Per questo non si spegne mai del tutto
   * fino al profilo basso, dove il 3D non c'è comunque.
   */
  ombre: 'soft' | 'contact' | 'none'
  /** Superfici realmente rifrangenti ammesse in scena. 0 = vetro finto. */
  vetroRifrangente: number
  /** Pezzi sulla linea. 0 = nessun 3D, si usa il fallback statico. */
  maxOggetti: number
  antialias: boolean
  /** La prima stampa automatica all'apertura. */
  genesi: boolean
  /**
   * Risoluzione della mappa d'ambiente procedurale, 0 = spenta.
   * È il parametro che più cambia la resa dei materiali: senza, una superficie
   * satinata non ha niente da riflettere e sembra gesso.
   */
  ambiente: number
}

const PROFILI: Record<QualityTier, QualitySettings> = {
  high: {
    tier: 'high', dpr: [1, 2], ombre: 'soft', vetroRifrangente: 1,
    maxOggetti: 8, antialias: true, genesi: true, ambiente: 256,
  },
  medium: {
    tier: 'medium', dpr: [1, 1.5], ombre: 'contact', vetroRifrangente: 0,
    maxOggetti: 4, antialias: true, genesi: true, ambiente: 128,
  },
  low: {
    tier: 'low', dpr: [1, 1], ombre: 'none', vetroRifrangente: 0,
    maxOggetti: 0, antialias: false, genesi: false, ambiente: 0,
  },
}

export function settingsFor(tier: QualityTier): QualitySettings {
  return PROFILI[tier]
}

const ORDINE: QualityTier[] = ['high', 'medium', 'low']

/** Il profilo immediatamente inferiore, o lo stesso se siamo già in fondo. */
export function declassa(tier: QualityTier): QualityTier {
  const i = ORDINE.indexOf(tier)
  return ORDINE[Math.min(i + 1, ORDINE.length - 1)] ?? 'low'
}

const CHIAVE_FORZATURA = 'strato:qualita'

function isTier(v: string | null): v is QualityTier {
  return v === 'high' || v === 'medium' || v === 'low'
}

function leggiForzatura(): QualityTier | null {
  try {
    const daUrl = new URLSearchParams(window.location.search).get('qualita')
    if (isTier(daUrl)) {
      window.localStorage.setItem(CHIAVE_FORZATURA, daUrl)
      return daUrl
    }
    const salvato = window.localStorage.getItem(CHIAVE_FORZATURA)
    return isTier(salvato) ? salvato : null
  } catch {
    return null
  }
}

/** Imposta (o azzera, con `null`) la forzatura del profilo. */
export function forzaTier(tier: QualityTier | null): void {
  try {
    if (tier) window.localStorage.setItem(CHIAVE_FORZATURA, tier)
    else window.localStorage.removeItem(CHIAVE_FORZATURA)
  } catch {
    /* non bloccante */
  }
}

interface NavigatorConHint extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

/**
 * Stima il profilo iniziale. È una stima, non una diagnosi: il monitor a runtime
 * la corregge in 2 secondi se ha sbagliato. Meglio partire ottimisti su desktop
 * e prudenti su mobile, perché declassare è invisibile e promuovere no.
 */
export function rilevaTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium'

  // Forzatura manuale: `?qualita=high|medium|low` nell'URL, oppure la scelta
  // salvata dal controllo nel footer. Serve per collaudare i tre profili su una
  // macchina sola — e per chi vuole decidere da sé invece di subire la stima.
  const forzato = leggiForzatura()
  if (forzato) return forzato

  if (!supportaWebGL()) return 'low'

  const nav = navigator as NavigatorConHint

  // Chi ha chiesto meno movimento o sta risparmiando dati non vuole il massimo.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low'
  if (nav.connection?.saveData) return 'low'

  const cores = nav.hardwareConcurrency ?? 4
  const memoria = nav.deviceMemory ?? 4
  const touch = window.matchMedia('(pointer: coarse)').matches
  const lato = Math.min(window.innerWidth, window.innerHeight)

  if (cores <= 4 || memoria <= 2) return 'low'
  if (touch) return cores >= 8 && memoria >= 6 ? 'medium' : 'low'
  if (lato < 640) return 'medium'

  return cores >= 8 && memoria >= 8 ? 'high' : 'medium'
}

let cacheWebGL: boolean | null = null

/**
 * Verifica reale del contesto WebGL. Il risultato è in cache: creare un contesto
 * di prova non è gratuito e su alcuni dispositivi i contesti sono contati.
 */
export function supportaWebGL(): boolean {
  if (cacheWebGL !== null) return cacheWebGL
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    cacheWebGL = gl !== null
    // Libera subito il contesto di prova: non ci serve, e i contesti sono scarsi.
    if (gl && 'getExtension' in gl) gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cacheWebGL = false
  }

  return cacheWebGL
}

/** L'utente ha chiesto meno movimento. Vale sia per il DOM sia per la scena. */
export function preferisceMenoMovimento(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Il sito deve rinunciare del tutto al 3D?
 * In questo caso il fallback statico non è una pagina d'emergenza: è lo stesso
 * sito, fermo, con i poster al posto del canvas. DESIGN.md §9.
 */
export function modalitaStatica(): boolean {
  return !supportaWebGL() || preferisceMenoMovimento()
}
