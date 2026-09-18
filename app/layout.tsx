import type { Metadata, Viewport } from 'next'
import { Syne, Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'

import { Stage } from '@/components/three/Stage'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SkipLinks } from '@/components/layout/SkipLinks'
import { metadataBase, jsonLdOrganizzazione } from '@/lib/seo'
import { t } from '@/i18n'

/**
 * I font sono scaricati a build time e serviti dal nostro dominio: nessuna
 * richiesta a Google a runtime, quindi nessuna risoluzione DNS e nessuna nuova
 * connessione sul percorso critico dell'LCP.
 *
 * `display: swap` è deliberato: il titolo dell'hero È l'elemento LCP
 * (PLAN.md §8). Deve comparire subito, anche con il font di sistema, e
 * riformattarsi dopo. Un `block` qui costerebbe mezzo secondo di LCP.
 */
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument',
  display: 'swap',
})

export const metadata: Metadata = metadataBase()

export const viewport: Viewport = {
  // Il colore della barra di sistema coincide con la cima del cielo: su mobile
  // la pagina sembra iniziare dal bordo dello schermo.
  themeColor: '#05040f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // Nessun `maximumScale`: impedire lo zoom è una barriera di accessibilità.
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${syne.variable} ${inter.variable} ${instrument.variable}`}>
      <body className="relative min-h-svh antialiased">
        {/* L'atmosfera: quattro livelli di CSS puro, visibili prima di qualunque
            JavaScript. È anche ciò che si vede dietro il canvas trasparente, e
            resta identica nel fallback senza WebGL. */}
        <div className="sky" aria-hidden="true" />
        <div className="sky-stars" aria-hidden="true" />
        <div className="sky-grain" aria-hidden="true" />
        <div className="sky-vignette" aria-hidden="true" />

        <SkipLinks />

        {/* Il canvas persistente. Vive qui, sopra il router: non viene mai
            smontato al cambio rotta (PLAN.md §3.1). */}
        <Stage />

        <SmoothScroll />

        <div className="relative z-10 flex min-h-svh flex-col">
          <Header />
          <main id="contenuto" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganizzazione()) }}
        />
        <span className="sr-only">{t.brand.payoff}</span>
      </body>
    </html>
  )
}
