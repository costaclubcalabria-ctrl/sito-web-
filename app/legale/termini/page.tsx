import type { Metadata } from 'next'
import { PaginaSemplice } from '@/components/ui/PaginaSemplice'

export const metadata: Metadata = {
  title: 'Termini di **vendita**',
  description: 'Condizioni generali di vendita, tempi di produzione, spedizione e pagamenti.',
  alternates: { canonical: '/legale/termini' },
  robots: { index: false, follow: true },
}

/** ⚠️ In lavorazione — contenuto completo previsto nella Fase 5 (vedi PLAN.md §7). */
export default function Pagina() {
  return (
    <PaginaSemplice titolo="Termini di **vendita**" sopratitolo="Legale">
      <p>Condizioni generali di vendita, tempi di produzione, spedizione e pagamenti.</p>
      <p className="text-ink-muted">Questa pagina è in lavorazione: il contenuto completo arriva nella Fase 5.</p>
    </PaginaSemplice>
  )
}
