'use client'

import { useMemo } from 'react'
import { useScene } from '@/store/useScene'
import { getFeatured } from '@/data/products'
import type { QualitySettings } from '@/lib/quality'
import { HomeScene } from './scenes/HomeScene'

/**
 * La regia.
 *
 * Legge quale rotta è attiva e monta la scena corrispondente. È l'unico punto
 * del 3D che reagisce a un cambio di rotta, ed è deliberato: tutto il resto
 * (camera, oggetti, luci) resta montato, così un passaggio di pagina è un
 * movimento e non un rimontaggio.
 *
 * Fase 1: solo la home. Catalogo e prodotto arrivano in Fase 2.
 */
export function SceneDirector({ settings }: { settings: QualitySettings }) {
  const rotta = useScene((s) => s.rotta)

  // Il profilo di qualità decide quanti oggetti la scena può permettersi.
  const prodotti = useMemo(() => getFeatured(Math.min(4, settings.maxOggetti)), [settings.maxOggetti])

  if (settings.maxOggetti === 0) return null

  switch (rotta) {
    case 'home':
      return <HomeScene prodotti={prodotti} settings={settings} />
    default:
      return null
  }
}
