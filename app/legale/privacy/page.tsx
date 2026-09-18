import type { Metadata } from 'next'
import { PaginaSemplice } from '@/components/ui/PaginaSemplice'

export const metadata: Metadata = {
  title: 'Informativa **privacy**',
  description: 'Come trattiamo i dati personali di chi visita il sito, ordina o richiede un preventivo.',
  alternates: { canonical: '/legale/privacy' },
  robots: { index: false, follow: true },
}

/** ⚠️ In lavorazione — contenuto completo previsto nella Fase 5 (vedi PLAN.md §7). */
export default function Pagina() {
  return (
    <PaginaSemplice titolo="Informativa **privacy**" sopratitolo="Legale">
      <p>Come trattiamo i dati personali di chi visita il sito, ordina o richiede un preventivo.</p>
      <p className="text-ink-muted">Questa pagina è in lavorazione: il contenuto completo arriva nella Fase 5.</p>
    </PaginaSemplice>
  )
}
