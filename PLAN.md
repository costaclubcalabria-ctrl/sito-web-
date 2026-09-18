# PLAN.md — Piano tecnico

**Progetto:** STRATO — e-commerce 3D per oggetti stampati in 3D
**Direzione creativa:** `DESIGN.md` v1 (approvata) — *Crepuscolo* · hero **C "Strato dopo strato"**
**Stato: BOZZA — in attesa di approvazione. Nessun codice scritto prima del tuo via.**

---

## 1. Decisioni confermate

| | |
|---|---|
| Brand | **STRATO** — payoff *"Strato dopo strato."* |
| Palette | *Crepuscolo*: cielo indigo → orizzonte ambra (`DESIGN.md` §4) |
| Hero | **C** — l'oggetto si costruisce a strati sotto una linea di luce che sorge, poi confluisce in *Arcipelago* (A) |
| Pagina prodotto | Idea **B** — capsula di vetro, un oggetto solo in scena |
| Spedizione | **8,99 €** · **gratuita da 90,00 €** · solo Italia |
| Catalogo | **10 prodotti** |
| Ragione sociale / P.IVA | Segnaposto marcati, da sostituire prima del lancio |
| Lingua | Italiano, struttura pronta per l'inglese |

---

## 2. Stack — cosa confermo e cosa cambio

### 2.1 Confermato come da brief

| Tecnologia | Uso | Nota |
|---|---|---|
| **Next.js 15 (App Router) + TypeScript** | Framework, RSC per il contenuto SEO | `strict: true`, niente `any` |
| **Tailwind CSS v4** | Stile, design token in `@theme` | I token di `DESIGN.md` §4 diventano variabili CSS |
| **React Three Fiber + drei + @react-three/postprocessing** | Scena 3D | Caricati in chunk separato, mai nel bundle iniziale |
| **GSAP + ScrollTrigger + Lenis** | Scroll e timeline | ScrollTrigger è gratuito, nessuna licenza da acquistare |
| **Zustand** | Carrello, oggetto a fuoco, stato UI | Persistenza carrello in `localStorage` |
| **Stripe Checkout** | Pagamenti | Vedi §2.3 |
| **`/data/products.ts`** | Prodotti tipizzati | **Fonte di verità dei prezzi**, anche lato server |
| **Resend + React Email** | Email transazionali e preventivi | Richiede un dominio verificato |
| **Vercel** | Deploy | |

### 2.2 ⚠️ Un problema del brief che va risolto ora: l'upload dei file

Il flusso "Crea su richiesta" prevede l'upload di STL/3MF/OBJ. Un STL di un oggetto medio pesa **10–80 MB**. Ci sono due limiti che il brief non considera:

1. **Il body di una serverless function su Vercel è limitato a 4,5 MB.** Un `POST` del file a una API route **fallisce**, punto.
2. **Resend accetta al massimo ~40 MB di allegati**, e comunque caricare l'STL in memoria per allegarlo fa esplodere la funzione.

**Soluzione:** **Vercel Blob con upload diretto dal browser** (`@vercel/blob/client`). Il server firma solo un token di autorizzazione; i byte vanno dal browser allo storage senza passare dalla funzione. L'email contiene **link firmati**, non allegati.

- Limiti applicati: max **5 file**, max **50 MB ciascuno**, estensioni `.stl .3mf .obj .step .stp .png .jpg .webp .pdf`
- Validazione dell'estensione *e* del magic number lato server prima di firmare il token
- **Costo, detto chiaramente:** Vercel Blob ha una quota gratuita limitata e poi si paga a GB. Alternative equivalenti: Cloudflare R2 (più economico a volume, ~30 min di setup in più) o S3 presigned. Se preferisci R2 lo cambio: è un solo modulo, `lib/blob.ts`.
- **Privacy:** il modello 3D caricato è proprietà intellettuale del cliente. Gli URL sono non indovinabili, e in `MODELS.md` documento una policy di cancellazione a 90 giorni (da attivare con un cron Vercel).

