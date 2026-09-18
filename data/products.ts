import type { CategoryId, Product } from '@/types/catalog'

/**
 * ============================================================================
 * FONTE DI VERITÀ DEI PREZZI
 * ============================================================================
 *
 * Questo file è l'unica autorità sui prezzi, anche lato server. `/api/checkout`
 * ricalcola ogni importo da qui: un prezzo che arriva dal browser non viene
 * mai usato. Vedi PLAN.md §2.3.
 *
 * Sostituire questo file con un CMS significa reimplementare `getProducts()`
 * e nient'altro: nessun altro modulo importa i dati direttamente.
 *
 * ⚠️ SEGNAPOSTO — nomi, misure, pesi, prezzi e tempi sono verosimili ma
 * inventati. Vanno sostituiti con i dati reali prima del lancio.
 */

export const PRODUCTS: readonly Product[] = [
  // ---------------------------------------------------------------- decor ---
  {
    slug: 'vaso-onda',
    nome: 'Onda',
    sottotitolo: 'Vaso a sezione variabile',
    categoria: 'decor',
    descrizione:
      'Un vaso il cui profilo cambia a ogni giro. Gli strati non sono un difetto da nascondere: sono la superficie. Stampato in un pezzo unico, senza giunzioni, con parete continua a tenuta stagna. Adatto a fiori recisi e a rami secchi.',
    specifiche: [
      { etichetta: 'Stampa', valore: 'Pezzo unico, parete continua' },
      { etichetta: 'Strato', valore: '0,16 mm' },
      { etichetta: 'Tenuta', valore: 'Stagna, senza rivestimento' },
      { etichetta: 'Pulizia', valore: 'Acqua tiepida, no lavastoviglie' },
    ],
    varianti: [
      { id: 'medio', nome: 'Medio — 140 mm', dimensioniMm: [110, 110, 140], prezzoCent: 3900, pesoG: 180, sku: 'ONDA-M' },
      { id: 'piccolo', nome: 'Piccolo — 90 mm', dimensioniMm: [80, 80, 90], prezzoCent: 2900, pesoG: 95, sku: 'ONDA-S' },
      { id: 'grande', nome: 'Grande — 200 mm', dimensioniMm: [140, 140, 200], prezzoCent: 5400, pesoG: 310, sku: 'ONDA-L' },
    ],
    materiali: ['pla-opaco', 'pla-seta', 'petg'],
    tempiProduzioneGiorni: [3, 5],
    disponibileSubito: true,
    modello: { colore: { materiale: 'pla-opaco', colore: 'terracotta' }, glb: '/models/vaso-onda.glb', poster: '/posters/vaso-onda.webp', scala: 1, segnaposto: { kind: 'lathe', seed: 11, altezza: 1.4 } },
    ordine: 1,
  },
  {
    slug: 'portacandele-eclissi',
    nome: 'Eclissi',
    sottotitolo: 'Portacandele a schermo forato',
    categoria: 'decor',
    descrizione:
      'Uno schermo curvo forato che proietta la fiamma sulla parete. La trama dei fori segue la direzione di stampa, quindi l’ombra che genera è la mappa degli strati. Pensato per candele tealight standard.',
    specifiche: [
      { etichetta: 'Candela', valore: 'Tealight Ø 38 mm' },
      { etichetta: 'Fori', valore: '212, passanti' },
      { etichetta: 'Base', valore: 'Metallo, inclusa' },
      { etichetta: 'Avvertenza', valore: 'Mai fiamma libera a contatto' },
    ],
    varianti: [
      { id: 'singolo', nome: 'Singolo', dimensioniMm: [95, 95, 120], prezzoCent: 3200, pesoG: 120, sku: 'ECLI-1' },
      { id: 'coppia', nome: 'Coppia', dimensioniMm: [95, 95, 120], prezzoCent: 5600, pesoG: 240, sku: 'ECLI-2' },
    ],
    materiali: ['pla-opaco', 'pla-seta'],
    tempiProduzioneGiorni: [3, 5],
    disponibileSubito: true,
    modello: { colore: { materiale: 'pla-opaco', colore: 'grafite' }, glb: '/models/portacandele-eclissi.glb', poster: '/posters/portacandele-eclissi.webp', scala: 1, segnaposto: { kind: 'shell', seed: 23, altezza: 1.2 } },
    ordine: 2,
  },
  {
    slug: 'fermalibri-faglia',
    nome: 'Faglia',
    sottotitolo: 'Fermalibri, coppia',
    categoria: 'decor',
    descrizione:
      'Due blocchi che sembrano spezzati lungo la stessa frattura: avvicinati combaciano, separati tengono una mensola. Zavorra in sabbia di quarzo nella cavità interna, chiusa con tappo a scatto.',
    specifiche: [
      { etichetta: 'Contenuto', valore: 'Coppia, frattura speculare' },
      { etichetta: 'Zavorra', valore: '900 g complessivi' },
      { etichetta: 'Base', valore: 'Feltro antigraffio' },
      { etichetta: 'Tenuta', valore: 'Fino a ~40 volumi' },
    ],
    varianti: [{ id: 'coppia', nome: 'Coppia', dimensioniMm: [110, 90, 150], prezzoCent: 4800, pesoG: 1100, sku: 'FAGL-2' }],
    materiali: ['pla-opaco'],
    tempiProduzioneGiorni: [4, 6],
    disponibileSubito: true,
    modello: { colore: { materiale: 'pla-opaco', colore: 'salvia' }, glb: '/models/fermalibri-faglia.glb', poster: '/posters/fermalibri-faglia.webp', scala: 1, segnaposto: { kind: 'prism', seed: 37, altezza: 1.5 } },
    ordine: 3,
  },

  // -------------------------------------------------------- illuminazione ---
  {
    slug: 'lampada-duna',
    nome: 'Duna',
    sottotitolo: 'Lampada da tavolo',
    categoria: 'illuminazione',
    descrizione:
      'Il corpo è stampato in PETG traslucido a parete singola: la luce non esce da un’apertura, attraversa l’oggetto e rende visibile ogni strato. Dimmer a sfioro sulla base, alimentazione USB-C.',
    specifiche: [
      { etichetta: 'Sorgente', valore: 'LED 2700 K, 380 lm' },
      { etichetta: 'Alimentazione', valore: 'USB-C, cavo 1,5 m incluso' },
      { etichetta: 'Regolazione', valore: 'Dimmer a sfioro, 3 livelli' },
      { etichetta: 'Consumo', valore: '4,5 W' },
    ],
    varianti: [
      { id: 'tavolo', nome: 'Tavolo — 260 mm', dimensioniMm: [140, 140, 260], prezzoCent: 6900, pesoG: 420, sku: 'DUNA-T' },
      { id: 'comodino', nome: 'Comodino — 180 mm', dimensioniMm: [110, 110, 180], prezzoCent: 5400, pesoG: 280, sku: 'DUNA-C' },
    ],
    materiali: ['petg', 'pla-opaco'],
    tempiProduzioneGiorni: [5, 7],
    disponibileSubito: true,
    modello: { colore: { materiale: 'petg', colore: 'ambra' }, glb: '/models/lampada-duna.glb', poster: '/posters/lampada-duna.webp', scala: 1, segnaposto: { kind: 'lathe', seed: 53, altezza: 1.8 } },
    ordine: 4,
  },
  {
    slug: 'paralume-nimbo',
    nome: 'Nimbo',
    sottotitolo: 'Paralume a sospensione',
    categoria: 'illuminazione',
    descrizione:
      'Paralume a spirale continua da avvitare su portalampada standard. La spirale lascia filtrare la luce verso l’alto e la raccoglie verso il basso, senza abbagliare chi sta seduto sotto.',
    specifiche: [
      { etichetta: 'Attacco', valore: 'E27 o E14, a scelta' },
      { etichetta: 'Lampadina', valore: 'Solo LED, max 9 W' },
      { etichetta: 'Diametro', valore: '240 mm' },
      { etichetta: 'Montaggio', valore: 'A vite, senza attrezzi' },
    ],
    varianti: [
      { id: 'e27', nome: 'Attacco E27', dimensioniMm: [240, 240, 220], prezzoCent: 4200, pesoG: 190, sku: 'NIMB-27' },
      { id: 'e14', nome: 'Attacco E14', dimensioniMm: [200, 200, 190], prezzoCent: 3900, pesoG: 150, sku: 'NIMB-14' },
    ],
    materiali: ['petg', 'pla-opaco'],
    tempiProduzioneGiorni: [4, 6],
    disponibileSubito: true,
    modello: { colore: { materiale: 'pla-opaco', colore: 'notte' }, glb: '/models/paralume-nimbo.glb', poster: '/posters/paralume-nimbo.webp', scala: 1, segnaposto: { kind: 'shell', seed: 67, altezza: 1.6 } },
    ordine: 5,
  },

  // ------------------------------------------------------------ scrittoio ---
  {
    slug: 'portapenne-basalto',
    nome: 'Basalto',
    sottotitolo: 'Portapenne a colonne',
    categoria: 'scrittoio',
    descrizione:
      'Colonne esagonali di altezza diversa, come una formazione basaltica. Ogni colonna tiene uno strumento in verticale: le penne restano separate e si prendono una alla volta.',
    specifiche: [
      { etichetta: 'Scomparti', valore: '7 esagonali' },
      { etichetta: 'Profondità', valore: 'Da 60 a 110 mm' },
      { etichetta: 'Base', valore: 'Feltro antigraffio' },
      { etichetta: 'Peso', valore: '210 g, non si rovescia' },
    ],
    varianti: [
      { id: 'singolo', nome: 'Singolo', dimensioniMm: [95, 85, 110], prezzoCent: 2200, pesoG: 210, sku: 'BASA-1' },
      { id: 'doppio', nome: 'Doppio', dimensioniMm: [180, 85, 110], prezzoCent: 3400, pesoG: 390, sku: 'BASA-2' },
    ],
    materiali: ['pla-opaco', 'pla-seta'],
    tempiProduzioneGiorni: [2, 4],
    disponibileSubito: true,
    modello: { colore: { materiale: 'pla-seta', colore: 'rame' }, glb: '/models/portapenne-basalto.glb', poster: '/posters/portapenne-basalto.webp', scala: 1, segnaposto: { kind: 'prism', seed: 83, altezza: 1.1 } },
    ordine: 6,
  },
  {
    slug: 'fermacarte-quarzo',
    nome: 'Quarzo',
    sottotitolo: 'Fermacarte sfaccettato',
    categoria: 'scrittoio',
    descrizione:
      'Un solido a facce irregolari, zavorrato internamente. In PLA seta le facce riflettono la luce in direzioni diverse a seconda di come è appoggiato: non esiste un verso giusto.',
    specifiche: [
      { etichetta: 'Facce', valore: '18, irregolari' },
      { etichetta: 'Zavorra', valore: 'Acciaio, 320 g' },
      { etichetta: 'Appoggio', valore: 'Feltro su ogni faccia stabile' },
      { etichetta: 'Incisione', valore: 'Su richiesta, sulla faccia piana' },
    ],
    varianti: [{ id: 'unico', nome: 'Taglia unica', dimensioniMm: [70, 65, 60], prezzoCent: 1900, pesoG: 340, sku: 'QUAR-1' }],
    materiali: ['pla-seta', 'pla-opaco', 'resina'],
    tempiProduzioneGiorni: [2, 4],
    disponibileSubito: true,
    modello: { colore: { materiale: 'pla-seta', colore: 'oro' }, glb: '/models/fermacarte-quarzo.glb', poster: '/posters/fermacarte-quarzo.webp', scala: 1, segnaposto: { kind: 'knot', seed: 97, altezza: 0.8 } },
    ordine: 7,
  },

  // ------------------------------------------------------- personalizzati ---
  {
    slug: 'targa-orizzonte',
    nome: 'Orizzonte',
    sottotitolo: 'Targa con incisione in rilievo',
    categoria: 'personalizzati',
    descrizione:
      'Targa da parete o da appoggio con testo in rilievo, stampata in resina per tenere il dettaglio delle lettere piccole. Il testo si indica in fase d’ordine: ogni pezzo è prodotto su misura.',
    specifiche: [
      { etichetta: 'Testo', valore: 'Fino a 40 caratteri' },
      { etichetta: 'Rilievo', valore: '1,2 mm' },
      { etichetta: 'Strato', valore: '0,025 mm (resina)' },
      { etichetta: 'Montaggio', valore: 'Biadesivo o cavalletto inclusi' },
    ],
    varianti: [
      { id: 'm120', nome: 'Media — 120 mm', dimensioniMm: [120, 8, 80], prezzoCent: 3400, pesoG: 110, sku: 'ORIZ-120' },
      { id: 'l180', nome: 'Grande — 180 mm', dimensioniMm: [180, 8, 110], prezzoCent: 4600, pesoG: 190, sku: 'ORIZ-180' },
    ],
    materiali: ['resina', 'pla-opaco'],
    tempiProduzioneGiorni: [6, 9],
    disponibileSubito: false,
    modello: { colore: { materiale: 'resina', colore: 'pietra' }, glb: '/models/targa-orizzonte.glb', poster: '/posters/targa-orizzonte.webp', scala: 1, segnaposto: { kind: 'plate', seed: 103, altezza: 0.9 } },
    ordine: 8,
  },
  {
    slug: 'portachiavi-meridiana',
    nome: 'Meridiana',
    sottotitolo: 'Portachiavi inciso',
    categoria: 'personalizzati',
    descrizione:
      'Un disco sottile con incisione passante: nome, data o coordinate. Controluce il testo si legge; in tasca è solo un disco. Anello in acciaio inossidabile incluso.',
    specifiche: [
      { etichetta: 'Testo', valore: 'Fino a 18 caratteri' },
      { etichetta: 'Diametro', valore: '38 mm' },
      { etichetta: 'Spessore', valore: '4 mm' },
      { etichetta: 'Anello', valore: 'Acciaio inox, incluso' },
    ],
    varianti: [
      { id: 'singolo', nome: 'Singolo', dimensioniMm: [38, 4, 38], prezzoCent: 1200, pesoG: 12, sku: 'MERI-1' },
      { id: 'set3', nome: 'Set di 3', dimensioniMm: [38, 4, 38], prezzoCent: 2900, pesoG: 36, sku: 'MERI-3' },
    ],
    materiali: ['resina', 'pla-seta', 'pla-opaco'],
    tempiProduzioneGiorni: [5, 8],
    disponibileSubito: false,
    modello: { colore: { materiale: 'pla-seta', colore: 'perla' }, glb: '/models/portachiavi-meridiana.glb', poster: '/posters/portachiavi-meridiana.webp', scala: 1, segnaposto: { kind: 'plate', seed: 109, altezza: 0.5 } },
    ordine: 9,
  },
  {
    slug: 'cornice-soglia',
    nome: 'Soglia',
    sottotitolo: 'Cornice con dedica sul bordo',
    categoria: 'personalizzati',
    descrizione:
      'Cornice con la dedica incisa lungo il bordo inferiore, dove si legge solo da vicino. Vetro acrilico antigraffio e piedino d’appoggio inclusi; predisposta anche per l’aggancio a parete.',
    specifiche: [
      { etichetta: 'Dedica', valore: 'Fino a 60 caratteri' },
      { etichetta: 'Vetro', valore: 'Acrilico 1,5 mm, incluso' },
      { etichetta: 'Appoggio', valore: 'Piedino e gancio inclusi' },
      { etichetta: 'Orientamento', valore: 'Verticale o orizzontale' },
    ],
    varianti: [
      { id: 'f10x15', nome: '10 × 15 cm', dimensioniMm: [140, 16, 190], prezzoCent: 3900, pesoG: 210, sku: 'SOGL-1015' },
      { id: 'f13x18', nome: '13 × 18 cm', dimensioniMm: [170, 16, 220], prezzoCent: 4900, pesoG: 290, sku: 'SOGL-1318' },
    ],
    materiali: ['pla-opaco', 'pla-seta'],
    tempiProduzioneGiorni: [6, 9],
    disponibileSubito: false,
    modello: { colore: { materiale: 'pla-opaco', colore: 'notte' }, glb: '/models/cornice-soglia.glb', poster: '/posters/cornice-soglia.webp', scala: 1, segnaposto: { kind: 'plate', seed: 127, altezza: 1.3 } },
    ordine: 10,
  },
] as const

// --------------------------------------------------------------------------
// Accesso ai dati. Nessun altro modulo legge PRODUCTS direttamente: passando
// tutto da qui, sostituire il file con un CMS tocca solo queste funzioni.
// --------------------------------------------------------------------------

export function getProducts(): readonly Product[] {
  return [...PRODUCTS].sort((a, b) => a.ordine - b.ordine)
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getProductsByCategory(categoria: CategoryId): readonly Product[] {
  return getProducts().filter((p) => p.categoria === categoria)
}

/** I prodotti che compaiono nella sequenza 3D della home. */
export function getFeatured(limit = 4): readonly Product[] {
  return getProducts().slice(0, limit)
}

/** Prezzo minimo del prodotto, per le card di catalogo ("da 29,00 €"). */
export function prezzoMinimoCent(product: Product): number {
  return Math.min(...product.varianti.map((v) => v.prezzoCent))
}
