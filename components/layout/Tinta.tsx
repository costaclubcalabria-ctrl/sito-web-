'use client'

import { useEffect } from 'react'
import { useScene } from '@/store/useScene'
import { getProduct } from '@/data/products'
import { getColor } from '@/data/materials'

/**
 * La tinta della stanza.
 *
 * Il fondo del sito è neutro — un grigio chiarissimo da cabina di posa — e
 * l'unico colore in pagina è quello del pezzo che stai guardando. Questo
 * componente prende il colore del pezzo a fuoco e lo scrive su `:root` come
 * `--tinta`: il fondo lo raccoglie in un alone larghissimo e tenue.
 *
 * L'effetto è che **la stanza cambia luce quando cambi oggetto**, senza che il
 * fondo smetta mai di essere neutro. È il modo per avere colori accesi senza
 * un'interfaccia colorata: il colore resta dell'oggetto, il fondo lo riflette.
 *
 * Cambia poche volte per pagina (una per pezzo), quindi qui uno stato React va
 * benissimo — non è informazione da leggere a ogni frame.
 */
export function Tinta() {
  const focus = useScene((s) => s.focus)

  useEffect(() => {
    const root = document.documentElement

    if (!focus) {
      root.style.setProperty('--tinta-forza', '0')
      return
    }

    const prodotto = getProduct(focus)
    if (!prodotto) return

    const { materiale, colore } = prodotto.modello.colore
    const hex = getColor(materiale, colore).hex
    const n = parseInt(hex.slice(1), 16)

    root.style.setProperty('--tinta', `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`)
    root.style.setProperty('--tinta-forza', '1')
  }, [focus])

  return null
}
