'use client'

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { QualitySettings } from '@/lib/quality'

/**
 * Post-produzione.
 *
 * Solo due effetti, ed è deliberato: il post-processing è il posto dove è più
 * facile far sembrare una scena "trattata" invece che illuminata.
 *
 * - **Bloom** con soglia alta: si accendono solo le zone già molto luminose —
 *   la linea di stampa, il bordo controluce, il nucleo dell'orizzonte. Con una
 *   soglia bassa si accenderebbe tutto e la scena diventerebbe lattiginosa.
 * - **Vignettatura** appena percettibile, che raddoppia quella CSS e chiude la
 *   composizione verso il centro.
 *
 * ⚠️ `alpha` deve restare vera lungo tutta la catena: il canvas è trasparente
 * sopra il cielo CSS, e un composer che scrive un fondo opaco cancellerebbe
 * l'atmosfera che sta sotto. È la cosa da ricontrollare per prima se lo sfondo
 * diventasse improvvisamente nero.
 */
export function PostFX({ settings }: { settings: QualitySettings }) {
  if (!settings.bloom) return null

  return (
    <EffectComposer enableNormalPass={false} multisampling={settings.antialias ? 4 : 0}>
      <Bloom
        intensity={0.7}
        luminanceThreshold={0.86}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.72}
      />
      <Vignette offset={0.32} darkness={0.42} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
