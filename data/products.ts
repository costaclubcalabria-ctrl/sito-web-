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
 *
 * ⚠️ DUE AVVERTENZE SUI PRODOTTI ISPIRATI AI TUOI ESEMPI
 *
 * 1. **Il busto classico.** Il David di Michelangelo è un'opera in pubblico
 *    dominio e riprodurla è lecito. In Italia, però, il Codice dei beni
 *    culturali (art. 107-108) richiede l'autorizzazione della Galleria
 *    dell'Accademia per lo **sfruttamento commerciale dell'immagine** dell'opera
 *    conservata nei musei statali, e la giurisprudenza recente l'ha fatta
 *    valere. Il modello qui è una **reinterpretazione stilizzata**, non una
 *    scansione: nessuna geometria ripresa dall'originale. Prima di vendere,
 *    fai verificare la posizione da chi ti segue legalmente.
 *
 * 2. **La lampada a mattoncino.** La forma del mattoncino a incastro con borchie
 *    è un marchio di forma registrato e difeso. Qui il pezzo è chiamato
 *    **"Blocco"**, con proporzioni e numero di borchie propri, e non compare
 *    mai il nome del marchio né alcun riferimento ad esso. Non usare quel nome
 *    in nessun testo, titolo, tag o annuncio: è la differenza fra un omaggio e
 *    una contraffazione.
 */

