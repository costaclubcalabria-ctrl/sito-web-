import type { MetadataRoute } from 'next'
import { getProducts } from '@/data/products'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const ora = new Date()

  const statiche = ['', '/catalogo', '/su-richiesta', '/studio', '/contatti', '/legale/privacy', '/legale/cookie', '/legale/termini', '/legale/recesso']

  return [
    ...statiche.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: ora,
      changeFrequency: (path === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: path === '' ? 1 : 0.6,
    })),
    ...getProducts().map((p) => ({
      url: `${SITE_URL}/prodotti/${p.slug}`,
      lastModified: ora,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
