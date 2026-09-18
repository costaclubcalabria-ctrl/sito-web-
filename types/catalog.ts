/**
 * Tipi del catalogo.
 *
 * Regola che vale ovunque nel progetto: **il denaro e sempre in centesimi
 * interi**. Nessun `number` con la virgola tocca mai un prezzo. La formattazione
 * in euro avviene solo al momento di stampare a schermo (`lib/format.ts`).
 */

export type CategoryId = 'decor' | 'illuminazione' | 'scrittoio' | 'personalizzati'

export interface Category {
  id: CategoryId
  nome: string
  descrizione: string
  /** Ordine nei filtri del catalogo. */
  ordine: number
}

/** Un colore selezionabile sul viewer 3D. I parametri PBR sono quelli reali. */
export interface MaterialColor {
  id: string
  nome: string
  /** Colore base del materiale, usato sia nella UI sia nella scena 3D. */
  hex: string
  /** 0 = specchio, 1 = completamente opaco. */
  ruvidita: number
  /** 0 = dielettrico (plastica), 1 = metallo. Le plastiche stanno a 0. */
  metallicita: number
  /** Da 0 a 1. Sopra 0 il materiale lascia passare la luce (PETG, resine). */
  trasmissione?: number
}

export interface Material {
  id: string
  nome: string
  descrizione: string
  colori: MaterialColor[]
  /** Sovrapprezzo in centesimi rispetto al prezzo base della variante. */
  sovrapprezzoCent: number
}

export interface Variant {
  id: string
  nome: string
  /** Larghezza, profondita, altezza in millimetri. */
  dimensioniMm: readonly [number, number, number]
  /** Prezzo base in centesimi, materiale escluso. */
  prezzoCent: number
  pesoG: number
  sku: string
}

/**
 * Descrizione della primitiva procedurale usata come segnaposto finche il GLB
 * reale non esiste. Serve a costruire e collaudare l'intera scena prima di
 * avere i modelli: e anche la rete di sicurezza se un GLB manca in produzione.
 */
export interface Placeholder {
  kind: 'lathe' | 'shell' | 'knot' | 'prism' | 'plate' | 'busto' | 'blocco'
  /** Determina la forma: stesso seed, stessa geometria, sempre. */
  seed: number
  /** Altezza indicativa in unita di scena (1 unita = 10 cm). */
  altezza: number
}

export interface ProductModel {
  /**
   * Materiale e colore con cui il pezzo viene mostrato in scena.
   *
   * Non è un dettaglio estetico: la scena ha un fondo **chiaro**, e un pezzo
   * in "bianco gesso" su uno strato di gesso semplicemente non si vede. Il
   * colore di presentazione è una scelta di ogni prodotto, e va scelto in
   * contrasto con lo strato su cui compare.
   */
  colore: { materiale: string; colore: string }
  /** Percorso sotto /public/models. Se il file non esiste si usa il segnaposto. */
  glb: string
  /** Immagine di fallback, stesso inquadramento del render 3D. */
  poster: string
  /** Fattore di scala da applicare al GLB per portarlo nelle unita di scena. */
  scala: number
  segnaposto: Placeholder
}

export interface Spec {
  etichetta: string
  valore: string
}

export interface Product {
  slug: string
  nome: string
  sottotitolo: string
  categoria: CategoryId
  /** Il testo che Google legge. Renderizzato lato server, mai dentro il canvas. */
  descrizione: string
  /** Colonne di micro-testo tecnico in maiuscolo (DESIGN.md §1.3). */
  specifiche: Spec[]
  /** La prima variante e quella predefinita. */
  varianti: Variant[]
  /** Id da `data/materials.ts`. Il primo e quello predefinito. */
  materiali: string[]
  /** Intervallo giorni lavorativi di produzione. */
  tempiProduzioneGiorni: readonly [number, number]
  disponibileSubito: boolean
  modello: ProductModel
  /** Posizione nella sequenza di scroll della home. */
  ordine: number
}

/** Una riga di carrello. Nota: **nessun prezzo**. Vedi PLAN.md §2.3. */
export interface CartLine {
  productSlug: string
  variantId: string
  materialId: string
  colorId: string
  qty: number
}
