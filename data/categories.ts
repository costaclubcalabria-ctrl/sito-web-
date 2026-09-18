import type { Category, CategoryId } from '@/types/catalog'

export const CATEGORIES: readonly Category[] = [
  {
    id: 'decor',
    nome: 'Decor',
    descrizione: 'Oggetti che cambiano una stanza senza occuparla.',
    ordine: 1,
  },
  {
    id: 'illuminazione',
    nome: 'Illuminazione',
    descrizione: 'La luce attraversa gli strati. È il vantaggio della stampa 3D, non un effetto.',
    ordine: 2,
  },
  {
    id: 'scrittoio',
    nome: 'Scrittoio',
    descrizione: 'Oggetti che si usano ogni giorno e si guardano lo stesso.',
    ordine: 3,
  },
  {
    id: 'personalizzati',
    nome: 'Regali personalizzati',
    descrizione: 'Un nome, una data, una forma. Stampati per una persona sola.',
    ordine: 4,
  },
] as const

export function getCategory(id: CategoryId): Category {
  const found = CATEGORIES.find((c) => c.id === id)
  if (!found) throw new Error(`Categoria sconosciuta: ${id}`)
  return found
}
