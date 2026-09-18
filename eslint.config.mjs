import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * Configurazione flat. `eslint-config-next` 16 esporta già array flat, quindi
 * non serve il ponte `FlatCompat` (e una dipendenza in meno).
 */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'public/**'] },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },

  {
    // ------------------------------------------------------------------------
    // Il codice della scena 3D.
    //
    // Le regole del React Compiler qui sotto vietano di mutare oggetti e ref
    // fuori dal render. È una regola giusta per React — e sbagliata per
    // React Three Fiber, dove `useFrame` gira **fuori** dal ciclo di render, 60
    // volte al secondo, e scrivere su `camera.position` o su un uniform è
    // l'unico modo corretto di animare.
    //
    // Non è una scappatoia: è esattamente la disciplina descritta in
    // PLAN.md §3.2. Lo stato che cambia per frame NON deve passare da React,
    // altrimenti sono 60 re-render al secondo dell'intero albero. Se queste
    // regole valessero qui, l'unico modo di rispettarle sarebbe distruggere la
    // performance.
    //
    // Restano attive ovunque nel resto del progetto.
    // ------------------------------------------------------------------------
    files: ['components/three/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default config