export const PRODUCTS: readonly Product[] = [
  // --------------------------------------------------- oggetti d'esposizione ---
  {
    slug: 'busto-david',
    nome: 'David',
    sottotitolo: 'Busto classico, tinta piena',
    categoria: 'decor',
    descrizione:
      'Una reinterpretazione del busto classico, ridotta all’essenziale e stampata in tinta piena. Il colore saturo toglie all’opera la sua aura da museo e la restituisce come oggetto: un volume da mettere su una mensola, non una copia da ammirare. Gli strati di stampa restano visibili sui capelli, dove la luce li prende di lato.',
    specifiche: [
      { etichetta: 'Stampa', valore: 'Pezzo unico, senza supporti visibili' },
      { etichetta: 'Strato', valore: '0,12 mm sul volto' },
      { etichetta: 'Base', valore: 'Feltro antigraffio' },
      { etichetta: 'Origine', valore: 'Modello nostro, non una scansione' },
    ],
    varianti: [
      { id: 'medio', nome: 'Medio — 150 mm', dimensioniMm: [100, 95, 150], prezzoCent: 4900, pesoG: 240, sku: 'DAVI-M' },
      { id: 'piccolo', nome: 'Piccolo — 100 mm', dimensioniMm: [68, 64, 100], prezzoCent: 3200, pesoG: 110, sku: 'DAVI-S' },
      { id: 'grande', nome: 'Grande — 220 mm', dimensioniMm: [148, 140, 220], prezzoCent: 7900, pesoG: 520, sku: 'DAVI-L' },
    ],
    materiali: ['pla-tinta', 'pla-opaco', 'resina'],
    tempiProduzioneGiorni: [4, 6],
    disponibileSubito: true,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'blu-cobalto' },
      glb: '/models/busto-david.glb',
      poster: '/posters/busto-david.webp',
      scala: 1,
      segnaposto: { kind: 'busto', seed: 11, altezza: 1.5 },
    },
    ordine: 1,
  },
  {
    slug: 'lampada-blocco',
    nome: 'Blocco',
    sottotitolo: 'Lampada da parete a pulsante',
    categoria: 'illuminazione',
    descrizione:
      'Un blocco a borchie da appendere, dove una delle borchie è il pulsante: si accende premendola con la mano intera, non cercando un interruttore. Luce calda diffusa, alimentazione a batteria ricaricabile, magnete sul retro per staccarla dalla parete e portarla in giro.',
    specifiche: [
      { etichetta: 'Sorgente', valore: 'LED 2700 K, 180 lm' },
      { etichetta: 'Comando', valore: 'Borchia-pulsante, 3 livelli' },
      { etichetta: 'Batteria', valore: '1200 mAh, USB-C, ~20 h' },
      { etichetta: 'Fissaggio', valore: 'Piastra magnetica inclusa' },
    ],
    varianti: [
      { id: 'due-quattro', nome: '2 × 4 borchie — 180 mm', dimensioniMm: [180, 45, 90], prezzoCent: 5900, pesoG: 310, sku: 'BLOC-24' },
      { id: 'due-due', nome: '2 × 2 borchie — 90 mm', dimensioniMm: [90, 45, 90], prezzoCent: 3900, pesoG: 180, sku: 'BLOC-22' },
    ],
    materiali: ['pla-tinta', 'petg'],
    tempiProduzioneGiorni: [5, 7],
    disponibileSubito: true,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'rosso-segnale' },
      glb: '/models/lampada-blocco.glb',
      poster: '/posters/lampada-blocco.webp',
      scala: 1,
      segnaposto: { kind: 'blocco', seed: 23, altezza: 1.1 },
    },
    ordine: 2,
  },
  {
    slug: 'busto-venere',
    nome: 'Venere',
    sottotitolo: 'Busto classico, tinta piena',
    categoria: 'decor',
    descrizione:
      'Il pendant del David, nello stesso linguaggio: volume pieno, colore saturo, nessuna finta patina. In coppia funzionano come due punti di colore alle estremità di una mensola; da soli tengono un tavolo.',
    specifiche: [
      { etichetta: 'Stampa', valore: 'Pezzo unico, senza supporti visibili' },
      { etichetta: 'Strato', valore: '0,12 mm sul volto' },
      { etichetta: 'Base', valore: 'Feltro antigraffio' },
      { etichetta: 'In coppia', valore: 'Sconto applicato in carrello' },
    ],
    varianti: [
      { id: 'medio', nome: 'Medio — 150 mm', dimensioniMm: [96, 92, 150], prezzoCent: 4900, pesoG: 230, sku: 'VENE-M' },
      { id: 'piccolo', nome: 'Piccolo — 100 mm', dimensioniMm: [64, 62, 100], prezzoCent: 3200, pesoG: 105, sku: 'VENE-S' },
    ],
    materiali: ['pla-tinta', 'pla-opaco', 'resina'],
    tempiProduzioneGiorni: [4, 6],
    disponibileSubito: true,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'rosa-cipria' },
      glb: '/models/busto-venere.glb',
      poster: '/posters/busto-venere.webp',
      scala: 1,
      segnaposto: { kind: 'busto', seed: 47, altezza: 1.45 },
    },
    ordine: 3,
  },
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
    materiali: ['pla-tinta', 'pla-opaco', 'petg'],
    tempiProduzioneGiorni: [3, 5],
    disponibileSubito: true,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'giallo-zolfo' },
      glb: '/models/vaso-onda.glb',
      poster: '/posters/vaso-onda.webp',
      scala: 1,
      segnaposto: { kind: 'lathe', seed: 11, altezza: 1.4 },
    },
    ordine: 4,
  },
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
    materiali: ['petg', 'pla-tinta'],
    tempiProduzioneGiorni: [5, 7],
    disponibileSubito: true,
    modello: {
      colore: { materiale: 'petg', colore: 'ambra' },
      glb: '/models/lampada-duna.glb',
      poster: '/posters/lampada-duna.webp',
      scala: 1,
      segnaposto: { kind: 'lathe', seed: 53, altezza: 1.8 },
    },
    ordine: 5,
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
    materiali: ['pla-tinta', 'pla-seta'],
    tempiProduzioneGiorni: [3, 5],
    disponibileSubito: true,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'verde-acido' },
      glb: '/models/portacandele-eclissi.glb',
      poster: '/posters/portacandele-eclissi.webp',
      scala: 1,
      segnaposto: { kind: 'shell', seed: 23, altezza: 1.2 },
    },
    ordine: 6,
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
    materiali: ['pla-tinta', 'pla-seta'],
    tempiProduzioneGiorni: [2, 4],
    disponibileSubito: true,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'arancio-bruciato' },
      glb: '/models/portapenne-basalto.glb',
      poster: '/posters/portapenne-basalto.webp',
      scala: 1,
      segnaposto: { kind: 'prism', seed: 83, altezza: 1.1 },
    },
    ordine: 7,
  },
  {
    slug: 'fermacarte-quarzo',
    nome: 'Quarzo',
    sottotitolo: 'Fermacarte sfaccettato',
    categoria: 'scrittoio',
    descrizione:
      'Un solido a facce irregolari, zavorrato internamente. Le facce riflettono la luce in direzioni diverse a seconda di come è appoggiato: non esiste un verso giusto.',
    specifiche: [
      { etichetta: 'Facce', valore: '18, irregolari' },
      { etichetta: 'Zavorra', valore: 'Acciaio, 320 g' },
      { etichetta: 'Appoggio', valore: 'Feltro su ogni faccia stabile' },
      { etichetta: 'Incisione', valore: 'Su richiesta, sulla faccia piana' },
    ],
    varianti: [{ id: 'unico', nome: 'Taglia unica', dimensioniMm: [70, 65, 60], prezzoCent: 1900, pesoG: 340, sku: 'QUAR-1' }],
    materiali: ['pla-seta', 'pla-tinta', 'resina'],
    tempiProduzioneGiorni: [2, 4],
    disponibileSubito: true,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'blu-cobalto' },
      glb: '/models/fermacarte-quarzo.glb',
      poster: '/posters/fermacarte-quarzo.webp',
      scala: 1,
      segnaposto: { kind: 'knot', seed: 97, altezza: 0.8 },
    },
    ordine: 8,
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
    materiali: ['resina', 'pla-tinta'],
    tempiProduzioneGiorni: [6, 9],
    disponibileSubito: false,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'nero-antracite' },
      glb: '/models/targa-orizzonte.glb',
      poster: '/posters/targa-orizzonte.webp',
      scala: 1,
      segnaposto: { kind: 'plate', seed: 103, altezza: 0.9 },
    },
    ordine: 9,
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
    materiali: ['resina', 'pla-seta', 'pla-tinta'],
    tempiProduzioneGiorni: [5, 8],
    disponibileSubito: false,
    modello: {
      colore: { materiale: 'pla-tinta', colore: 'rosa-cipria' },
      glb: '/models/portachiavi-meridiana.glb',
      poster: '/posters/portachiavi-meridiana.webp',
      scala: 1,
      segnaposto: { kind: 'plate', seed: 109, altezza: 0.5 },
    },
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

/** I pezzi che passano nel fiume della home. */
export function getFeatured(limit = 4): readonly Product[] {
  return getProducts().slice(0, limit)
}

/** Prezzo minimo del prodotto, per le card di catalogo ("da 29,00 €"). */
export function prezzoMinimoCent(product: Product): number {
  return Math.min(...product.varianti.map((v) => v.prezzoCent))
}

/** Il colore con cui il pezzo compare in scena. Serve alla tinta del fondo. */
export function coloreScena(product: Product): { materiale: string; colore: string } {
  return product.modello.colore
}
