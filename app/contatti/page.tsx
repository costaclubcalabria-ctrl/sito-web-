import type { Metadata } from 'next'
import { PaginaSemplice } from '@/components/ui/PaginaSemplice'

export const metadata: Metadata = {
  title: '**Contatti**',
  description: 'Scrivici per un preventivo, per un ordine in corso o per una collaborazione.',
  alternates: { canonical: '/contatti' },
  robots: { index: true, follow: true },
}

/** ⚠️ In lavorazione — contenuto completo previsto nella Fase 5 (vedi PLAN.md §7). */
export default function Pagina() {
  return (
    <PaginaSemplice titolo="**Contatti**" sopratitolo="Parliamone">
      <p>Scrivici per un preventivo, per un ordine in corso o per una collaborazione.</p>
      <p className="text-ink-muted">Questa pagina è in lavorazione: il contenuto completo arriva nella Fase 5.</p>
    </PaginaSemplice>
  )
}
