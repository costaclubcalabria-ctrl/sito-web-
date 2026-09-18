import type { Metadata } from 'next'
import { PaginaSemplice } from '@/components/ui/PaginaSemplice'

export const metadata: Metadata = {
  title: 'Informativa **cookie**',
  description: 'Quali cookie usiamo, a cosa servono e come revocare il consenso.',
  alternates: { canonical: '/legale/cookie' },
  robots: { index: false, follow: true },
}

/** ⚠️ In lavorazione — contenuto completo previsto nella Fase 5 (vedi PLAN.md §7). */
export default function Pagina() {
  return (
    <PaginaSemplice titolo="Informativa **cookie**" sopratitolo="Legale">
      <p>Quali cookie usiamo, a cosa servono e come revocare il consenso.</p>
      <p className="text-ink-muted">Questa pagina è in lavorazione: il contenuto completo arriva nella Fase 5.</p>
    </PaginaSemplice>
  )
}
