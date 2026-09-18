import type { Metadata } from 'next'
import { PaginaSemplice } from '@/components/ui/PaginaSemplice'

export const metadata: Metadata = {
  title: 'Lo **studio**',
  description: 'Come progettiamo e stampiamo: materiali, macchine, controllo qualità e tempi reali di produzione.',
  alternates: { canonical: '/studio' },
  robots: { index: true, follow: true },
}

/** ⚠️ In lavorazione — contenuto completo previsto nella Fase 5 (vedi PLAN.md §7). */
export default function Pagina() {
  return (
    <PaginaSemplice titolo="Lo **studio**" sopratitolo="Processo">
      <p>Come progettiamo e stampiamo: materiali, macchine, controllo qualità e tempi reali di produzione.</p>
      <p className="text-ink-muted">Questa pagina è in lavorazione: il contenuto completo arriva nella Fase 5.</p>
    </PaginaSemplice>
  )
}
