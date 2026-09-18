import type { Metadata } from 'next'
import { PaginaSemplice } from '@/components/ui/PaginaSemplice'

export const metadata: Metadata = {
  title: 'Diritto di **recesso**',
  description: 'Come esercitare il recesso entro 14 giorni. I prodotti personalizzati ne sono esclusi (art. 59 Codice del Consumo).',
  alternates: { canonical: '/legale/recesso' },
  robots: { index: false, follow: true },
}

/** ⚠️ In lavorazione — contenuto completo previsto nella Fase 5 (vedi PLAN.md §7). */
export default function Pagina() {
  return (
    <PaginaSemplice titolo="Diritto di **recesso**" sopratitolo="Legale">
      <p>Come esercitare il recesso entro 14 giorni. I prodotti personalizzati ne sono esclusi (art. 59 Codice del Consumo).</p>
      <p className="text-ink-muted">Questa pagina è in lavorazione: il contenuto completo arriva nella Fase 5.</p>
    </PaginaSemplice>
  )
}
