'use client'

import { create } from 'zustand'

interface UiState {
  carrelloAperto: boolean
  menuAperto: boolean
  apriCarrello: () => void
  chiudiCarrello: () => void
  toggleMenu: () => void
  chiudiTutto: () => void
}

export const useUi = create<UiState>()((set) => ({
  carrelloAperto: false,
  menuAperto: false,
  apriCarrello: () => set({ carrelloAperto: true, menuAperto: false }),
  chiudiCarrello: () => set({ carrelloAperto: false }),
  toggleMenu: () => set((s) => ({ menuAperto: !s.menuAperto, carrelloAperto: false })),
  chiudiTutto: () => set({ carrelloAperto: false, menuAperto: false }),
}))
