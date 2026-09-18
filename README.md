# STRATO

E-commerce 3D per oggetti stampati in 3D.
*Strato dopo strato.*

> **Il principio, in una riga: lo scroll è la testina.**
> Ogni prodotto si stampa mentre lo raggiungi, strato dopo strato; se torni
> indietro si s-stampa. Non è un'animazione che parte e finisce, è una funzione
> della posizione di scroll. La pagina è una carota geologica e la posizione è
> una profondità in millimetri. Vedi `DESIGN.md` §2.

- **`DESIGN.md`** — direzione creativa: palette, tipografia, principi di motion, idee di hero
- **`PLAN.md`** — piano tecnico, fasi, struttura cartelle, decisioni architetturali
- **`MODELS.md`** — pipeline da STL/3MF a GLB ottimizzato

---

## Avvio rapido

```bash
npm install --legacy-peer-deps
npm run dev          # http://localhost:3000
```

> `--legacy-peer-deps` serve perché `@react-three/fiber` dichiara un peer
> `react >=19 <19.3` mentre Next 16 ne porta uno più recente. Le versioni
> installate sono compatibili nei fatti; il flag evita solo che npm si blocchi
> sulla risoluzione. Vedi **Versioni bloccate** più sotto.

Non serve alcun file `.env` per far girare il sito in Fase 1.

## Comandi

| | |
|---|---|
| `npm run dev` | sviluppo |
| `npm run build` | build di produzione |
| `npm run start` | serve la build |
| `npm run check` | TypeScript + ESLint (da lanciare prima di ogni commit) |
| `npm run models:ottimizza <file.glb>` | ottimizza un modello (vedi `MODELS.md`) |

## Collaudo della grafica

Il profilo di qualità si forza dall'URL e resta memorizzato nel browser:

```
/?qualita=high      massimo: ombre morbide, post-processing, 8 oggetti
/?qualita=medium    ombre di contatto, 4 oggetti
/?qualita=low       nessun 3D — è il fallback statico
```

Serve a vedere i tre profili su una macchina sola. In condizioni normali il
profilo si rileva da solo e **scala verso il basso senza mai risalire** se gli
fps restano sotto 30 per più di due secondi (`DESIGN.md` §9).

---

## Stato: Fase 1 completata

| Fase | Contenuto | Stato |
|---|---|---|
| 0 | Fondazioni, design token, layout, SEO di base | ✅ |
| 1 | Hero 3D, sequenza guidata dallo scroll, fallback, accessibilità | ✅ |
| 2 | Catalogo con anteprima 3D, pagina prodotto con viewer orbitabile | ⏳ |
| 3 | Carrello e Stripe Checkout | ⏳ |
| 4 | Flusso "Su richiesta" con upload | ⏳ |
| 5 | Pagine secondarie, legali, banner cookie, ottimizzazione | ⏳ |

Catalogo e pagina prodotto esistono già come pagine complete renderizzate lato
server (contenuto, prezzi, varianti, materiali, JSON-LD): la Fase 2 ci aggiunge
sopra il 3D, non le riscrive.

### Cosa è ancora segnaposto

- **Ragione sociale, P.IVA, sede** nel footer — obbligatorie per legge su un
  sito di vendita
- **I 10 prodotti** in `data/products.ts` — nomi, misure, pesi e prezzi sono
  verosimili ma inventati
- **I modelli 3D**: nessun `.glb` esiste ancora, la scena usa geometrie
  procedurali (`lib/placeholders.ts`)
- **Le pagine** `studio`, `contatti`, `su-richiesta` e le quattro legali

---

## Architettura — le tre cose da sapere prima di toccare il codice

### 1. Esiste un solo `<Canvas>`, e non viene mai smontato

Vive nel root layout (`app/layout.tsx` → `components/three/Stage.tsx`). Le rotte
cambiano il DOM sopra di esso; la scena reagisce leggendo `useScene`.

È ciò che rende possibile la regola "mai un taglio" di `DESIGN.md` §6: passare
da una pagina all'altra è un movimento di camera, non un rimontaggio. Se smonti
il canvas per rotta, perdi la transizione dell'oggetto e paghi una
ricompilazione degli shader a ogni navigazione.

### 2. Il 3D non fa mai re-render di React

Scroll, posizione del mouse, giroscopio e progresso della camera vivono in
`lib/frame.ts` — un semplice oggetto di modulo, **non** uno store React. Viene
scritto dal DOM (`HomeSequence`) e letto dentro `useFrame`.

React fa re-render solo quando cambia qualcosa di *semantico*: quale prodotto è
a fuoco, quale materiale è selezionato, il contenuto del carrello.
**Se ti viene voglia di mettere il progresso dello scroll in uno `useState`,
non farlo**: sono 60 re-render al secondo dell'intero albero.

### 3. Lo strato decide, il componente ubbidisce

`components/layout/Stratigrafia.tsx` traduce la posizione nel documento in
**materiale corrente** e **profondità in millimetri**, e li scrive come variabili
su `:root`. Da lì li legge tutto il resto: fondo, colore del testo, colore delle
linee, indicatore.

Nessun componente decide da sé se è su uno strato chiaro o profondo: lo sa perché
lo strato glielo dice (`data/strati.ts`). **Se ti serve sapere il colore del
testo, usa `var(--ink-corrente)`** — non scrivere un colore fisso, o su uno degli
strati sarà illeggibile.

