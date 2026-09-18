'use client'

import { Environment, Lightformer } from '@react-three/drei'
import type { QualitySettings } from '@/lib/quality'

/**
 * La mappa d'ambiente — costruita in scena, non scaricata.
 *
 * È l'intervento che più cambia la resa dei materiali. Una superficie satinata
 * non ha alcun aspetto proprio: è fatta di quello che riflette. Senza mappa
 * d'ambiente non riflette niente, e qualunque oggetto sembra gesso.
 *
 * Le HDRI pronte di drei (`preset="studio"`) si scaricano da un CDN: 2-4 MB e
 * una connessione a un dominio terzo sul percorso critico. Qui l'ambiente è
 * **disegnato con dei `Lightformer`** e renderizzato una volta sola in una
 * cubemap piccola. Costo di rete: zero.
 *
 * La disposizione è quella di una cabina di posa: un soffitto luminoso ampio,
 * due pareti chiare ai lati, e il piano chiaro sotto che rimanda luce.
 */
export function Ambiente({ settings }: { settings: QualitySettings }) {
  if (settings.ambiente === 0) return null

  return (
    <Environment resolution={settings.ambiente} frames={1} background={false}>
      {/* Soffitto luminoso: la sorgente principale di ciò che si riflette. */}
      <Lightformer
        form="rect"
        intensity={2.2}
        color="#ffffff"
        scale={[14, 9, 1]}
        position={[0, 7, 1]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Pareti chiare: danno ai bordi verticali qualcosa da riflettere. */}
      <Lightformer form="rect" intensity={1.1} color="#fff4e4" scale={[7, 6, 1]} position={[-7, 2.6, 2]} rotation={[0, Math.PI / 2.2, 0]} />
      <Lightformer form="rect" intensity={0.85} color="#eaf0ff" scale={[7, 6, 1]} position={[7, 2.6, 2]} rotation={[0, -Math.PI / 2.2, 0]} />

      {/* Rimbalzo dal piano: è il piano chiaro visto dagli oggetti. */}
      <Lightformer
        form="rect"
        intensity={0.7}
        color="#f2ece0"
        scale={[16, 10, 1]}
        position={[0, -2.4, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Una striscia calda bassa e frontale: il riflesso che corre lungo gli
          spigoli degli strati. È il dettaglio che fa sembrare il pezzo reale. */}
      <Lightformer form="rect" intensity={1.6} color="#ffc98a" scale={[9, 0.5, 1]} position={[-1.4, 0.3, 4.2]} />
    </Environment>
  )
}
