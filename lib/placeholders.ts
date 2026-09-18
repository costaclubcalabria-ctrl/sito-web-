import * as THREE from 'three'
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
