import type { Metadata, Viewport } from 'next'
import { Syne, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

import { Stage } from '@/components/three/Stage'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { Tinta } from '@/components/layout/Tinta'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SkipLinks } from '@/components/layout/SkipLinks'
import { metadataBase, jsonLdOrganizzazione } from '@/lib/seo'
import { t } from '@/i18n'

/**
 * Tre famiglie, tre lavori distinti. Nessuna decorativa.
 *
 * I font sono scaricati a build time e serviti dal nostro dominio: nessuna
 * richiesta a Google a runtime, quindi nessuna risoluzione DNS e nessuna nuova
 * connessione sul percorso critico dell'LCP.
 *
 * `display: swap` è deliberato: il titolo dell'hero **è** l'elemento LCP
 * (`README.md`, budget di performance). Deve comparire subito, anche con il
 * font di sistema, e riformattarsi dopo.
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

/** Le misure si incolonnano: profondità, quote, spessori, tempi. */
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-jb',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = metadataBase()

export const viewport: Viewport = {
  // Il colore della barra di sistema è quello del primo strato: la pagina
  // sembra cominciare dal bordo dello schermo.
  themeColor: '#efeff1',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  // Nessun `maximumScale`: impedire lo zoom è una barriera di accessibilità.
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${syne.variable} ${inter.variable} ${mono.variable}`}>
      <body className="relative min-h-svh antialiased">
        <SkipLinks />

        {/* La stanza: fondo neutro, e sopra l'alone del colore del pezzo a
            fuoco. È CSS puro, quindi visibile a 0 ms e identico nel fallback. */}
        <div className="stanza" aria-hidden="true" />
        <div className="tinta" aria-hidden="true" />
        <div className="grana" aria-hidden="true" />

        {/* Prende il colore del pezzo a fuoco e lo scrive su `:root`: è così
            che la stanza cambia luce quando cambi oggetto. */}
        <Tinta />

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
