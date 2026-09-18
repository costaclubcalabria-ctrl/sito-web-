'use client'

import { useEffect, useState } from 'react'
import { PROFONDITA_MAX, STRATI, type Strato } from '@/data/strati'
import { t } from '@/i18n'

/**
 * L'indicatore di profondità.
 *
 * Non è una barra di scorrimento: è la **colonna di una carota geologica**.
 * Dice a che profondità sei in millimetri e in che materiale ti trovi — le
 * stesse due informazioni che leggeresti su un log di sondaggio, o sul display
 * di una stampante a metà lavoro.
 *
 * È anche navigazione: ogni tacca è un salto allo strato corrispondente. Ed è
 * la sola cosa nel sito che ti dice dove sei, perché in una pagina che cambia
 * materiale mentre scendi la posizione non è più ovvia.
 *
 * Nascosto sotto i 1024 px: su mobile lo spazio a lato non c'è, e la profondità
 * compare invece nell'intestazione.
 */
export function ProfonditaRail() {
  const [mm, setMm] = useState(0)

  useEffect(() => {
    const root = document.documentElement
    let raf = 0

    const leggi = () => {
      raf = 0
      const v = Number(root.dataset['profondita'] ?? 0)
      setMm((prec) => (prec === v ? prec : v))
    }

    const onScroll = () => {
      if (raf === 0) raf = window.requestAnimationFrame(leggi)
    }

    leggi()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  const primo = STRATI[0]
  const materiale = STRATI.reduce<Strato | undefined>(
    (acc, s) => (mm >= s.profonditaMm ? s : acc),
    primo,
  )
  if (!materiale) return null

  return (
    <aside
      aria-label={t.profondita.etichetta}
      className="pointer-events-none fixed top-1/2 right-[clamp(1rem,2.5vw,2rem)] z-30 hidden -translate-y-1/2 lg:block"
    >
      <div className="flex items-stretch gap-3">
        {/* La colonna: una tacca per strato, quella corrente piena. */}
        <ol className="pointer-events-auto flex flex-col justify-between" style={{ height: '13rem' }}>
          {STRATI.map((s) => {
            const attivo = s.id === materiale.id
            return (
              <li key={s.id} className="flex items-center justify-end">
                <a
                  href={`#strato-${s.id}`}
                  aria-current={attivo ? 'true' : undefined}
                  title={`${s.nome} — ${s.profonditaMm} mm`}
                  className="group flex items-center gap-2 py-1"
                >
                  <span
                    className="quota opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    {s.nome}
                  </span>
                  <span
                    aria-hidden="true"
                    className="block h-px transition-all duration-300"
                    style={{
                      width: attivo ? 28 : 14,
                      background: attivo ? 'var(--color-ugello)' : 'var(--linea-corrente)',
                    }}
                  />
                  <span className="sr-only">
                    {s.nome}, {s.profonditaMm} millimetri
                  </span>
                </a>
              </li>
            )
          })}
        </ol>

        {/* La lettura corrente. Monospaziata e incolonnata: è una misura. */}
        <div className="flex flex-col items-start justify-center border-l pl-3" style={{ borderColor: 'var(--linea-corrente)' }}>
          <span data-numeric className="font-mono text-sm leading-none tabular-nums" style={{ color: 'var(--ink-corrente)' }}>
            {String(mm).padStart(3, '0')}
          </span>
          <span className="quota mt-1">mm / {PROFONDITA_MAX}</span>
          <span className="quota mt-3" style={{ color: 'var(--color-ugello)' }}>
            {materiale.nome}
          </span>
        </div>
      </div>
    </aside>
  )
}
