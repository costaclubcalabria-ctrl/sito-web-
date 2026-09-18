'use client'

import type Lenis from 'lenis'

/**
 * Riferimento all'istanza di Lenis.
 *
 * Serve per portare lo scroll a un punto preciso da codice — per esempio
 * quando il focus da tastiera arriva su un prodotto e la camera deve
 * raggiungerlo (DESIGN.md §8). Con `prefers-reduced-motion` Lenis non esiste e
 * si ricade sullo scroll nativo: il comportamento resta corretto.
 */
let istanza: Lenis | null = null

export function setLenis(l: Lenis | null): void {
  istanza = l
}

export function getLenis(): Lenis | null {
  return istanza
}

/** Porta lo scroll a una posizione assoluta in pixel, con o senza Lenis. */
export function scrollA(y: number, immediato = false): void {
  if (istanza && !immediato) {
    istanza.scrollTo(y, { duration: 1.1 })
    return
  }
  window.scrollTo({ top: y, behavior: immediato ? 'auto' : 'smooth' })
}
