# MODELS.md — dai tuoi STL ai GLB del sito

Come trasformare un file di stampa in un modello che il sito può caricare in
fretta. **Obiettivo: meno di 1,5 MB per modello**, meno di 800 KB per quello
dell'hero.

---

## 0. Perché non si può caricare l'STL così com'è

Un STL da stampa contiene la geometria a piena risoluzione — spesso **centinaia
di migliaia di triangoli** — e non contiene nulla di ciò che serve a un motore
3D: normali condivise, coordinate UV, materiali. Caricarlo nel browser
significa 20–80 MB scaricati e un crollo del frame rate su mobile.

Un GLB per il web è un'altra cosa: geometria **ridotta di 10–50 volte**,
compressa, con le normali e le UV necessarie a illuminarlo. A schermo, a
distanza di prodotto, la differenza non si vede. Nel tempo di caricamento sì.

| | STL da stampa | GLB per il web |
|---|---|---|
| Triangoli | 200.000 – 2.000.000 | 15.000 – 40.000 |
| Dimensione | 20 – 200 MB | **< 1,5 MB** |
| Serve per | produrre il pezzo | mostrarlo |

Sono due file diversi con due scopi diversi. **Non sostituire mai l'uno con
l'altro:** l'STL resta il file di produzione, il GLB è solo la vetrina.

---

## 1. Cosa serve installato