L'**anteprima 3D dell'STL** avviene **interamente nel browser**, leggendo il `File` prima dell'upload (`STLLoader`): nessun byte deve arrivare al server per vedere l'anteprima. Sopra i 25 MB l'anteprima si salta con un messaggio, invece di bloccare il thread principale.

### 2.3 Stripe: Checkout ospitato, non embedded

Stripe offre due modalità. Scelgo il **Checkout ospitato con redirect** (`session.url`):

- **Perché:** riduce al minimo l'esposizione PCI, SCA e 3DS sono gestiti da Stripe, funziona subito su mobile, e il carrello a drawer ha già interrotto la narrazione 3D — il redirect non rompe nulla che non fosse già chiuso.
- **Effetto collaterale positivo:** redirigendo dal server non serve la chiave pubblicabile nel client. **Una variabile pubblica in meno e nessun SDK Stripe nel bundle.**
- Se in futuro vuoi restare dentro il sito, si passa a Embedded Checkout cambiando un solo modulo (`lib/stripe.ts` + la pagina carrello).

**Regola di sicurezza non negoziabile:** il carrello nel client contiene **solo `{productId, variantId, qty}`**. Nessun prezzo. `/api/checkout` ricalcola tutto da `data/products.ts` lato server. Un prezzo che arriva dal browser non viene mai usato. È il singolo errore più comune e più costoso in un e-commerce headless.

**Spedizione:** `shipping_options` calcolate lato server sul subtotale ricalcolato — 8,99 € sotto i 90 €, `fixed_amount: 0` da 90 € in su. `shipping_address_collection: { allowed_countries: ['IT'] }`.

### 2.4 i18n: stringhe centralizzate ora, routing dopo

**Non installo `next-intl` adesso.** Motivo, e voglio che sia una scelta consapevole e non una scorciatoia:

- Il lavoro **costoso e irreversibile** dell'i18n è estrarre le stringhe dai componenti. Quello lo faccio **da subito**: ogni testo vive in `i18n/it.ts` con un `t()` tipizzato, e TypeScript segnala una chiave mancante in compilazione.
- Il lavoro **meccanico** è aggiungere il segmento `[locale]` alle rotte, il middleware e i `hreflang`. È mezza giornata, quando servirà davvero.
- Farlo ora costerebbe complessità su ogni link, sul middleware e sui canonical SEO, per una lingua che non lanci. E il canvas persistente rende il routing già delicato di suo.

Migrazione documentata in `README.md`.

### 2.5 Versioni e rischio

R3F 9 / three r17x / React 19 sono un insieme che si muove in fretta. **Blocco le versioni esatte** in `package.json` (niente `^`) e le annoto in `README.md` con la data. Preferisco un aggiornamento manuale e consapevole a un `npm install` che un mese dopo rompe la scena.

---

## 3. Le due decisioni architetturali che reggono tutto

### 3.1 Canvas persistente sopra il router

`DESIGN.md` §6.1 impone *"mai un taglio"*: passare da home a prodotto deve essere un movimento di camera, non un cambio pagina. Questo ha una conseguenza vincolante:

> **Esiste un solo `<Canvas>`, montato nel root layout, che non viene mai smontato.** Le rotte cambiano il DOM sopra di esso; la scena reagisce.

```
app/layout.tsx
  └─ <SkyGradient/>          ← gradiente CSS, visibile a 0 ms, prima di ogni JS
  └─ <Stage/>                ← <Canvas> position:fixed, trasparente, z-0
  │    └─ <SceneDirector/>   ← legge rotta + stato, orchestra camera e oggetti
  └─ <main>{children}</main> ← z-10, tutto il DOM: testo, pannelli, form
```

