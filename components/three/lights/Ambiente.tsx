'use client'

import { Environment, Lightformer } from '@react-three/drei'
import type { QualitySettings } from '@/lib/quality'

/**
 * La mappa d'ambiente — costruita in scena, non scaricata.
 *
 * È il singolo intervento che più cambia la resa dei materiali. Una plastica
 * satinata o una superficie metallica non hanno alcun aspetto proprio: sono
 * fatte di quello che riflettono. Senza una mappa d'ambiente non riflettono
 * niente, e qualunque oggetto — per quanto ben illuminato — sembra gesso.
 *
 * Le HDRI pronte di drei (`preset="sunset"`) si scaricano da un CDN: 2-4 MB e
 * una connessione a un dominio terzo sul percorso critico. Qui l'ambiente è
 * **disegnato con dei `Lightformer`**: pannelli luminosi disposti attorno alla
 * scena, renderizzati una volta sola in una cubemap da 256 px. Costo di rete:
 * zero. E soprattutto sono *i nostri* colori — l'ambra dell'orizzonte, il
 * viola del cielo — non quelli di un tramonto fotografato altrove.
 *
 * La disposizione è quella di un set fotografico vero:
 * - una striscia calda bassa, davanti: è l'orizzonte che illumina il prodotto
 * - due pannelli freddi alti ai lati: il cielo
 * - una striscia stretta dietro: il controluce che stacca la sagoma dal fondo
 */
export function Ambiente({ settings }: { settings: QualitySettings }) {
  if (settings.ambiente === 0) return null

  return (
    <Environment resolution={settings.ambiente} frames={1}>
      {/* L'orizzonte: larga, bassa, calda. È la sorgente principale. */}
      <Lightformer
        form="rect"
        intensity={2.6}
        color="#ffb066"
        scale={[30, 3, 1]}
        position={[0, -1.4, -9]}
        rotation={[0, 0, 0]}
      />
      {/* Il nucleo, più stretto e più caldo: dà il punto di luce sui bordi. */}
      <Lightformer
        form="rect"
        intensity={4.2}
        color="#ffe3b0"
        scale={[10, 0.8, 1]}
        position={[0, -1.1, -7]}
      />

      {/* Il cielo: due pannelli freddi e larghi, in alto ai lati. */}
      <Lightformer
        form="rect"
        intensity={0.5}
        color="#8ea8ff"
        scale={[7, 5, 1]}
        position={[-9, 6, 1]}
        rotation={[0, Math.PI / 2.4, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.4}
        color="#a98fff"
        scale={[7, 5, 1]}
        position={[9, 6, 1]}
        rotation={[0, -Math.PI / 2.4, 0]}
      />

      {/* Controluce: stretto, dietro, freddo. È ciò che stacca la sagoma. */}
      <Lightformer
        form="rect"
        intensity={1.7}
        color="#cbb6ff"
        scale={[14, 1.6, 1]}
        position={[0, 2.4, -12]}
      />

      {/* Riflesso dal basso: simula la luce che rimbalza sul piano specchiante,
          anche quando il piano non c'è (profilo medio). */}
      <Lightformer
        form="rect"
        intensity={0.5}
        color="#6a4a7a"
        scale={[18, 6, 1]}
        position={[0, -5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </Environment>
  )
}
