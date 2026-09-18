import { getProduct } from '@/data/products'
import { getMaterial } from '@/data/materials'
import { costoSpedizioneCent } from '@/data/shipping'
import type { CartLine } from '@/types/catalog'

/**
 * Calcolo dei prezzi.
 *
 * Questo modulo gira **sia nel client sia nel server**, ed è deliberato: una
 * sola implementazione significa che il totale mostrato a schermo e quello
 * addebitato non possono divergere. Ma l'autorità resta il server — il client
 * non invia mai un importo, invia solo `{slug, variantId, materialId, qty}`.
 * Vedi PLAN.md §2.3.
 */

export interface RigaCalcolata {
  line: CartLine
  nomeProdotto: string
  nomeVariante: string
  nomeMateriale: string
  nomeColore: string
  /** Prezzo di un singolo pezzo, materiale incluso. */
  unitarioCent: number
  /** unitarioCent × qty */
  totaleCent: number
  sku: string
  slug: string
}

export class PriceError extends Error {}

/** Espande una riga di carrello nei suoi dati reali. Lancia se la riga non è valida. */
export function calcolaRiga(line: CartLine): RigaCalcolata {
  const product = getProduct(line.productSlug)
  if (!product) throw new PriceError(`Prodotto inesistente: ${line.productSlug}`)

  const variante = product.varianti.find((v) => v.id === line.variantId)
  if (!variante) throw new PriceError(`Variante inesistente: ${line.productSlug}/${line.variantId}`)

  if (!product.materiali.includes(line.materialId)) {
    throw new PriceError(`Materiale non disponibile per ${line.productSlug}: ${line.materialId}`)
  }
  const materiale = getMaterial(line.materialId)

  const colore = materiale.colori.find((c) => c.id === line.colorId)
  if (!colore) throw new PriceError(`Colore inesistente: ${line.materialId}/${line.colorId}`)

  if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > MAX_QTY) {
    throw new PriceError(`Quantità non valida: ${line.qty}`)
  }

  const unitarioCent = variante.prezzoCent + materiale.sovrapprezzoCent

  return {
    line,
    nomeProdotto: product.nome,
    nomeVariante: variante.nome,
    nomeMateriale: materiale.nome,
    nomeColore: colore.nome,
    unitarioCent,
    totaleCent: unitarioCent * line.qty,
    sku: variante.sku,
    slug: product.slug,
  }
}

export const MAX_QTY = 20
export const MAX_RIGHE = 30

export interface Totali {
  righe: RigaCalcolata[]
  subtotaleCent: number
  spedizioneCent: number
  totaleCent: number
  pezzi: number
}

/** Ricalcola un intero carrello dai soli identificativi. È ciò che usa il server. */
export function calcolaTotali(lines: readonly CartLine[]): Totali {
  if (lines.length > MAX_RIGHE) throw new PriceError('Carrello troppo grande')

  const righe = lines.map(calcolaRiga)
  const subtotaleCent = righe.reduce((s, r) => s + r.totaleCent, 0)
  const spedizioneCent = costoSpedizioneCent(subtotaleCent)

  return {
    righe,
    subtotaleCent,
    spedizioneCent,
    totaleCent: subtotaleCent + spedizioneCent,
    pezzi: righe.reduce((s, r) => s + r.line.qty, 0),
  }
}

/** Prezzo unitario di una combinazione, per l'aggiornamento dal vivo in pagina prodotto. */
export function prezzoUnitarioCent(slug: string, variantId: string, materialId: string): number {
  return calcolaRiga({ productSlug: slug, variantId, materialId, colorId: firstColorId(materialId), qty: 1 }).unitarioCent
}

function firstColorId(materialId: string): string {
  const colore = getMaterial(materialId).colori[0]
  if (!colore) throw new PriceError(`Materiale senza colori: ${materialId}`)
  return colore.id
}
