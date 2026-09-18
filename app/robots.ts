import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Le pagine di esito del checkout non hanno contenuto da indicizzare e
      // possono contenere l'id di sessione Stripe nell'URL.
      disallow: ['/checkout/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