**Come funziona la transizione di elemento condiviso (shared element):**
1. Ogni oggetto ha un **ancora DOM** — un `<button>` invisibile e focusabile, posizionato dove l'oggetto deve apparire. È lui che tiene il `getBoundingClientRect()`.
2. `SceneDirector` proietta quel rettangolo nello spazio 3D e ci posiziona l'oggetto.
3. Al cambio rotta il DOM cambia le ancore; l'oggetto **interpola** dalla vecchia posizione alla nuova. Non essendo mai stato smontato, non c'è nulla da ricaricare: si muove e basta.
4. Effetto laterale che vale da solo: l'ancora è un vero `<button>`, quindi **navigazione da tastiera e screen reader funzionano per costruzione**, non come aggiunta successiva.

### 3.2 Il 3D non fa mai re-render di React

> **Nessuno stato che cambia a ogni frame passa da `useState`.** Scroll, posizione del mouse, giroscopio, progresso della camera vivono in `useRef` / store letti in modo non reattivo. `useFrame` scrive direttamente su `object.position`, `material.uniforms`, `camera`.

React fa re-render solo quando cambia qualcosa di *semantico*: quale prodotto è a fuoco, quale materiale è selezionato, il contenuto del carrello. È la differenza tra 60 fps e 20.

---

## 4. Struttura delle cartelle

```
strato/
├── app/
│   ├── layout.tsx                  # lang="it", font, SkyGradient, Stage, provider
│   ├── page.tsx                    # Home (RSC)
│   ├── globals.css                 # token Tailwind v4 + base
│   ├── catalogo/page.tsx
│   ├── prodotti/[slug]/
│   │   ├── page.tsx                # RSC: contenuto SEO + JSON-LD Product
│   │   ├── opengraph-image.tsx     # OG generata con next/og
│   │   └── not-found.tsx
│   ├── su-richiesta/page.tsx
│   ├── studio/page.tsx             # chi siamo · processo produttivo
│   ├── contatti/page.tsx
│   ├── legale/{privacy,cookie,termini,recesso}/page.tsx
│   ├── checkout/{successo,annullato}/page.tsx
│   ├── api/
│   │   ├── checkout/route.ts       # crea la Checkout Session
│   │   ├── webhooks/stripe/route.ts# verifica firma → email d'ordine
│   │   ├── richiesta/route.ts      # preventivo → 2 email
│   │   └── upload/route.ts         # firma il token Blob
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── three/
│   │   ├── Stage.tsx               # Canvas persistente, Suspense, adaptive quality
│   │   ├── SceneDirector.tsx       # orchestratore: rotta → camera → oggetti
│   │   ├── rigs/                   # CameraRig · ScrollRig · PointerRig · GyroRig
│   │   ├── objects/                # ProductObject · Pedestal · GlassCapsule
│   │   ├── effects/                # LayerGrowth (hero C) · Horizon · PostFX
│   │   ├── lights/StudioLights.tsx
│   │   └── hooks/                  # useProductModel · useSceneAnchor · useQuality
│   ├── ui/                         # Pill · GlassPanel · SpecList · IndexNumeral · Price
│   ├── layout/                     # Header · Footer · SkipLink · CookieBanner
│   ├── cart/                       # CartDrawer · CartLine · CartSummary
│   ├── product/                    # ProductViewer · MaterialPicker · VariantPicker
│   └── request/                    # RequestFlow · step/* · StlPreview · Dropzone
│
├── data/
│   ├── products.ts                 # 10 prodotti — FONTE DI VERITÀ DEI PREZZI
│   ├── categories.ts
│   ├── materials.ts                # materiali, colori, finiture
│   └── shipping.ts                 # 8,99 € · soglia 90,00 € · IT
│
├── lib/
│   ├── stripe.ts · price.ts · cart.ts · quality.ts
│   ├── seo.ts · blob.ts · email.ts · format.ts
│
├── store/                          # useCart · useScene · useUi
├── i18n/                           # it.ts · t.ts
├── emails/                         # RichiestaStudio · RichiestaCliente · OrdineConfermato
├── types/
│
├── public/
│   ├── models/
│   │   ├── <slug>.glb              # un file per prodotto, < 1,5 MB
│   │   ├── draco/                  # decoder self-hosted
│   │   └── README.md               # convenzioni di naming e scala
│   ├── posters/<slug>.webp         # fallback statico, stesso render
│   └── fonts/                      # Archivo · Inter · Instrument Serif (woff2)
│
├── scripts/
│   ├── make-placeholders.mjs       # genera i 10 GLB segnaposto
│   └── optimize-glb.mjs            # wrapper gltf-transform (vedi MODELS.md)
│
├── DESIGN.md · PLAN.md · MODELS.md · README.md
├── .env.example
└── next.config.ts · tailwind/postcss · tsconfig.json · eslint
```

