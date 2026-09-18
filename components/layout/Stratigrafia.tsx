'use client'

import { useEffect } from 'react'
import { STRATI, misceleStrati, PROFONDITA_MAX } from '@/data/strati'
import { frame } from '@/lib/frame'

/**
 * Il motore della stratigrafia.
 *
 * È il componente che rende il concetto un meccanismo invece di un tema: legge
 * la posizione nel documento e la traduce in **materiale corrente** e
 * **profondità in millimetri**, scrivendoli come variabili su `:root`. Da lì li
 * legge tutto il resto — fondo, colore del testo, colore delle linee,
 * indicatore di profondità.
 *
 * Nessun componente decide da sé se è su uno strato chiaro o profondo: lo sa
 * perché lo strato glielo dice. È così che il contrasto non può essere
 * sbagliato in un punto solo.
 *
 * ⚠️ Il materiale è ancorato alle **sezioni reali**, non a una frazione dello
 * scroll.
 *
 * La prima versione mappava il progresso del documento linearmente sui sei
 * strati. Sembrava equivalente ed era sbagliato: le sezioni non sono alte
 * uguali, quindi mentre si leggeva il catalogo (ocra) il fondo era già ardesia,
 * e la quota in millimetri non corrispondeva a niente di visibile. Ora si
 * misurano le posizioni degli ancoraggi `#strato-…` e si interpola fra quelli:
 * il materiale che vedi è il materiale della sezione che stai leggendo, e la
 * quota è un'informazione vera.
 *
 * Scrive su `document.documentElement.style`, non in uno store React: succede a
 * ogni frame di scroll, e passare da React significherebbe un re-render
 * dell'intero albero per ogni millimetro di profondità (PLAN.md §3.2).
 */
export function Stratigrafia() {
  useEffect(() => {
    const root = document.documentElement
    let rafId = 0
    let ancore: { top: number; i: number }[] = []
    let ultimoScuro = -1
    let ultimaProfondita = -1

    /** Rilegge dove cominciano le sezioni. Da rifare a ogni riflusso. */
    function misura() {
      ancore = []
      for (let i = 0; i < STRATI.length; i++) {
        const s = STRATI[i]
        if (!s) continue
        const el = document.getElementById(`strato-${s.id}`)
        if (!el) continue
        ancore.push({ top: el.getBoundingClientRect().top + window.scrollY, i })
      }
      // Se il documento non dichiara gli ancoraggi (per esempio su una pagina
      // secondaria) si resta sul primo strato: nessun salto di colore.
      ancore.sort((a, b) => a.top - b.top)
    }

    function applica() {
      rafId = 0
      if (ancore.length < 2) return

      // Il fondo dello schermo, non la cima: è ciò che si sta "raggiungendo",
      // e usare la cima farebbe cambiare materiale in ritardo di una schermata.
      const y = window.scrollY + window.innerHeight * 0.62

      let k = 0
      while (k < ancore.length - 2 && y >= (ancore[k + 1]?.top ?? Infinity)) k++

      const a = ancore[k]
      const b = ancore[k + 1]
      if (!a || !b) return

      const corsa = b.top - a.top
      const locale = corsa > 0 ? Math.min(1, Math.max(0, (y - a.top) / corsa)) : 0

      const da = STRATI[a.i]
      const ad = STRATI[b.i]
      if (!da || !ad) return

      root.style.setProperty('--bg-corrente', misceleStrati(da.id, ad.id, locale))

      // L'inversione avviene di scatto, a metà del passaggio: un testo che
      // sfuma da inchiostro a carta passa per un grigio illeggibile.
      const scuro = (locale < 0.5 ? da.scuro : ad.scuro) ? 1 : 0
      if (scuro !== ultimoScuro) {
        ultimoScuro = scuro
        root.dataset['stratoScuro'] = String(scuro)
      }

      // La quota interpola fra le profondità dichiarate dai due strati: così
      // "192 mm" cade davvero fra terracotta (152) e ardesia (196).
      const mm = Math.round(da.profonditaMm + (ad.profonditaMm - da.profonditaMm) * locale)
      if (mm !== ultimaProfondita) {
        ultimaProfondita = mm
        root.style.setProperty('--profondita-mm', String(mm))
        root.dataset['profondita'] = String(mm)
        root.dataset['materiale'] = (locale < 0.5 ? da : ad).nome
      }

      frame.profondita = mm / PROFONDITA_MAX
    }

    function onScroll() {
      // Un solo calcolo per frame, qualunque sia la frequenza degli eventi.
      if (rafId === 0) rafId = window.requestAnimationFrame(applica)
    }

    function onResize() {
      misura()
      onScroll()
    }

    misura()
    applica()

    // I font cambiano l'altezza del testo: senza questa rimisura, le posizioni
    // calcolate prima dello swap restano sbagliate per tutta la sessione.
    void document.fonts?.ready.then(onResize)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
