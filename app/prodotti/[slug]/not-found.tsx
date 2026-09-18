import { PillLink } from '@/components/ui/Pill'
import { t } from '@/i18n'

export default function NonTrovato() {
  return (
    <div className="content-grid pt-40 pb-28 sm:pt-52">
      <h1 className="text-display-l text-ink">{t.errori.prodottoNonTrovato}</h1>
      <p className="measure mt-6 text-body-l text-ink-soft">{t.errori.prodottoNonTrovatoTesto}</p>
      <div className="mt-10">
        <PillLink href="/catalogo">{t.errori.tornaAlCatalogo}</PillLink>
      </div>
    </div>
  )
}