---

## 5. Modello dati

```ts
// data/products.ts — struttura, non ancora i contenuti
export type Category = 'decor' | 'illuminazione' | 'scrittoio' | 'personalizzati'

export type Material = {
  id: string
  nome: string            // "PLA opaco"
  descrizione: string
  colori: { id: string; nome: string; hex: string; ruvidità: number; metallicità: number }[]
  sovrapprezzoCent: number
}

export type Variant = {
  id: string
  nome: string            // "Media — 140 mm"
  dimensioniMm: [number, number, number]
  prezzoCent: number      // in centesimi. Mai float sui soldi.
  pesoG: number
  sku: string
}

export type Product = {
  slug: string
  nome: string
  sottotitolo: string
  categoria: Category
  descrizione: string     // il testo che Google legge
  specifiche: { etichetta: string; valore: string }[]   // colonne maiuscolo, ref C
  varianti: Variant[]     // la prima è quella predefinita
  materiali: string[]     // id da materials.ts
  tempiProduzioneGiorni: [number, number]
  disponibileSubito: boolean
  modello: { glb: string; scala: number; posterWebp: string }
  ordine: number          // posizione nella sequenza di scroll in home
}
```

- **Prezzi in centesimi interi.** Mai virgola mobile sul denaro.
- Il prezzo mostrato è `variante.prezzoCent + materiale.sovrapprezzoCent`, calcolato dalla **stessa funzione** (`lib/price.ts`) nel client e nel server. Un'unica implementazione, nessuna possibilità di divergenza.
- Sostituire questo file con un CMS significa reimplementare una sola funzione `getProducts()`. Nient'altro nel codice tocca il file direttamente.

---

## 6. Categorie — mi serve una conferma

Mi hai detto che *"oggetti da esposizione / design"* è il **posizionamento**, non una categoria. Giusto: diventa la riga sotto il logo, non un filtro. Servono quindi categorie merceologiche. La mia proposta per distribuire i 10 prodotti:

| Categoria | Prodotti | Perché |
|---|---|---|
| **Decor** | 3 | Vasi, portacandele, fermalibri. La categoria più fotogenica in 3D. |
| **Illuminazione** | 2 | Lampade e paralumi. La stampa 3D qui ha un vantaggio reale — la luce che attraversa gli strati — e in una scena al crepuscolo è l'oggetto che si illumina da solo. |
| **Scrittoio** | 2 | Portapenne, organizer, fermacarte. Prezzo d'ingresso basso: è la categoria che fa il primo acquisto. |
| **Regali personalizzati** | 3 | Confermata da te. Ponte naturale verso "Su richiesta". |

Se preferisci altre categorie dimmele: cambia un file (`data/categories.ts`), non l'architettura. **Non è bloccante per la Fase 1.**

I 10 prodotti saranno **segnaposto verosimili** — nomi, misure e prezzi coerenti e realistici, chiaramente marcati come da sostituire. Non invento specifiche tecniche spacciandole per vere.

---

## 7. Fasi

Ogni fase si chiude con: commit, riepilogo di cosa è fatto e cosa resta, e istruzioni per vederla girare.

### Fase 0 — Fondazioni *(~mezza giornata, inclusa nella Fase 1)*
Scaffolding Next.js, TypeScript strict, Tailwind v4 con i token di `DESIGN.md`, font self-hosted, `SkyGradient`, layout, header/footer, `SkipLink`, `.env.example`, `README` minimo.
**Verifica:** la home mostra il cielo in gradiente e il titolo. **Nessun JavaScript necessario per vederli.**