- **[Blender](https://www.blender.org/)** 4.x — gratuito
- **Node.js** 20+ (già necessario per il sito)
- **gltf-transform**:
  ```bash
  npm install -g @gltf-transform/cli
  ```

---

## 2. In Blender — dalla mesh di stampa alla mesh da mostrare

### 2.1 Importa e orienta
1. `File → Import → STL` (o `.3mf`, `.obj`)
2. **Ruota in piedi** — l'asse **Y è l'alto** in glTF, mentre in Blender è Z.
   L'esportatore se ne occupa, ma solo se l'oggetto è dritto rispetto a Blender.
3. **Appoggia la base a Z = 0** e centra sull'origine (`Object → Set Origin →
   Origin to Geometry`, poi azzera la posizione).
   > Il sito posiziona ogni modello **poggiandolo sul piedistallo**. Se l'origine
   > è al centro del volume invece che alla base, l'oggetto fluttua o affonda.
4. **Scala in metri**: 1 unità Blender = 1 metro. Un vaso alto 140 mm deve
   misurare 0,14. Poi `Object → Apply → All Transforms`.

### 2.2 Riduci i triangoli
1. Modificatore **Decimate**, modalità *Collapse*
2. Abbassa il rapporto finché non si vede una differenza a schermo intero:
   di solito **0,05 – 0,15** (cioè 5–15% dei triangoli originali)
3. Controlla il contatore in alto a destra (`Statistics` nell'overlay):
   **punta a 15.000 – 40.000 triangoli**
4. `Ctrl+A → Visual Geometry to Mesh` per applicare

> **Dove guardare mentre decimi:** i bordi netti e le silhouette. Le superfici
> curve tollerano moltissimo, gli spigoli no. Se un bordo diventa seghettato,
> hai decimato troppo.

### 2.3 Normali e smoothing
1. `Object → Shade Auto Smooth`, angolo **30°**
2. `Mesh → Normals → Recalculate Outside` (`Shift+N`)

Senza questo passaggio l'oggetto si illumina a chiazze: è l'errore che fa
sembrare "finto" un modello per il resto corretto.

### 2.4 UV — solo se serve
Servono **solo** se applicherai una texture o un ambient occlusion cotto. Per i
nostri materiali monocromatici (il colore arriva dal selettore in pagina, non
dal modello) **puoi saltare questo passaggio** e risparmiare peso.

Se servono: `U → Smart UV Project`, margine 0,02.

### 2.5 Esporta
`File → Export → glTF 2.0 (.glb)` con:

| Opzione | Valore |
|---|---|
| Format | **glTF Binary (.glb)** |
| Include | **Selected Objects** |
| Transform | `+Y Up` ✅ |
| Data → Mesh | Apply Modifiers ✅ · UVs solo se servono · **Normals ✅** |
| Data → Mesh | Tangents ❌ · Vertex Colors ❌ |
| Data → Material | **No Materials** (li definisce il sito) |
| Compression | ❌ **lasciala spenta qui** — la fa gltf-transform, meglio |

Salva in `public/models/<slug>.glb`, dove `<slug>` è **esattamente** quello di
`data/products.ts` (per esempio `vaso-onda.glb`).

---

## 3. Ottimizzazione finale — gltf-transform

Blender esporta un GLB corretto ma grasso. Questo passaggio lo dimezza o meglio.

```bash
npm run models:ottimizza public/models/vaso-onda.glb
```

Lo script (`scripts/optimize-glb.mjs`) esegue, in quest'ordine:

```bash
gltf-transform dedup      in.glb tmp1.glb   # unisce dati ripetuti
gltf-transform weld       tmp1.glb tmp2.glb # salda i vertici coincidenti
gltf-transform simplify   tmp2.glb tmp3.glb --ratio 0.75 --error 0.001
gltf-transform meshopt    tmp3.glb out.glb  --level high
```

**Perché Meshopt e non Draco**, visto che il brief citava Draco: comprime quasi
quanto Draco ma **si decodifica molto più in fretta**, e il decoder pesa ~30 KB
contro i ~200 KB di Draco. Su un telefono di fascia media la decodifica di Draco
blocca il thread principale per centinaia di millisecondi — proprio mentre
l'utente sta scorrendo. Il decoder Meshopt è incluso in `three`, quindi non c'è
neanche un file esterno da servire.
Se un domani servisse Draco, il decoder va in `public/models/draco/` e si
abilita in `useProductModel`.

### Verifica il risultato
```bash
gltf-transform inspect public/models/vaso-onda.glb
```
Controlla:
- **File size** < 1,5 MB (< 800 KB per il modello dell'hero)
- **Triangles** tra 15k e 40k
- **Materials** 0 o 1
- **Textures** 0, se non hai cotto nulla

---

## 4. Il poster di fallback

Ogni prodotto ha anche `public/posters/<slug>.webp`: è ciò che si vede al posto
del canvas quando WebGL non c'è o l'utente ha chiesto meno movimento, ed è anche
l'immagine Open Graph.

**Deve avere la stessa inquadratura del 3D**, altrimenti il fallback sembra un
sito diverso. Il modo più rapido:

1. Apri il sito con `?qualita=high`, porta l'oggetto a fuoco
2. Screenshot a 1600×1200
3. Converti:
   ```bash
   npx @squoosh/cli --webp '{"quality":78}' -d public/posters posters-sorgente/*.png
   ```
   Punta a **meno di 120 KB** per immagine.

---

## 5. Convenzioni

```
public/models/
  vaso-onda.glb              ← il nome del file È lo slug del prodotto
  portacandele-eclissi.glb
  ...
  draco/                     ← decoder, solo se un giorno servirà Draco
public/posters/
  vaso-onda.webp
  ...
```

- **Un file per prodotto.** Le varianti di dimensione si ottengono scalando lo
  stesso GLB (`modello.scala` in `data/products.ts`), non con file diversi.
- **Il nome non cambia mai** dopo la pubblicazione: i modelli sono serviti con
  `Cache-Control: immutable` per un anno. Se devi aggiornare un modello,
  cambia il nome (`vaso-onda-2.glb`) e aggiorna `data/products.ts`.
- **Niente materiali nel GLB.** Il colore e la finitura arrivano da
  `data/materials.ts`: è quello che rende possibile il cambio colore dal vivo.

---

## 6. Se un modello manca

Non succede niente di male, ed è voluto: `useProductModel` ripiega sulla
**geometria procedurale segnaposto** descritta in `modello.segnaposto`
(`lib/placeholders.ts`). Il sito resta in piedi, l'oggetto c'è, il prodotto si
vende. Serve a due cose:

1. costruire e collaudare tutta la scena **prima** che i modelli esistano — è
   esattamente come è stata sviluppata la Fase 1;
2. non far mai vedere un buco in produzione se un file non si carica.

Quando aggiungi il GLB reale, il segnaposto smette semplicemente di essere usato.
Non serve toccare altro.

---

## 7. Privacy dei file dei clienti

I file caricati dai clienti nel flusso "Su richiesta" (Fase 4) sono **loro
proprietà intellettuale**. Regole:

- Non finiscono mai in `public/`
- Stanno nello storage con URL non indovinabili
- **Cancellazione a 90 giorni** dalla chiusura della richiesta
- Non vengono riutilizzati per altri lavori senza consenso scritto

Da mettere nero su bianco nell'informativa privacy (Fase 5).
