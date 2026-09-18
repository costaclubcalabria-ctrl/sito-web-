/**
 * Spedizione. Confermata dal cliente: 8,99 € in Italia, gratuita da 90,00 €.
 *
 * Questi valori sono usati **solo lato server** per costruire le
 * `shipping_options` della sessione Stripe, e lato client solo per *mostrare*
 * quanto manca alla soglia. Il calcolo che conta è quello del server.
 */
export const SHIPPING = {
  /** Costo standard in centesimi. */
  costoCent: 899,
  /** Da questo subtotale (centesimi) in su la spedizione è gratuita. */
  sogliaGratuitaCent: 9000,
  /** Solo Italia, per ora. Codici ISO 3166-1 alpha-2. */
  paesiAmmessi: ['IT'] as const,
  /** Giorni lavorativi indicativi dopo la spedizione. */
  giorniConsegna: [2, 4] as const,
  corriere: 'Corriere espresso con tracciamento',
} as const

export function costoSpedizioneCent(subtotaleCent: number): number {
  return subtotaleCent >= SHIPPING.sogliaGratuitaCent ? 0 : SHIPPING.costoCent
}

/** Quanto manca alla spedizione gratuita. 0 se già raggiunta. */
export function mancanteSogliaCent(subtotaleCent: number): number {
  return Math.max(0, SHIPPING.sogliaGratuitaCent - subtotaleCent)
}
