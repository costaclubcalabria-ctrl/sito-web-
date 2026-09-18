'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { t } from '@/i18n'

/**
 * Menu di navigazione per schermi stretti.
 *
 * L'unico componente client dell'header: tutto il resto è HTML statico. Quando
 * il menu è chiuso non fa nulla e non ascolta nulla.
 *
 * Accessibilità: `aria-expanded` e `aria-controls`, `Esc` chiude, il focus
 * torna al pulsante, e un click fuori chiude. Sono le quattro cose che
 * trasformano un menu che "funziona col mouse" in un menu che funziona.
 */
export function MenuMobile({ voci }: { voci: readonly { href: string; label: string }[] }) {
  const [aperto, setAperto] = useState(false)
  const pulsante = useRef<HTMLButtonElement>(null)
  const pannello = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!aperto) return

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setAperto(false)
      pulsante.current?.focus()
    }

    function onPointer(e: PointerEvent) {
      const t = e.target
      if (!(t instanceof Node)) return
      if (pannello.current?.contains(t) || pulsante.current?.contains(t)) return
      setAperto(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [aperto])

  return (
    <div className="sm:hidden">
      <button
        ref={pulsante}
        type="button"
        onClick={() => setAperto((v) => !v)}
        aria-expanded={aperto}
        aria-controls={id}
        aria-label={aperto ? t.nav.chiudiMenu : t.nav.apriMenu}
        className="inline-flex size-11 items-center justify-center rounded-full border border-glass-line text-ink"
      >
        <span aria-hidden="true" className="relative block h-3 w-4">
          <span
            className="absolute inset-x-0 block h-px bg-current transition-transform duration-200"
            style={{ top: aperto ? '50%' : 0, transform: aperto ? 'rotate(45deg)' : 'none' }}
          />
          <span
            className="absolute inset-x-0 block h-px bg-current transition-opacity duration-200"
            style={{ top: '50%', opacity: aperto ? 0 : 1 }}
          />
          <span
            className="absolute inset-x-0 block h-px bg-current transition-transform duration-200"
            style={{ top: aperto ? '50%' : '100%', transform: aperto ? 'rotate(-45deg)' : 'none' }}
          />
        </span>
      </button>

      {aperto && (
        <div
          ref={pannello}
          id={id}
          className="glass-strong absolute inset-x-0 top-[calc(100%+0.5rem)] p-2"
        >
          <ul>
            {voci.map((v) => (
              <li key={v.href}>
                <Link
                  href={v.href}
                  onClick={() => setAperto(false)}
                  className="flex min-h-12 items-center rounded-2xl px-4 text-ink transition-colors hover:bg-glass"
                >
                  {v.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
