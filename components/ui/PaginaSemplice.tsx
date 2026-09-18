import type { ReactNode } from 'react'
import { Titolo } from './Titolo'

/** Impaginazione condivisa dalle pagine di solo testo. */
export function PaginaSemplice({
  titolo,
  sopratitolo,
  children,
}: {
  titolo: string
  sopratitolo?: string
  children: ReactNode
}) {
  return (
    <article className="content-grid pt-40 pb-28 sm:pt-52">
      {sopratitolo && <p className="spec mb-6">{sopratitolo}</p>}
      <Titolo as="h1" testo={titolo} className="text-display-l text-ink" />
      <div className="measure mt-10 space-y-5 text-ink-soft [&_h2]:mt-12 [&_h2]:text-title-m [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
        {children}
      </div>
    </article>
  )
}