### 4. Il testo vive nel DOM, mai dentro il canvas

Nome, prezzo, descrizione e specifiche sono renderizzati lato server sopra il
canvas. Il 3D è l'*immagine* del prodotto, non il suo contenuto.

Una scelta, quattro problemi risolti insieme: SEO, screen reader, `Ctrl+F` e
fallback senza WebGL.

---

## Accessibilità e fallback — verificati, non dichiarati

- **Senza JavaScript**: nomi, prezzi e descrizioni dei prodotti restano visibili
  (regole in `<noscript>` che riportano i pannelli nel flusso)
- **`prefers-reduced-motion`**: il chunk 3D **non viene nemmeno scaricato**, i
  pannelli si impilano e si leggono uno dopo l'altro
- **Senza WebGL**: stessa cosa
- **Da tastiera**: `Tab` percorre skip link → navigazione → CTA → la distinta di
  produzione, che porta a **tutti e dieci** i prodotti. Le schede della sequenza
  entrano nell'ordine di tabulazione solo quando sono visibili — una scheda
  invisibile non deve essere raggiungibile — e quando lo sono, il focus su una di
  esse porta il pezzo al punto di posa
- **Area di tocco** minima 44 × 44 px, focus ring sempre visibile

## Budget di performance

| Metrica | Obiettivo | Misurato | Come |
|---|---|---|---|
| LCP | < 2,5 s su 4G | — | L'elemento LCP è l'`<h1>` su gradiente CSS, renderizzato lato server: si vede prima che un solo byte di JavaScript venga eseguito. Il canvas arriva dopo e non entra nella misura. |
| JS sul percorso critico | il minimo possibile | **179 KB gzip** | Di cui **152 KB sono React 19 + Next 16**, cioè il pavimento del framework. Il codice dell'applicazione sono i restanti ~27 KB. |
| JS differito | — | **290 KB gzip** | three + R3F + drei + GSAP + Lenis. Caricato dopo l'evento `load`, in un momento di quiete. **Con `prefers-reduced-motion` o senza WebGL non viene scaricato affatto.** In v3 la scena è più leggera: riflessi, bloom, raggi, polvere e nebbia sono stati eliminati perché non servono più. |
| CSS | — | vedi `npm run build` | Tutto il foglio di stile del sito |
| fps | 60 desktop · ≥ 30 mobile | — | Tre profili, declassamento automatico a una via |
| GLB | < 1,5 MB | — | `npm run models:ottimizza` esce con errore se il budget salta |

> **Nota onesta sul numero.** In `PLAN.md` avevo scritto "< 120 KB gzip" per il
> bundle iniziale. Misurato: 179 KB. La stima era sbagliata, non il codice —
> React 19 + Next 16 da soli ne occupano 152, e sotto quella soglia non si
> scende restando su questo stack. I 27 KB di applicazione sono il numero su cui
> abbiamo davvero controllo, e quello è basso.
>
> Due interventi reali hanno tolto 108 KB dal percorso critico:
> 1. la matematica dello scroll è stata spostata in `lib/sequenza.ts`, che non
>    importa `three` — prima `HomeSequence` se lo trascinava dietro (−99 KB);
> 2. GSAP e Lenis sono importati dinamicamente dentro l'effetto (−40 KB), e il
>    chunk 3D aspetta l'evento `load` più un momento di quiete.

---

## Versioni bloccate

`package.json` non usa `^`. È deliberato: R3F 9 / three r186 / React 19 /
Next 16 sono un insieme che si muove in fretta, e un `npm install` fatto tra
un mese non deve poter rompere la scena.

Aggiornare è una decisione da prendere, non un effetto collaterale: si alza una
versione per volta e si ricontrolla la scena.

| | |
|---|---|
| Next | 16.3.5 |
| React | 19.2.8 *(vincolato da `@react-three/fiber`, che vuole `<19.3`)* |
| three | 0.186.0 |
| @react-three/fiber | 9.7.0 |
| @react-three/drei | 10.7.8 |
| Tailwind | 4.3.3 |
| postprocessing | rimosso in v3 |

*Ultimo allineamento: settembre 2026.*

---

## Deploy su Vercel

1. Collega il repository su [vercel.com/new](https://vercel.com/new) — il
   framework viene rilevato da solo
2. **Install Command**: `npm install --legacy-peer-deps`
3. Inserisci le variabili d'ambiente di `.env.example` (nessuna è necessaria
   per la Fase 1)
4. Imposta `NEXT_PUBLIC_SITE_URL` sul dominio definitivo — senza, canonical,
   Open Graph e sitemap puntano a localhost

Il build è statico per quasi tutto: le 10 schede prodotto sono pre-generate,
il catalogo è dinamico solo perché legge il filtro dalla query string.

---

## Internazionalizzazione

Tutte le stringhe stanno in `i18n/it.ts`, nessun testo è cablato nei componenti.
`t.hero.titolo` è tipizzato: una chiave inesistente non compila.

Per aggiungere l'inglese: si duplica il dizionario in `i18n/en.ts`, si aggiunge
il segmento `[locale]` alle rotte con un middleware, e `i18n/index.ts` diventa
la funzione che sceglie il dizionario. **Nessun componente cambia** — il lavoro
costoso, estrarre i testi, è già fatto.
