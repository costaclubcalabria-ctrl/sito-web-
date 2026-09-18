'use client'

import { useEffect } from 'react'
import { STRATI, misceleStrati, profonditaMm } from '@/data/strati'
import { frame } from '@/lib/frame'

/**
 * Il motore della stratigrafia.
 *
 * È il componente che rende il concetto un meccanismo invece di un tema:
 * legge la posizione nel documento e la traduce in **materiale corrente** e
 * **profondità in millimetri**, scrivendoli come variabili su `:root`.
 *
 * Da lì li legge tutto il resto — fondo della pagina, colore del testo, colore
 * delle linee, indicatore di profondità. Nessun componente decide da sé se è
 * su uno strato chiaro o profondo: lo sa perché lo strato glielo dice. È così
 * che il contrasto non può essere sbagliato in un punto solo.
 *
 * ⚠️ Scrive su `document.documentElement.style`, non in uno store React:
 * succede a ogni frame di scroll, e passare da React significherebbe un
 * re-render dell'intero albero per ogni millimetro di profondità
 * (PLAN.md §3.2).
 */
export function Stratigrafia() {
  useEffect(() => {
    const root = document.documentElement
    let rafId = 0
    let ultimoScuro = -1
    let ultimaProfondita = -1

    function applica() {
      rafId = 0

      const corsa = document.documentElement.scrollHeight - window.innerHeight
      const p = corsa > 0 ? Math.min(1, Math.max(0, window.scrollY / corsa)) : 0

      // Dove siamo nella successione degli strati.
      const scala = p * (STRATI.length - 1)
      const i = Math.min(STRATI.length - 2, Math.floor(scala))
      const locale = scala - i

      const da = STRATI[i]
      const a = STRATI[i + 1]
      if (!da || !a) return

      root.style.setProperty('--bg-corrente', misceleStrati(da.id, a.id, locale))

      // L'inversione avviene di scatto, a metà del passaggio: un testo che
      // sfuma da inchiostro a carta passa per un grigio illeggibile.
      const scuro = (locale < 0.5 ? da.scuro : a.scuro) ? 1 : 0
      if (scuro !== ultimoScuro) {
        ultimoScuro = scuro
        root.dataset['stratoScuro'] = String(scuro)
      }

      const mm = profonditaMm(p)
      if (mm !== ultimaProfondita) {
        ultimaProfondita = mm
        root.style.setProperty('--profondita-mm', String(mm))
        // Un attributo, non uno stato: l'indicatore lo legge con il CSS.
        root.dataset['profondita'] = String(mm)
        root.dataset['materiale'] = (locale < 0.5 ? da : a).nome
      }

      frame.profondita = p
    }

    function onScroll() {
      // Un solo calcolo per frame, qualunque sia la frequenza degli eventi.
      if (rafId === 0) rafId = window.requestAnimationFrame(applica)
    }

    applica()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
