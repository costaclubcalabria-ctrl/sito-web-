import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // three.js non ha un entrypoint ESM ottimizzato: senza questo, ogni import
  // da 'three' trascina l'intera libreria nel chunk.
  transpilePackages: ['three'],

  experimental: {
    optimizePackageImports: ['@react-three/drei', 'lucide-react'],
  },

  async headers() {
    return [
      {
        // I modelli e i font sono immutabili: il nome cambia quando cambia il file.
        source: '/:path(models|fonts)/:file*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), gyroscope=(self)' },
        ],
      },
    ]
  },
}

export default nextConfig
