import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Placeholder } from '@/types/catalog'

/**
 * Geometrie segnaposto procedurali.
 *
 * Servono a costruire e collaudare l'intera scena **prima** che i modelli reali
 * esistano, e restano poi come rete di sicurezza: se un GLB manca o non si
 * carica, `useProductModel` ripiega qui e il sito non mostra mai un buco.
 *
 * Deterministiche: stesso `seed`, stessa forma, sempre. Nessun `Math.random()`.
 */

/** PRNG deterministico (mulberry32). Piccolo, veloce, sufficiente qui. */
function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const cache = new Map<string, THREE.BufferGeometry>()

/**
 * Unisce le parti di un pezzo composto in una sola geometria.
 *
 * `mergeGeometries` accetta solo insiemi **omogenei**: o tutte le geometrie
 * hanno l'indice, o nessuna. Le primitive di three (box, sfera, cilindro) lo
 * hanno; `ExtrudeGeometry` no. Senza questa normalizzazione la fusione
 * restituiva `null` **in silenzio** e il busto ripiegava sulla sfera di
 * scorta: in scena si vedeva una palla e nel codice non c'era alcun errore.
 * Era visibile solo a schermo, ed e cosi che l'ho trovato.
 */
function unisci(parti: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  const indicizzate = parti.map((g) => (g.index ? g : mergeVertices(g, 1e-4)))
  const unito = mergeGeometries(indicizzate, false)
  // Le copie indicizzate sono temporanee; gli originali li smaltisce il chiamante.
  for (const g of indicizzate) if (!parti.includes(g)) g.dispose()

  if (!unito && process.env.NODE_ENV !== 'production') {
    // Il chiamante ripiega su una sfera, e una sfera al posto di un busto e un
    // difetto che si vede solo a schermo. In sviluppo lo diciamo.
    console.warn('[segnaposto] fusione delle parti fallita: attributi incompatibili')
  }
  return unito
}

/**
 * Restituisce (e mette in cache) la geometria segnaposto.
 * La cache è importante: la stessa forma compare in home, in catalogo e nella
 * pagina prodotto, e ricostruirla ogni volta sprecherebbe memoria GPU.
 */
export function geometriaSegnaposto(p: Placeholder): THREE.BufferGeometry {
  const chiave = `${p.kind}:${p.seed}:${p.altezza}`
  const esistente = cache.get(chiave)
  if (esistente) return esistente

  const g = costruisci(p)
  g.computeVertexNormals()
  g.computeBoundingBox()
  cache.set(chiave, g)
  return g
}

/** Libera tutte le geometrie in cache. Da chiamare solo se si smonta il 3D per sempre. */
export function svuotaCacheSegnaposto(): void {
  for (const g of cache.values()) g.dispose()
  cache.clear()
}

