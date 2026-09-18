import { t } from '@/i18n'

/**
 * Il logotipo: la parola attraversata da una hairline a metà altezza —
 * l'orizzonte e il piano di stampa insieme (DESIGN.md §3).
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`relative inline-block font-display text-lg leading-none font-semibold tracking-[0.22em] [margin-right:-0.22em] ${className}`}>
      {t.brand.nome}
      <span
        aria-hidden="true"
        className="absolute top-1/2 -left-1 right-[calc(0.22em-0.25rem)] h-px bg-accent/45"
      />
    </span>
  )
}
