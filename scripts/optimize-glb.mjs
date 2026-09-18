#!/usr/bin/env node
/**
 * Ottimizza un GLB esportato da Blender per il web.
 *
 *   npm run models:ottimizza public/models/vaso-onda.glb
 *   npm run models:ottimizza public/models          # tutta la cartella
 *
 * Catena: dedup → weld → simplify → meshopt. La spiegazione di ogni passaggio,
 * e perché Meshopt invece di Draco, sono in MODELS.md §3.
 *
 * Richiede `@gltf-transform/cli` installato globalmente:
 *   npm install -g @gltf-transform/cli
 */
import { execFileSync } from 'node:child_process'
import { statSync, readdirSync, rmSync, renameSync, existsSync } from 'node:fs'
import { join, extname, basename } from 'node:path'

/** Oltre questa soglia il modello rallenta il primo caricamento. MODELS.md §0. */
const LIMITE_BYTE = 1.5 * 1024 * 1024

const argomenti = process.argv.slice(2)
if (argomenti.length === 0) {
  console.error('Uso: npm run models:ottimizza <file.glb | cartella>')
  process.exit(1)
}

const target = argomenti[0]
if (!existsSync(target)) {
  console.error(`Non trovo: ${target}`)
  process.exit(1)
}

const file = statSync(target).isDirectory()
  ? readdirSync(target)
      .filter((f) => extname(f).toLowerCase() === '.glb')
      .map((f) => join(target, f))
  : [target]

if (file.length === 0) {
  console.error('Nessun .glb da ottimizzare.')
  process.exit(1)
}

function gltf(...args) {
  execFileSync('gltf-transform', args, { stdio: ['ignore', 'pipe', 'pipe'] })
}

const kb = (b) => `${(b / 1024).toFixed(0)} KB`

let fuoriBudget = 0

for (const percorso of file) {
  const prima = statSync(percorso).size
  const tmp = (n) => `${percorso}.tmp${n}`

  try {
    gltf('dedup', percorso, tmp(1))
    gltf('weld', tmp(1), tmp(2))
    // --error è la tolleranza geometrica: 0.001 di un'unità di scena (10 cm)
    // significa 0,1 mm. Sotto la soglia del visibile a distanza di prodotto.
    gltf('simplify', tmp(2), tmp(3), '--ratio', '0.75', '--error', '0.001')
    gltf('meshopt', tmp(3), tmp(4), '--level', 'high')

    rmSync(percorso)
    renameSync(tmp(4), percorso)

    const dopo = statSync(percorso).size
    const risparmio = Math.round((1 - dopo / prima) * 100)
    const nome = basename(percorso)

    if (dopo > LIMITE_BYTE) {
      fuoriBudget++
      console.log(`⚠  ${nome}  ${kb(prima)} → ${kb(dopo)} (-${risparmio}%)  OLTRE IL BUDGET di 1,5 MB`)
      console.log('   Torna in Blender e abbassa il rapporto del Decimate (MODELS.md §2.2).')
    } else {
      console.log(`✓  ${nome}  ${kb(prima)} → ${kb(dopo)} (-${risparmio}%)`)
    }
  } catch (e) {
    console.error(`✗  ${basename(percorso)} — ${e instanceof Error ? e.message : String(e)}`)
    if (String(e).includes('ENOENT')) {
      console.error('   Manca gltf-transform: npm install -g @gltf-transform/cli')
    }
  } finally {
    for (let i = 1; i <= 4; i++) {
      if (existsSync(tmp(i))) rmSync(tmp(i))
    }
  }
}

// Il budget di performance non è un consiglio: se salta, salta l'LCP.
process.exit(fuoriBudget > 0 ? 1 : 0)