/** Interpolazione lineare. */
function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Smoothstep fra due soglie. */
function passo(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * Il torso del busto, come **superficie parametrica**.
 *
 * Tre tentativi falliti prima di questa, e vale la pena scriverli perche
 * spiegano la forma:
 *
 * 1. `LatheGeometry` schiacciata in Z → la silhouette di una figura di
 *    rivoluzione e sempre una campana, da qualsiasi angolo: una **pedina**.
 * 2. `ExtrudeGeometry` della sagoma frontale → silhouette giusta, ma due facce
 *    piatte, un cordone di smusso tutt'intorno e nessun volume: una **lastra
 *    sagomata**, che a fondo chiaro legge come un flacone.
 * 3. La stessa con i fianchi verticali → un **cassone**.
 *
 * Qui la superficie e definita punto per punto: il raggio dipende **sia
 * dall'altezza sia dall'angolo**, e sono due cose diverse (0,30h di mezza
 * larghezza alle spalle, 0,135h di mezza profondita al petto). La sezione e
 * una superellisse, non un cerchio: un torace ha i fianchi piu piatti. E la
 * quota di ogni punto scende verso i lati, cosi la spalla **cala** verso la
 * punta invece di finire in un bordo orizzontale.
 *
 * Nessuna faccia piatta, nessuno smusso, nessuna simmetria di rivoluzione. E
 * le UV vanno da 0 in basso a 1 in alto, quindi le linee di stampa seguono
 * l'altezza come devono.
 */
function superficieTorso({
  yBase,
  altezzaTorso,
  taglio,
  spalla,
  profondita,
  collo,
}: {
  yBase: number
  altezzaTorso: number
  /** Mezza larghezza al taglio, in basso. */
  taglio: number
  /** Mezza larghezza massima, alle spalle. */
  spalla: number
  /** Mezza profondita massima, al petto. */
  profondita: number
  /** Raggio dell'attaccatura del collo, in cima. */
  collo: number
}): THREE.BufferGeometry {
  const ANELLI = 30
  const SEGMENTI = 72
  /** Dove cade la spalla, in frazione dell'altezza del torso. */
  const SPALLA_T = 0.7
  /** Esponente della superellisse: 2 = ellisse, piu alto = fianchi piu piatti. */
  const FIANCO = 2.6
  /**
   * Di quanto cala la spalla verso la punta, in frazione dell'altezza.
   * Piccolo: a 0,3 le punte diventavano due ali e il pezzo leggeva come una
   * stella. Serve un accenno di pendenza, non una tettoia.
   */
  const CALO = 0.13

  const posizioni: number[] = []
  const uv: number[] = []
  const indici: number[] = []

  for (let i = 0; i <= ANELLI; i++) {
    const t = i / ANELLI
    const svaso = passo(0, SPALLA_T, t)
    const giogo = passo(SPALLA_T, 1, t)

    // Larghezza e profondita: due profili indipendenti, poi entrambi si
    // chiudono sull'attaccatura del collo.
    const rx = mix(mix(taglio, spalla, svaso), collo, giogo)
    const rz = mix(mix(taglio * 0.62, profondita, svaso), collo, giogo)

    // Il calo della spalla compare solo nella meta alta: in basso il pezzo
    // deve appoggiare piatto sul plinto.
    const calo = altezzaTorso * CALO * passo(0.3, 1, t)

    for (let j = 0; j <= SEGMENTI; j++) {
      // L'anello parte da dietro: la cucitura (dove il primo e l'ultimo
      // vertice si sovrappongono, e le normali non combaciano) cade sulla
      // schiena invece che sul fianco, dove si vedrebbe.
      const a = -Math.PI / 2 + (j / SEGMENTI) * Math.PI * 2
      const c = Math.cos(a)
      const sn = Math.sin(a)
      // Superellisse: |cos|^(2/n) tiene i fianchi piu pieni di un'ellisse.
      const ex = Math.sign(c) * Math.pow(Math.abs(c), 2 / FIANCO)
      const ez = Math.sign(sn) * Math.pow(Math.abs(sn), 2 / FIANCO)

      // L'esponente alto concentra il calo sulla punta della spalla: il petto
      // resta alla sua quota.
      posizioni.push(rx * ex, yBase + altezzaTorso * t - calo * Math.abs(c) ** 2.4, rz * ez)
      uv.push(j / SEGMENTI, t)
    }
  }

  const perAnello = SEGMENTI + 1
  for (let i = 0; i < ANELLI; i++) {
    for (let j = 0; j < SEGMENTI; j++) {
      const a = i * perAnello + j
      const b = a + perAnello
      indici.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posizioni, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(indici)
  // ⚠️ Le normali servono **qui**: `mergeGeometries` pretende che tutte le
  // parti abbiano gli stessi attributi, e le primitive di three hanno
  // `normal`. Senza, la fusione falliva e il busto diventava la sfera di
  // scorta — cioe una palla rosa in mezzo alla pagina.
  g.computeVertexNormals()
  // Il fondo resta aperto: sta dentro il plinto, che lo copre. Un tappo la
  // sotto sarebbe geometria che nessuno vedra mai.
  return g
}

function costruisci({ kind, seed, altezza }: Placeholder): THREE.BufferGeometry {
  const r = rng(seed)

  switch (kind) {
    // Vasi e lampade: profilo di rivoluzione con ondulazione seeded.
    case 'lathe': {
      const punti: THREE.Vector2[] = []
      const passi = 44
      const raggioBase = 0.3 + r() * 0.12
      const ampiezza = 0.05 + r() * 0.06
      const frequenza = 2.5 + r() * 3

      for (let i = 0; i <= passi; i++) {
        const t = i / passi
        // Rastremazione a campana + ondulazione: nessun profilo è dritto.
        const campana = Math.sin(Math.PI * (0.18 + t * 0.74))
        const onda = Math.sin(t * frequenza * Math.PI * 2) * ampiezza * t
        const raggio = Math.max(0.05, raggioBase * campana + onda)
        punti.push(new THREE.Vector2(raggio, t * altezza))
      }
      return new THREE.LatheGeometry(punti, 96)
    }

    // Portacandele e paralumi: guscio aperto a parete sottile.
    // Il profilo porta una increspatura regolare: sono gli strati di stampa resi
    // visibili. Non e decorazione, e il tratto distintivo del processo (e del
    // nome) — su un cono liscio l'oggetto non racconta niente.
    case 'shell': {
      const punti: THREE.Vector2[] = []
      const passi = 60
      const raggioBase = 0.32 + r() * 0.08
      const conicita = 0.72 + r() * 0.16
      const strati = 9 + Math.floor(r() * 5)

      for (let i = 0; i <= passi; i++) {
        const t = i / passi
        const raggio =
          raggioBase * (1 - t * (1 - conicita)) + Math.sin(t * strati * Math.PI * 2) * 0.012
        punti.push(new THREE.Vector2(raggio, t * altezza))
      }
      // Aperto in cima e in fondo: la parete e sottile e si vede l'interno.
      return new THREE.LatheGeometry(punti, 80)
    }

    // Fermacarte: solido sfaccettato.
    case 'knot': {
      const p = 2 + Math.floor(r() * 3)
      const q = 3 + Math.floor(r() * 3)
      const g = new THREE.TorusKnotGeometry(altezza * 0.34, altezza * 0.12, 160, 24, p, q)
      g.translate(0, altezza / 2, 0)
      return g
    }

    // Portapenne e fermalibri: prisma a facce nette.
    case 'prism': {
      const lati = 6 + Math.floor(r() * 3)
      const raggio = 0.28 + r() * 0.1
      const g = new THREE.CylinderGeometry(raggio * (0.9 + r() * 0.2), raggio, altezza, lati, 1)
      g.translate(0, altezza / 2, 0)
      return g
    }

    /*
     * Il busto classico.
     *
     * Non e una scansione e non vuole esserlo: e un **volume stilizzato** —
     * calotta, collo, spalle su un basamento. Serve a due cose: far vedere in
     * scena un oggetto riconoscibile come "busto" prima che il GLB reale
     * esista, e ricordare che il modello definitivo dovra essere disegnato da
     * noi (vedi l'avvertenza in data/products.ts).
     *
     * ------------------------------------------------------------------------
     * PERCHE IL TORSO NON E UNA ROTAZIONE
     * ------------------------------------------------------------------------
     *
     * La prima versione costruiva il torso con una `LatheGeometry` schiacciata
     * in Z. In scena leggeva come una **pedina degli scacchi**, e il motivo e
     * geometrico, non di illuminazione: una figura di rivoluzione ha la stessa
     * silhouette da qualsiasi angolo, e quella silhouette e una campana. Una
     * campana con una sfera sopra e una pedina, qualunque texture le si metta.
     *
     * Qui il torso parte dalla **sagoma frontale** — base piatta, fianchi che
     * salgono, la spalla che sporge e rientra verso il collo — e la estrude in
     * profondita. La silhouette e quella giusta di fronte, che e il punto di
     * vista da cui il pezzo si vede nel fiume; lo smusso e volutamente grande
     * rispetto alla profondita (0,075h su 0,11h), cosi la sezione e quasi
     * lenticolare e il pezzo non legge come una lastra piatta.
     *
     * Tutto e in frazioni di `h`: i due busti in catalogo hanno altezze diverse
     * (1,5 e 1,45) e devono restare proporzionati.
     */
    case 'busto': {
      const h = altezza
      const parti: THREE.BufferGeometry[] = []

      /*
       * Le proporzioni contano piu della forma.
       *
       * In un busto reale la testa e **grande**: circa il 40% dell'altezza
       * totale, contro il 35% del petto e il 10% del plinto. La prima versione
       * aveva una testa da un quarto su un petto da mezza altezza, e il
       * risultato leggeva come un pomello su una massa. Qui le quote sono
       * quelle di un busto, in frazioni di h (i due busti in catalogo sono
       * alti 1,5 e 1,45 e devono restare proporzionati).
       */
      const yPlinto = h * 0.08
      const yCollo = h * 0.53
      const corsa = yCollo - yPlinto

      // Plinto rettangolare, spigolo vivo: e cio che dice "oggetto da
      // esposizione" invece di "figurina". Stretto, come il taglio del busto.
      const plinto = new THREE.BoxGeometry(h * 0.4, yPlinto, h * 0.26)
      plinto.translate(0, yPlinto / 2, 0)
      parti.push(plinto)

      /*
       * Il torso. La forma vive in `superficieTorso`, e il commento lassu
       * racconta i tre tentativi che non hanno funzionato: e la parte piu
       * difficile di tutto il segnaposto.
       */
      const torso = superficieTorso({
        yBase: yPlinto,
        altezzaTorso: corsa,
        // Variazione seeded: i due busti non hanno le stesse spalle.
        taglio: h * 0.15,
        spalla: h * (0.295 + r() * 0.04),
        profondita: h * 0.135,
        collo: h * 0.085,
      })
      parti.push(torso)

      // Collo: corto e leggermente in avanti, come in un busto vero.
      const gola = new THREE.CylinderGeometry(h * 0.068, h * 0.086, h * 0.11, 24)
      gola.translate(0, h * 0.57, h * 0.005)
      parti.push(gola)

      // --- La testa ------------------------------------------------------
      // Girata di qualche grado. Un busto con la testa perfettamente frontale
      // legge come un pezzo degli scacchi; la torsione e cio che gli da un
      // davanti e un punto di vista. (Il David, non per caso, guarda di lato.)
      const giro = 0.24 + r() * 0.18
      const testa: THREE.BufferGeometry[] = []

      // Cranio: ovale, non sferico. Piu alto che largo, schiacciato ai lati.
      const cranio = new THREE.SphereGeometry(h * 0.152, 44, 30)
      cranio.scale(0.92, 1.24, 1.0)
      cranio.translate(0, h * 0.765, h * 0.008)
      testa.push(cranio)

      // La massa dei capelli: una sfera **chiusa**, piu ampia del cranio e
      // spostata indietro e in alto. Chiusa e non una calotta: il bordo di una
      // calotta aperta si vede come un anello netto sulla fronte. E' la
      // superficie dove la luce radente prende gli strati, quindi e la parte
      // che racconta la stampa.
      const capelli = new THREE.SphereGeometry(h * 0.16, 40, 28)
      capelli.scale(1.0, 0.92, 1.04)
      capelli.translate(0, h * 0.795, -h * 0.022)
      testa.push(capelli)

      // Mascella e mento: una massa in avanti e in basso, piccola. Senza, il
      // profilo resta un ovale; troppo grande, diventa un bernoccolo.
      const mento = new THREE.SphereGeometry(h * 0.078, 26, 20)
      mento.scale(0.88, 0.62, 0.82)
      mento.translate(0, h * 0.685, h * 0.052)
      testa.push(mento)

      /*
       * Il naso.
       *
       * Un cono da tre millimetri, e vale piu di tutto il resto della testa:
       * e' il **solo** dettaglio che trasforma un ovale in un volto, e quindi
       * un volume su un piedistallo in un busto. Senza, qualunque calotta
       * liscia resta un uovo.
       */
      const naso = new THREE.ConeGeometry(h * 0.034, h * 0.08, 16)
      naso.rotateX(Math.PI / 2)
      naso.scale(0.8, 1, 1)
      naso.translate(0, h * 0.765, h * 0.128)
      testa.push(naso)

      for (const g of testa) {
        // La rotazione e attorno all'asse del corpo, che passa per l'origine:
        // le parti della testa sono centrate su x = 0, quindi girano insieme.
        g.rotateY(giro)
        parti.push(g)
      }

      const unito = unisci(parti)
      for (const g of parti) g.dispose()
      return unito ?? new THREE.SphereGeometry(0.2, 16, 12)
    }

    /*
     * Il blocco a borchie.
     *
     * Proporzioni e numero di borchie **nostri**: la forma del mattoncino a
     * incastro e un marchio di forma difeso, e questo pezzo e una lampada da
     * parete che gli assomiglia per famiglia, non una copia. Vedi l'avvertenza
     * in data/products.ts.
     */
    case 'blocco': {
      const parti: THREE.BufferGeometry[] = []
      const larghezza = altezza * 1.5
      const alto = altezza
      const spessore = altezza * 0.42

      const corpo = new THREE.BoxGeometry(larghezza, alto, spessore, 1, 1, 1)
      parti.push(corpo)

      // Quattro file per due colonne: una griglia che non e quella di nessuno.
      const colonne = 2
      const file = 4
      const passoX = larghezza / (colonne + 0.6)
      const passoY = alto / (file + 0.5)
      const raggio = Math.min(passoX, passoY) * 0.34

      for (let cx = 0; cx < colonne; cx++) {
        for (let cy = 0; cy < file; cy++) {
          const b = new THREE.CylinderGeometry(raggio, raggio, spessore * 0.34, 28)
          b.rotateX(Math.PI / 2)
          b.translate(
            (cx - (colonne - 1) / 2) * passoX,
            (cy - (file - 1) / 2) * passoY,
            spessore / 2 + spessore * 0.17 - 0.001,
          )
          parti.push(b)
        }
      }

      const unito = unisci(parti)
      for (const g of parti) g.dispose()
      if (!unito) return new THREE.BoxGeometry(larghezza, alto, spessore)
      // Il pezzo sta appoggiato sul piatto come tutti gli altri.
      unito.translate(0, alto / 2, 0)
      return unito
    }

    // Targhe, portachiavi, cornici: piastra sottile con angoli smussati.
    case 'plate': {
      const larghezza = altezza * (1.15 + r() * 0.35)
      const spessore = 0.045 + r() * 0.03
      const raggioAngolo = Math.min(larghezza, altezza) * 0.12

      const forma = new THREE.Shape()
      const x = -larghezza / 2
      const y = 0
      forma.moveTo(x + raggioAngolo, y)
      forma.lineTo(x + larghezza - raggioAngolo, y)
      forma.quadraticCurveTo(x + larghezza, y, x + larghezza, y + raggioAngolo)
      forma.lineTo(x + larghezza, y + altezza - raggioAngolo)
      forma.quadraticCurveTo(x + larghezza, y + altezza, x + larghezza - raggioAngolo, y + altezza)
      forma.lineTo(x + raggioAngolo, y + altezza)
      forma.quadraticCurveTo(x, y + altezza, x, y + altezza - raggioAngolo)
      forma.lineTo(x, y + raggioAngolo)
      forma.quadraticCurveTo(x, y, x + raggioAngolo, y)

      const g = new THREE.ExtrudeGeometry(forma, {
        depth: spessore,
        bevelEnabled: true,
        bevelThickness: spessore * 0.3,
        bevelSize: spessore * 0.3,
        bevelSegments: 2,
        curveSegments: 12,
      })
      g.translate(0, 0, -spessore / 2)
      return g
    }
  }
}

/**
 * Il piedistallo su cui poggia l'oggetto (DESIGN.md §7, idea A).
 * Uno solo, condiviso da tutti gli oggetti: la GPU lo carica una volta.
 */
let piedistallo: THREE.BufferGeometry | null = null

export function geometriaPiedistallo(): THREE.BufferGeometry {
  if (!piedistallo) {
    piedistallo = new THREE.CylinderGeometry(0.46, 0.52, 0.055, 64)
  }
  return piedistallo
}
