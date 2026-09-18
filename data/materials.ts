import type { Material } from '@/types/catalog'

/**
 * Materiali e colori disponibili.
 *
 * I parametri PBR (ruvidità, metallicità, trasmissione) sono usati **sia**
 * dalla pastiglia di colore nella UI **sia** dal materiale nella scena 3D:
 * una sola fonte, nessuna possibilità che schermo e modello divergano.
 *
 * SEGNAPOSTO: prezzi e finiture da confermare con il cliente.
 */
export const MATERIALS: readonly Material[] = [
  {
    id: 'pla-opaco',
    nome: 'PLA opaco',
    descrizione: 'Finitura matte, tatto asciutto. Il materiale predefinito: stabile, preciso, di origine vegetale.',
    sovrapprezzoCent: 0,
    colori: [
      { id: 'gesso', nome: 'Bianco gesso', hex: '#E8E4DC', ruvidita: 0.85, metallicita: 0 },
      { id: 'grafite', nome: 'Nero grafite', hex: '#1C1C1E', ruvidita: 0.8, metallicita: 0 },
      { id: 'terracotta', nome: 'Terracotta', hex: '#C4674A', ruvidita: 0.85, metallicita: 0 },
      { id: 'salvia', nome: 'Salvia', hex: '#9CA88F', ruvidita: 0.85, metallicita: 0 },
      { id: 'notte', nome: 'Blu notte', hex: '#2A3550', ruvidita: 0.8, metallicita: 0 },
    ],
  },
  {
    id: 'pla-tinta',
    nome: 'PLA tinta piena',
    descrizione:
      'Colore saturo, coprente, senza sfumature. È la finitura che rende un oggetto un oggetto di design invece di un pezzo tecnico: il colore non decora la forma, la definisce.',
    sovrapprezzoCent: 200,
    colori: [
      { id: 'blu-cobalto', nome: 'Blu cobalto', hex: '#3E6EA8', ruvidita: 0.78, metallicita: 0 },
      { id: 'rosso-segnale', nome: 'Rosso segnale', hex: '#D8341F', ruvidita: 0.78, metallicita: 0 },
      { id: 'giallo-zolfo', nome: 'Giallo zolfo', hex: '#E8B226', ruvidita: 0.78, metallicita: 0 },
      { id: 'rosa-cipria', nome: 'Rosa cipria', hex: '#E29BA6', ruvidita: 0.8, metallicita: 0 },
      { id: 'verde-acido', nome: 'Verde acido', hex: '#8FBF3F', ruvidita: 0.78, metallicita: 0 },
      { id: 'arancio-bruciato', nome: 'Arancio bruciato', hex: '#E0682A', ruvidita: 0.78, metallicita: 0 },
      { id: 'grigio-cemento', nome: 'Grigio cemento', hex: '#9A9A9E', ruvidita: 0.85, metallicita: 0 },
      { id: 'bianco-latte', nome: 'Bianco latte', hex: '#F0EDE8', ruvidita: 0.85, metallicita: 0 },
      { id: 'nero-antracite', nome: 'Nero antracite', hex: '#23242A', ruvidita: 0.8, metallicita: 0 },
    ],
  },
  {
    id: 'pla-seta',
    nome: 'PLA seta',
    descrizione: 'Finitura satinata che riflette la luce lungo gli strati. Il processo diventa visibile.',
    sovrapprezzoCent: 300,
    colori: [
      { id: 'oro', nome: 'Oro', hex: '#C9A227', ruvidita: 0.25, metallicita: 0.6 },
      { id: 'rame', nome: 'Rame', hex: '#B06A3B', ruvidita: 0.28, metallicita: 0.6 },
      { id: 'perla', nome: 'Perla', hex: '#DCD6C8', ruvidita: 0.3, metallicita: 0.35 },
    ],
  },
  {
    id: 'petg',
    nome: 'PETG traslucido',
    descrizione: 'Lascia passare la luce. Pensato per le lampade e per chi vuole vedere dentro l’oggetto.',
    sovrapprezzoCent: 500,
    colori: [
      { id: 'ambra', nome: 'Ambra', hex: '#E8A33D', ruvidita: 0.15, metallicita: 0, trasmissione: 0.7 },
      { id: 'ghiaccio', nome: 'Ghiaccio', hex: '#BFD9E0', ruvidita: 0.12, metallicita: 0, trasmissione: 0.75 },
      { id: 'fumo', nome: 'Fumo', hex: '#6E6A78', ruvidita: 0.2, metallicita: 0, trasmissione: 0.5 },
    ],
  },
  {
    id: 'resina',
    nome: 'Resina',
    descrizione: 'Strati da 25 micron: il dettaglio più fine che produciamo. Per incisioni e superfici piccole.',
    sovrapprezzoCent: 1200,
    colori: [
      { id: 'pietra', nome: 'Grigio pietra', hex: '#8A8A8F', ruvidita: 0.5, metallicita: 0 },
      { id: 'avorio', nome: 'Avorio', hex: '#EDE6D6', ruvidita: 0.45, metallicita: 0 },
    ],
  },
] as const

export function getMaterial(id: string): Material {
  const found = MATERIALS.find((m) => m.id === id)
  if (!found) throw new Error(`Materiale sconosciuto: ${id}`)
  return found
}

export function getColor(materialId: string, colorId: string) {
  const material = getMaterial(materialId)
  const color = material.colori.find((c) => c.id === colorId)
  if (!color) throw new Error(`Colore sconosciuto: ${materialId}/${colorId}`)
  return color
}
