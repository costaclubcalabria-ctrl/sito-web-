import type { Metadata } from 'next'
import type { Product } from '@/types/catalog'
import { prezzoMinimoCent } from '@/data/products'
import { t } from '@/i18n'

/** L'origine pubblica del sito. In sviluppo cade su localhost. */
export const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'

export const OG_LOCALE = 'it_IT'

export function assoluto(path: string): string {
  return new URL(path, SITE_URL).toString()
}

export function metadataBase(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t.brand.nome} — ${t.brand.posizionamento}`,
      template: `%s — ${t.brand.nome}`,
    },
    description:
      'Oggetti da esposizione, decor e regali stampati in 3D. Pezzi pronti da spedire e produzione su misura, dall’Italia.',
    applicationName: t.brand.nome,
    openGraph: {
      type: 'website',
      locale: OG_LOCALE,
      siteName: t.brand.nome,
      url: SITE_URL,
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
    alternates: { canonical: '/' },
  }
}

/**
 * JSON-LD di un prodotto.
 *
 * Nota sulla disponibilità: i pezzi "su misura" non sono `InStock` ma
 * `MadeToOrder`. Dichiararli disponibili subito sarebbe una promessa che la
 * produzione non può mantenere, e Google la usa per i rich result.
 */
export function jsonLdProdotto(p: Product) {
  const prezzo = prezzoMinimoCent(p)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nome,
    description: p.descrizione,
    sku: p.varianti[0]?.sku,
    category: p.categoria,
    brand: { '@type': 'Brand', name: t.brand.nome },
    image: [assoluto(p.modello.poster)],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: (prezzo / 100).toFixed(2),
      highPrice: (Math.max(...p.varianti.map((v) => v.prezzoCent)) / 100).toFixed(2),
      offerCount: p.varianti.length,
      availability: p.disponibileSubito
        ? 'https://schema.org/InStock'
        : 'https://schema.org/MadeToOrder',
      url: assoluto(`/prodotti/${p.slug}`),
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IT' },
      },
    },
  }
}

export function jsonLdOrganizzazione() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: t.brand.nome,
    url: SITE_URL,
    slogan: t.brand.payoff,
    areaServed: 'IT',
  }
}