### Fase 1 — Il cuore: hero 3D e scorrimento *(la fase più lunga)*
1. `Stage` — Canvas persistente, trasparente, `<Suspense>`, monitor delle prestazioni
2. `useQuality` — i tre profili di `DESIGN.md` §9, rilevamento + declassamento a una via
3. Luci da studio + orizzonte
4. **`LayerGrowth`** — l'hero C: piano di taglio animato + banda emissiva che sale. Saltabile, una volta per sessione, con timeout a 1200 ms
5. `ScrollRig` — Lenis + GSAP ScrollTrigger, timeline master ~600vh
6. 10 oggetti segnaposto **procedurali** (vasi di rivoluzione, torus knot, gusci) — zero download, la scena si costruisce prima che i modelli esistano
7. Pannelli di vetro, hotspot ancorati, indice numerale, barra "prossimo prodotto"
8. `PointerRig` + `GyroRig` con parallasse smorzato
9. **Fallback completo** — no WebGL / `prefers-reduced-motion`: stessa pagina con i poster
10. Ancore DOM focusabili: `Tab` percorre i prodotti e muove la camera

**Criteri di accettazione:**
- 60 fps su desktop, ≥ 30 fps su mobile di fascia media
- LCP < 2,5 s su 4G simulata (l'elemento LCP è l'`<h1>`, non il canvas)
- Con JavaScript disattivato: cielo, titolo, nomi e prezzi dei 10 prodotti visibili
- L'intera home percorribile solo da tastiera
- **Te la mostro funzionante prima di procedere.**

### Fase 2 — Catalogo e pagina prodotto
Catalogo filtrabile per categoria, anteprima 3D all'hover su desktop. Pagina prodotto con capsula di vetro (idea B), viewer orbitabile, cambio materiale/colore in tempo reale, varianti, specifiche, tempi di produzione. Transizione shared-element home → prodotto. GLB reali sostituiscono i procedurali, `MODELS.md` scritto.
**Accettazione:** il cambio colore aggiorna il modello senza ricaricarlo; il prezzo si aggiorna con la variante; la pagina è completa e leggibile senza WebGL.

### Fase 3 — Carrello e Stripe (test)
Drawer, Zustand persistito, `/api/checkout` con ricalcolo server dei prezzi, spedizione 8,99 € / gratis da 90 €, pagine esito, webhook firmato → email d'ordine.
**Accettazione:** un ordine di test va a buon fine end-to-end; un prezzo manomesso dal client **non ha alcun effetto**.

### Fase 4 — "Crea su richiesta"
Flusso a step con forte componente visiva, upload diretto a Blob con anteprima STL nel browser, materiale/colore/dimensioni/quantità/scadenza, contatti, consenso privacy, invio → email allo studio + conferma al cliente. **Nessun prezzo automatico: è una richiesta di preventivo.** Rate limiting e honeypot anti-spam.
**Accettazione:** un STL da 40 MB si carica e si vede in anteprima; entrambe le email arrivano; nessun file transita dalla serverless function.

### Fase 5 — Secondarie, SEO, ottimizzazione, deploy
Studio/processo, contatti, 4 pagine legali con la dicitura **art. 59 Codice del Consumo** sull'esclusione del recesso per i prodotti personalizzati, banner cookie GDPR (nessuno script di tracciamento prima del consenso), metadata + Open Graph + JSON-LD Product + sitemap + robots, audit Lighthouse e accessibilità, `README` con le istruzioni di deploy.

---

## 8. Budget di performance (verificato a ogni fase)

