import type { Metadata } from 'next'
import { PaginaSemplice } from '@/components/ui/PaginaSemplice'

export const metadata: Metadata = {
  title: 'Crea **su richiesta**',
  description: 'Caricaci il tuo file 3D o uno schizzo: ti rispondiamo con un preventivo entro 48 ore. Nessun prezzo automatico.',
  alternates: { canonical: '/su-richiesta' },
  robots: { index: true, follow: true },
}

/** ⚠️ In lavorazione — contenuto completo previsto nella Fase 4 (vedi PLAN.md §7). */
export default function Pagina() {
  return (
    <PaginaSemplice titolo="Crea **su richiesta**" sopratitolo="Preventivo">
      <p>Caricaci il tuo file 3D o uno schizzo: ti rispondiamo con un preventivo entro 48 ore. Nessun prezzo automatico.</p>
      <p className="text-ink-muted">Questa pagina è in lavorazione: il contenuto completo arriva nella Fase 4.</p>
    </PaginaSemplice>
  )
}
