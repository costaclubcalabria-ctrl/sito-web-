'use client'

import { create } from 'zustand'

/**
 * Stato della scena 3D.
 *
 * ⚠️ REGOLA PORTANTE (PLAN.md §3.2): qui dentro sta **solo stato semantico** —
 * cose che cambiano poche volte al secondo e per cui un re-render di React è
 * corretto. Scroll, posizione del mouse, giroscopio e progresso della camera
 * NON stanno qui: vivono in `useRef` e vengono letti dentro `useFrame`.
 * Metterli qui significherebbe un re-render per frame, cioè 20 fps invece di 60.
 */

export type ScenaRotta = 'home' | 'catalogo' | 'prodotto' | 'nessuna'

interface SceneState {
  /** Quale regia sta guidando la camera. */
  rotta: ScenaRotta
  /** Slug del prodotto a fuoco, o null se nessuno. */
  focus: string | null
  /** L'animazione di genesi è stata già vista in questa sessione. */
  genesiVista: boolean
  /** La scena è pronta a mostrarsi (modelli caricati o timeout scaduto). */
  pronta: boolean
  /** Il 3D è disattivato: niente WebGL, oppure reduced-motion. */
  statica: boolean

  setRotta: (r: ScenaRotta) => void
  setFocus: (slug: string | null) => void
  segnaGenesiVista: () => void
  setPronta: (v: boolean) => void
  setStatica: (v: boolean) => void
}

const CHIAVE_GENESI = 'strato:genesi-vista'

function genesiGiaVista(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(CHIAVE_GENESI) === '1'
  } catch {
    // Safari in navigazione privata può lanciare. Peggio che vada, la si rivede.
    return false
  }
}

export const useScene = create<SceneState>()((set) => ({
  rotta: 'nessuna',
  focus: null,
  genesiVista: genesiGiaVista(),
  pronta: false,
  statica: false,

  setRotta: (rotta) => set({ rotta }),
  setFocus: (focus) => set({ focus }),
  setPronta: (pronta) => set({ pronta }),
  setStatica: (statica) => set({ statica }),

  segnaGenesiVista: () =>
    set(() => {
      try {
        window.sessionStorage.setItem(CHIAVE_GENESI, '1')
      } catch {
        /* non bloccante */
      }
      return { genesiVista: true }
    }),
}))