| Metrica | Obiettivo | Come |
|---|---|---|
| **LCP** | < 2,5 s su 4G | Elemento LCP = `<h1>` su gradiente CSS, SSR. Nessuna immagine, nessun font bloccante. Solo Archivo in preload. |
| **JS iniziale** | < 120 KB gzip | Il chunk 3D è dinamico (`ssr: false`), caricato dopo il primo paint |
| **Chunk 3D** | ~180 KB gzip | three + r3f + drei, importati per funzione, mai in blocco |
| **GLB** | < 1,5 MB · hero < 800 KB | Draco + Meshopt, budget verificato da `scripts/optimize-glb.mjs` |
| **fps** | 60 desktop · ≥ 30 mobile | Tre profili di qualità, declassamento automatico a una via |
| **CLS** | < 0,05 | Altezze riservate, font con `size-adjust` |

Ogni fase si chiude con una misura reale, non con una stima.

---

## 9. Sicurezza e conformità

- **Segreti solo in `.env`**, mai nel client. `.env.example` documentato e committato, `.env` in `.gitignore` (già fatto).
- Webhook Stripe: **verifica della firma obbligatoria**, corpo grezzo, `runtime = 'nodejs'`.
- Prezzi ricalcolati lato server (§2.3). Il client non è mai una fonte attendibile.
- Upload: whitelist di estensioni **e** verifica del magic number, limiti dimensione/numero, rate limiting per IP.
- Banner cookie: **nessuno script di terze parti caricato prima del consenso esplicito**. Il consenso è granulare e revocabile.
- Pagine legali con testi segnaposto chiaramente marcati — **non sono consulenza legale**, vanno fatte rivedere.
- Privacy dei file dei clienti: URL non indovinabili, policy di cancellazione documentata.

---

## 10. Variabili d'ambiente

```bash
# Stripe (modalità test in sviluppo)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Nessuna chiave pubblicabile: il redirect avviene dal server (§2.3)

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM="STRATO <ordini@tuodominio.it>"   # dominio da verificare su Resend
EMAIL_TO=...                                  # dove arrivano le richieste di preventivo

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Sito
NEXT_PUBLIC_SITE_URL=https://...
```

---

## 11. Rischi, onestamente

| Rischio | Gravità | Mitigazione |
|---|---|---|
| Il canvas persistente complica il routing App Router | **Alta** | È la prima cosa che costruisco in Fase 1. Se non regge, ripiego sul canvas per rotta e la transizione shared-element diventa una dissolvenza incrociata: si perde eleganza, non funzione. Te lo direi subito. |
| ≥ 30 fps su Android di fascia media | **Alta** | Profili di qualità dalla Fase 1, non aggiunti alla fine. Verifica con throttling CPU 4× a ogni fase. |
| Vetro rifrangente costoso (idea B) | Media | Una sola superficie rifrattiva in scena, cubemap statica per le altre, disattivato sul profilo basso |
| L'hero C in conflitto con l'LCP | Media | LCP = titolo in DOM, animazione a modello caricato, timeout 1200 ms, saltabile, una volta per sessione |
| Costo Vercel Blob | Bassa | Migrabile a Cloudflare R2 toccando `lib/blob.ts` |
| Dominio/marchio "STRATO" | **Non verificato** | Va controllato prima di ordinare qualsiasi materiale. Io non ho strumenti per darti una risposta affidabile. |

---

## 12. Cosa mi serve da te per approvare

**Bloccante:** solo il tuo via sul piano.

**Non bloccante** (serve entro la fase indicata):

1. Le **categorie** del §6 — ok o le cambi? *(entro Fase 2)*
2. Email dove ricevere le richieste di preventivo e dominio per le email transazionali *(entro Fase 4)*
3. Chiavi Stripe in modalità test, o le configuro io con chiavi segnaposto e le inserisci tu *(entro Fase 3)*
4. Ragione sociale, P.IVA, sede, PEC *(prima del lancio — per ora segnaposto, come chiesto)*
5. Preferenza storage: **Vercel Blob** (default) o Cloudflare R2 *(entro Fase 4)*

---

*Al tuo via parto con Fase 0 + Fase 1 e ti mostro l'hero funzionante prima di toccare qualsiasi altra cosa.*
