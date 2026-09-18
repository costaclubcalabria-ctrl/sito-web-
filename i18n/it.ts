/**
 * Tutte le stringhe del sito, in un posto solo.
 *
 * Perché non `next-intl` adesso: PLAN.md §2.4. In sintesi — il lavoro costoso
 * e irreversibile è estrarre i testi dai componenti, e lo facciamo qui da
 * subito. Aggiungere il segmento `[locale]`, il middleware e gli `hreflang` è
 * mezza giornata meccanica il giorno che serve l'inglese.
 *
 * Nessun componente contiene testo cablato. Se trovi una stringa italiana in un
 * `.tsx`, è un bug.
 */
export const it = {
  brand: {
    nome: 'STRATO',
    payoff: 'Strato dopo strato.',
    posizionamento: 'Oggetti da esposizione, stampati in 3D',
  },

  nav: {
    home: 'Home',
    catalogo: 'Catalogo',
    suRichiesta: 'Su richiesta',
    studio: 'Studio',
    contatti: 'Contatti',
    carrello: 'Carrello',
    apriMenu: 'Apri il menu',
    chiudiMenu: 'Chiudi il menu',
    saltaAlCatalogo: 'Salta al catalogo',
    saltaAlContenuto: 'Vai al contenuto principale',
  },

  hero: {
    sopratitolo: 'Stampa 3D su misura — Italia',
    // La parola tra ** ** viene resa in corsivo Instrument Serif.
    // Una sola per titolo: due corsivi significano zero enfasi (DESIGN.md §5.2).
    titolo: 'Oggetti che nascono **strato dopo strato**',
    sottotitolo:
      'Progettiamo e stampiamo oggetti da esposizione, decor e regali su misura. Quello che vedi qui sotto è già pronto da spedire.',
    ctaPrimaria: 'Vedi il catalogo',
    ctaSecondaria: 'Fai fare il tuo',
    scorri: 'Scendi',
    saltaAnimazione: 'Salta l’animazione',
    istruzione: 'Scorri per far scorrere i pezzi',
  },

  sequenza: {
    pezzi: '10 pezzi',
    inStampa: 'In stampa',
    stampato: 'Stampato',
    strati: 'strati',
    prossimo: 'Prossimo',
    aFuoco: 'In evidenza',
    vediProdotto: 'Vedi il prodotto',
    tuttiIProdotti: 'Vedi tutti i prodotti',
    titoloFinale: 'Dieci oggetti, **pronti da spedire**',
    sottotitoloFinale: 'Ogni pezzo è stampato qui, controllato a mano e spedito in 2-4 giorni lavorativi.',
  },

  suRichiesta: {
    etichetta: 'Su richiesta',
    titolo: 'Hai già il file? **Lo stampiamo noi**',
    testo:
      'Caricaci il tuo STL, 3MF o OBJ — o anche solo uno schizzo. Scegli materiale, colore e dimensioni: ti rispondiamo con un preventivo entro 48 ore.',
    nota: 'Nessun prezzo automatico. È una richiesta di preventivo, non un ordine.',
    cta: 'Richiedi un preventivo',
  },

  prodotto: {
    da: 'da',
    variante: 'Formato',
    materiale: 'Materiale',
    colore: 'Colore',
    quantita: 'Quantità',
    aggiungi: 'Aggiungi al carrello',
    aggiunto: 'Aggiunto',
    specifiche: 'Specifiche',
    dimensioni: 'Dimensioni',
    peso: 'Peso',
    produzione: 'Produzione',
    disponibileSubito: 'Disponibile subito',
    suMisura: 'Prodotto su misura',
    ruota: 'Trascina per ruotare',
    ruotaTouch: 'Un dito per ruotare, due per lo zoom',
  },

  carrello: {
    titolo: 'Carrello',
    vuoto: 'Il carrello è vuoto.',
    vuotoCta: 'Vai al catalogo',
    subtotale: 'Subtotale',
    spedizione: 'Spedizione',
    spedizioneGratuita: 'Gratuita',
    totale: 'Totale',
    mancanoAllaGratuita: 'Mancano {importo} alla spedizione gratuita',
    checkout: 'Vai al pagamento',
    rimuovi: 'Rimuovi',
    chiudi: 'Chiudi il carrello',
    ivaInclusa: 'IVA inclusa. Spedizione calcolata al passo successivo.',
  },

  catalogo: {
    titolo: 'Catalogo',
    tutti: 'Tutti',
    vuoto: 'Nessun prodotto in questa categoria.',
    filtraPer: 'Filtra per categoria',
  },

  footer: {
    spedizione: 'Spedizione in Italia {costo} — gratuita da {soglia}',
    legale: 'Legale',
    privacy: 'Privacy',
    cookie: 'Cookie',
    termini: 'Termini di vendita',
    recesso: 'Diritto di recesso',
    navigazione: 'Navigazione',
    contatti: 'Contatti',
    qualita: 'Qualità grafica',
    qualitaAlta: 'Alta',
    qualitaMedia: 'Media',
    qualitaBassa: 'Bassa',
    // ⚠️ SEGNAPOSTO — da sostituire con i dati reali prima del lancio.
    ragioneSociale: '[RAGIONE SOCIALE DA INSERIRE]',
    piva: 'P.IVA [DA INSERIRE]',
    sede: '[SEDE LEGALE DA INSERIRE]',
    diritti: 'Tutti i diritti riservati',
  },

  profondita: {
    etichetta: 'Profondità nella sezione',
    mm: 'mm',
    superficie: 'Superficie',
  },

  a11y: {
    scenaDecorativa: 'Scena tridimensionale decorativa. Tutte le informazioni sui prodotti sono disponibili come testo.',
    vaiAlProdotto: 'Vai alla scheda di {nome}',
    caricamento: 'Caricamento in corso',
    prezzoCorrente: 'Prezzo attuale',
  },

  errori: {
    generico: 'Qualcosa non ha funzionato. Riprova.',
    prodottoNonTrovato: 'Prodotto non trovato',
    prodottoNonTrovatoTesto: 'Questo prodotto non esiste o non è più in catalogo.',
    tornaAlCatalogo: 'Torna al catalogo',
  },
} as const

export type Dizionario = typeof it
