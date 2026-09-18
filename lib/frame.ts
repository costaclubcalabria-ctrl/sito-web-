/**
 * Stato letto a ogni frame dalla scena 3D.
 *
 * ⚠️ Volutamente NON è uno store React. Scroll, mouse e giroscopio cambiano
 * decine di volte al secondo: se passassero da `useState` o da Zustand
 * farebbero un re-render per frame. Qui sono un semplice oggetto di modulo,
 * scritto dal DOM e letto dentro `useFrame`. È la regola portante di PLAN.md §3.2.
 *
 * I valori sono già normalizzati e smorzati: chi legge non deve interpolare.
 */
export interface FrameState {
  /** Progresso della sequenza di scroll della home, 0 → 1. */
  scroll: number
  /** Puntatore normalizzato, -1 → 1, già smorzato (lerp 0.05). */
  pointerX: number
  pointerY: number
  /** Inclinazione da giroscopio, -1 → 1, ampiezza dimezzata rispetto al mouse. */
  tiltX: number
  tiltY: number
  /** Progresso dell'animazione di genesi, 0 → 1. */
  genesi: number
}

export const frame: FrameState = {
  scroll: 0,
  pointerX: 0,
  pointerY: 0,
  tiltX: 0,
  tiltY: 0,
  genesi: 0,
}

/** Interpolazione indipendente dal frame rate: stessa sensazione a 30 e a 120 fps. */
export function damp(corrente: number, obiettivo: number, lambda: number, dt: number): number {
  return corrente + (obiettivo - corrente) * (1 - Math.exp(-lambda * dt))
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Rimappa v da [a,b] a [0,1], con taglio agli estremi. */
export function range(v: number, a: number, b: number): number {
  return clamp01((v - a) / (b - a))
}

/** Come range, ma con una salita e una discesa: 0 → 1 → 0. */
export function pulse(v: number, a: number, picco: number, b: number): number {
  return v <= picco ? range(v, a, picco) : 1 - range(v, picco, b)
}
