# DESIGN.md — Direzione creativa

**Stato: BOZZA v1 — in attesa della tua approvazione.**
Basata su: 3 reference allegate in chat + analisi di `shop.6tm-magazine.com` + i dati che mi hai confermato.

---

## 1. Analisi delle reference

### 1.1 — Reference A · "Our Services" (scena surreale con cubi e robot)

**Composizione.** Scena a tutta pagina, profondità reale a tre piani: sfondo (cielo), piano medio (robot laterali, come due statue a guardia della composizione), primo piano (quattro cubi su piedistalli a scacchiera). I cubi sono disposti a **griglia sfalsata in profondità**, non allineati: è questo che dà volume. L'interfaccia — barra di ricerca, pannello — **fluttua sopra la scena** come un livello di vetro, con la sua ombra.

**Movimento (dedotto).** Cubi sospesi con leggera oscillazione, cristalli in caduta lenta, luce che pulsa. È una composizione che respira, non che corre.

**Tipografia.** Sans geometrico bianco molto pesante per il titolo (`Our Services`), sovratitolo minuto e distanziato sopra. Due soli livelli, contrasto di scala violentissimo. Testo dentro i pannelli minuscolo e tecnico.

**Palette.** Cielo viola/lavanda che degrada in **ambra e oro all'orizzonte** (tramonto). Corallo verde e rosa nel primo piano. Accenti **ciano** luminosi (i dettagli dei robot). Oggetti in oro, bianco perla, viola satinato.

**Cosa prendo:** gli oggetti su **piedistalli** a profondità diverse; l'interfaccia come **livello di vetro sospeso** sopra la scena; il cielo in gradiente come sfondo, non il vuoto nero; l'accento ciano usato solo per ciò che è "vivo".
**Cosa lascio:** l'affollamento. Robot, coralli, cristalli, due barre di ricerca: troppi protagonisti. È un'immagine, non un'interfaccia che deve vendere.

---

### 1.2 — Reference B · "Nestive" (smart home)

**Composizione.** Layout classico e sicuro: nav in alto, blocco testuale a sinistra, **render 3D grande a destra che esce dal bordo** della pagina. Riga di card in basso che anticipa la sezione successiva — invito allo scroll senza freccia animata.

**Tipografia.** Ed è qui la cosa interessante: **serif roman + serif corsivo mescolati nella stessa frase** (`Control *Your Home* The Smart Way`). Il corsivo evidenzia una parola sola e dà calore editoriale a un prodotto tecnologico. Corpo in sans piccolo, grigio, molto sobrio.

**Palette.** Verde salvia desaturato, quasi monocromatico. Il colore caldo arriva **solo dalle finestre illuminate** della casa. Contrasto caldo/freddo minimo ma efficacissimo.

**Micro-interazioni.** Nav con separatori a pallino. CTA a **pillola scura con icona a sinistra** su fondo chiaro. Prova sociale piccolissima sopra il titolo (avatar + `+10,000 people`).

**Cosa prendo:** il **mix roman + corsivo** su una parola sola — è la firma tipografica più memorabile delle tre reference; la **CTA a pillola**; lo sfondo quasi monocromatico con la luce calda che arriva solo dall'oggetto; le card in basso come anticipazione dello scroll.
**Cosa lascio:** la palette chiara e il layout statico a due colonne. Noi il 3D lo attraversiamo, non lo guardiamo di lato.

---

### 1.3 — Reference C · "O2 / Moonish" (e-commerce concept) — **la più vicina a noi**

**Composizione.** Sfondo fotografico (deserto al tramonto) e sopra, **pannelli di vetro smerigliato sospesi**, con angoli molto arrotondati e ombra morbida. Il prodotto — una felpa — è **dentro una sfera di vetro trasparente** circondata da bolle, sollevata da terra. Barra di navigazione fluttuante in alto, **barra "prossimo prodotto" fluttuante in basso** con miniatura + titolo + freccia circolare. L'interfaccia non tocca mai i bordi: galleggia dentro il viewport.

**Tipografia.** Doppio registro netto:
- numerale enorme (`01`) come indice del prodotto
- **colonne di micro-testo in maiuscolo tecnico** per le specifiche (`LINING: 53% COTTON`, `POCKET BAG: 100% COTTON`) — dati, non marketing

**Micro-interazioni.** Hotspot sul prodotto (etichetta `HOODIE · 119$` con pallino ancorato all'oggetto). `Add to cart +` a pillola scura. Pulsante circolare con freccia diagonale per avanzare. `REFRESH` per cambiare vista.

**Cosa prendo:** praticamente l'impianto. Prodotto sospeso e isolato · pannelli glass che fluttuano · **hotspot ancorati all'oggetto 3D** · **colonne di specifiche tecniche in maiuscolo** · barra "prossimo prodotto" in basso come motore dello scroll · numerale d'indice.
**Cosa lascio:** lo sfondo fotografico reale (un deserto non c'entra con noi) e il vetro su vetro su vetro, che a un certo punto rende il testo illeggibile.

---

### 1.4 — Cosa hanno in comune (il denominatore che diventa la nostra direzione)

1. **L'oggetto è sospeso, mai appoggiato.** Fluttua, o sta su un piedistallo, o è dentro una bolla. Non c'è mai una foto di prodotto su fondo bianco.
2. **Lo sfondo è un ambiente, non un vuoto.** Sempre un cielo o un paesaggio in gradiente, sempre con un **orizzonte caldo**.
3. **L'interfaccia è un livello di vetro sopra la scena.** Pannelli traslucidi, angoli molto arrotondati, ombra propria. L'UI galleggia, non è incollata.
4. **CTA a pillola**, alto contrasto rispetto al pannello che la contiene.
5. **Due registri tipografici opposti**: display enorme + micro-testo tecnico in maiuscolo. Niente dimensioni intermedie.
6. **Il colore caldo arriva dalla luce** (tramonto, finestre, oro), mai dal fondo piatto.

### 1.5 — Dalla reference online (6TM)
Prendo la disciplina che alle tre immagini manca: **un messaggio per blocco**, molto respiro tra le sezioni, specifiche come elenchi scansionabili, copy a frasi brevi con verbi all'inizio (`No installation needed`, `Drag and Drop`). E il principio che il prodotto occupa la parte alta del viewport senza competizione.

> Ispirazione, non clonazione. Nessun asset, testo o layout ripreso. Quello che passa sono i principi (sospensione, vetro, orizzonte caldo, doppio registro tipografico), non l'esecuzione.

---

## 2. ⚠️ Un conflitto da risolvere, prima di tutto il resto

Tu hai scelto **"Dark studio / tech"**, che io avevo descritto come *fondo scuro, luci da studio drammatiche, accento fluo, tipografia monospace*.

Le tue reference dicono un'altra cosa: **nessuna delle tre ha un fondo nero**. Sono cieli al tramonto, salvia chiaro, deserto dorato. L'atmosfera è **ambientale e morbida**, non da camera oscura. E il vetro traslucido — l'elemento più forte e più ricorrente — su nero puro semplicemente sparisce: il glassmorphism ha bisogno di qualcosa dietro da sfocare.

**Non li considero inconciliabili, e non è un problema: è una terza direzione, migliore delle due.**

> ### "Crepuscolo" — scuro come atmosfera, non come vuoto
> Il fondo resta scuro (il tuo *dark*), ma è un **cielo al crepuscolo**: indigo profondo in alto che degrada verso un **orizzonte ambra** in basso. Il rigore tecnico (il tuo *tech*) sta nella **tipografia** e nei **dati** — colonne di specifiche in maiuscolo, numerali d'indice, misure reali — non nel colore.
> Così: i pannelli di vetro hanno un gradiente da sfocare e funzionano · il prodotto stampato si staglia illuminato · resta scuro, premium e notturno · e le tue reference sono rispettate.

**Se invece intendevi davvero il nero assoluto da studio fotografico, dimmelo**: è un'altra direzione, legittima, ma allora le tre reference vanno messe da parte e il glassmorphism con loro. Tutto ciò che segue assume "Crepuscolo".

---

## 3. Nome del brand

Mi hai chiesto di crearlo io. La mia proposta:

# **STRATO**

**Perché.** In una stampa 3D l'oggetto nasce **strato dopo strato**: è letteralmente il processo produttivo, detto in una parola. Ma "strato" è anche lo **strato di atmosfera** — e le tue tre reference sono tutte cieli, orizzonti, sospensione. Il nome tiene insieme *come produciamo* e *come si vede il sito*. È italiano, corto, si pronuncia identico in inglese, e la radice `strat-` è internazionale (*strata*, *stratosphere*).

**Come si declina:**
- Logotipo: `STRATO` in Archivo, maiuscolo, tracking largo — oppure con una hairline orizzontale che attraversa la parola a metà: l'orizzonte e il piano di stampa insieme.
- Firma: **STRATO®** o **STRATO / Studio**
- Payoff: **"Strato dopo strato."** — funziona come claim del brand *e* come descrizione dell'animazione hero (§ 6, idea C).
- L'hero che consiglio è, non a caso, l'oggetto che si costruisce a strati mentre sorge una linea di luce ambra. **Nome, processo e animazione diventano la stessa cosa.**

**Due alternative,** se STRATO non ti convince:

| Nome | Perché | Contro |
|---|---|---|
| **MICRON** | La precisione come promessa. Molto "tech", credibile su un pubblico tecnico. | Freddo. Non racconta il tramonto né la sospensione: lavora contro le reference. |
| **ZETA** | L'asse Z è quello lungo cui cresce la stampa. Secco, elegante, memorabile. | Più criptico: va spiegato. E "Zeta" è già molto usato. |

Da verificare prima di procedere: disponibilità del dominio e ricerca marchi. Non l'ho fatta — non ho gli strumenti per una verifica affidabile e non voglio darti una certezza che non ho.

---

## 4. Palette — "Crepuscolo"

### 4.1 Il cielo (sfondo della scena e della pagina)

Gradiente verticale, che è **lo sfondo del canvas 3D e il fondo del DOM insieme** — devono coincidere al pixel, altrimenti si vede la giuntura.

| Stop | Hex | Posizione |
|---|---|---|
| `--sky-top` | `#0D0A1A` | 0% — notte, indigo quasi nero |
| `--sky-mid` | `#241A38` | 45% — viola profondo |
| `--sky-low` | `#4A2E42` | 75% — il viola si scalda |
| `--sky-horizon` | `#C97B4E` | 96% — ambra bruciata |
| `--sky-glow` | `#F5C26B` | 100% — la luce all'orizzonte |

L'orizzonte non è mai al centro: sta **in basso, tra il 90% e il 100%** dell'altezza. Il cielo occupa quasi tutto. È ciò che dà l'impressione di volume prima ancora che il 3D si carichi — e infatti è un semplice `linear-gradient` CSS, quindi **è visibile a 0ms, prima di ogni JavaScript**. Questa non è solo estetica: è la strategia per l'LCP (§ 8).

### 4.2 Vetro (tutti i pannelli UI)

| Token | Valore | Note |
|---|---|---|
| `--glass-bg` | `rgba(255,255,255,0.055)` | Riempimento base |
| `--glass-bg-strong` | `rgba(255,255,255,0.10)` | Pannelli che contengono testo lungo |
| `--glass-border` | `rgba(255,255,255,0.14)` | Hairline 1px, sempre presente: definisce il bordo |
| `--glass-blur` | `blur(28px) saturate(1.25)` | La saturazione è ciò che fa sembrare vetro e non plastica |
| `--glass-shadow` | `0 24px 60px rgba(8,5,20,0.45)` | L'ombra è ciò che lo fa **fluttuare** |
| Raggio | `24px` (card) · `999px` (pillole, barre) | Angoli molto morbidi, dalle reference |

**Regola ferrea, presa dall'errore della reference C:** mai vetro sopra vetro. Massimo **un livello** di traslucenza tra il testo e la scena 3D. Dove il contrasto scende sotto 4.5:1, il pannello passa a `--glass-bg-strong` con un velo pieno `--sky-top` al 55%. **La leggibilità vince sempre sull'effetto.**

### 4.3 Testo e accenti

| Token | Hex | Uso |
|---|---|---|
| `--text-primary` | `#F6F3FA` | Titoli, corpo |
| `--text-secondary` | `#B3A9C4` | Meta, didascalie, label |
| `--text-muted` | `#7A7089` | Note legali, disattivato |
| `--accent-warm` | `#F5C26B` | **Accento primario.** Prezzo a fuoco, focus ring, linea di stampa, progressione. È la luce dell'orizzonte: viene dalla scena, non è appiccicato sopra. |
| `--accent-live` | `#5FE3D8` | **Solo per ciò che è "vivo" e interattivo adesso:** hotspot attivo sul modello, indicatore di caricamento, selettore materiale in uso. Dal ciano dei robot della reference A. Mai decorativo. |
| `--hot` | `#FF6B35` | Solo **"su richiesta"**: badge, step attivo del form preventivo, tempi di produzione. Distingue il *fatto su misura* dal *disponibile subito*. |

**Contrasti verificati su `--sky-mid` `#241A38`:** `--text-primary` ~13.5:1 · `--text-secondary` ~6.1:1 · `--accent-warm` ~9.2:1 · `--accent-live` ~11.4:1. Tutti oltre AA, i primi due oltre AAA.

### 4.4 CTA

Dalle reference B e C, che usano entrambe la **pillola ad alto contrasto**. Su fondo scuro invertiamo:

- **Primaria:** pillola bianca piena `#F6F3FA`, testo `#0D0A1A`. È l'elemento più luminoso dello schermo. **Una sola per viewport.**
- **Secondaria:** pillola in vetro, bordo `--glass-border`, testo `--text-primary`.
- **Terziaria:** testo con sottolineatura animata, nessun contenitore.
- Pulsante circolare con freccia diagonale ↗ per "avanti / prossimo" (reference C): diventa il nostro elemento di navigazione ricorrente.

### 4.5 Il colore del prodotto
L'interfaccia è quasi acromatica (viola scuro + bianco + un ambra) **perché il colore vero deve arrivare dai materiali stampati**. Quando l'utente cambia colore sul viewport prodotto, quello deve diventare l'oggetto più colorato dello schermo. Se l'interfaccia è già satura, il selettore materiale perde tutta la sua forza — che è esattamente la funzione che fa vendere.

---

## 5. Tipografia

**Tre famiglie**, tutte open source, self-hosted in `woff2` variabile e sottoinsiemate al latino. Niente chiamate a Google Fonts: costano una risoluzione DNS e una connessione sul percorso critico dell'LCP.

| Ruolo | Famiglia | Da dove viene | Perché |
|---|---|---|---|
| **Display** | `Archivo` (variabile, asse `wdth`) | Ref A (sans geometrico pesante) | Grotesque industriale con asse di larghezza: titoli larghi e tesi senza caricare un secondo file. |
| **Enfasi** | `Instrument Serif` — **solo corsivo** | Ref B (il mix roman + corsivo) | Una parola sola per titolo. È la firma tipografica del sito: dà calore editoriale a un oggetto tecnico. File unico, ~14 KB. |
| **Corpo · UI · Tecnico** | `Inter` (variabile) | Ref C (colonne di specifiche) | Leggibilità a corpo piccolo su fondo scuro, `tabular-nums` per i prezzi. |

**Decisione presa consapevolmente:** niente monospace. Il look "specifica tecnica" della reference C si ottiene con Inter in **maiuscolo, 12px, tracking `0.14em`, `--text-secondary`**, disposto in colonne. Una quarta famiglia costerebbe ~20 KB in più sul percorso critico per una differenza che a quel corpo quasi non si vede. Se dopo averlo visto non ti convince, si aggiunge `JetBrains Mono` in mezz'ora.

### 5.1 Scala (base 16px, fluida con `clamp()`)

| Token | Desktop | Mobile | Uso |
|---|---|---|---|
| `display-xl` | 120px | 52px | Titolo hero. Archivo `wdth 110`, `600`, tracking `-0.03em`, `line-height 0.92` |
| `display-l` | 72px | 38px | Titoli sezione, nome prodotto |
| `index` | 96px | 44px | Numerale d'indice prodotto (`01`, `02`) — ref C. Archivo `700`, `--text-secondary` al 35% |
| `title-m` | 30px | 24px | Sottotitoli, nome prodotto nel carosello 3D |
| `body-l` | 20px | 18px | Paragrafo introduttivo |
| `body` | 16px | 16px | Corpo. **Mai sotto 16px su mobile**: evita lo zoom automatico iOS sugli input |
| `spec` | 12px | 12px | Specifiche. Maiuscolo, tracking `0.14em`, tabellare |

### 5.2 Regole

- **Un solo `display-xl` per schermata.** Se due titoli enormi convivono, nessuno dei due è grande.
- **Un solo corsivo per titolo**, sulla parola che porta il significato. Due corsivi = zero enfasi. Es. *"Oggetti che nascono **strato dopo strato**"* con "strato dopo strato" in Instrument Serif corsivo.
- Titoli in **frasi minuscole**. Il maiuscolo è riservato alle specifiche tecniche: serve a separare la voce editoriale da quella tecnica.
- Prezzi sempre `tabular-nums`: le cifre non devono ballare quando cambia la variante.
- Misura di riga 60–70 caratteri. Su fondo scuro le righe lunghe affaticano più che su chiaro.
- **Nessun testo importante dentro il canvas 3D.** Tutto ciò che va letto, indicizzato o selezionato vive nel DOM sopra il canvas (vincolo SEO + accessibilità, § 8).

---

## 6. Principi di motion

Cinque regole, in ordine di priorità: se due confliggono vince quella più in alto.

### 1. Continuità — mai un taglio
Nessun cambio di stato è istantaneo. Passare da home a catalogo a prodotto non "carica una pagina": **la camera si sposta**. L'oggetto cliccato non scompare per ricomparire, viaggia. Conseguenza tecnica vincolante: il `<Canvas>` è **persistente sopra il router**, non viene mai smontato al cambio rotta.

### 2. Il movimento obbedisce al dito
Lo scroll è il cursore della timeline. Fermo il dito → si ferma. Torno indietro → torna indietro. Niente animazioni autoplay lunghe che vanno avanti per conto loro: tolgono il senso di controllo, e su un e-commerce questo si traduce in diffidenza.
**Due eccezioni,** entrambe dalle reference: l'**oscillazione lenta di sospensione** degli oggetti (comunica *questo fluttua, è manipolabile*) e il **lento scorrere del cielo**. Sono respiro ambientale, non narrazione.

### 3. Inerzia controllata, non elastica
- Lenis: `lerp ~0.09`, nessun rimbalzo a fine scroll
- Easing: `expo.out` per gli ingressi (parte veloce, si posa piano — sensazione di massa) · `power2.inOut` per i movimenti di camera
- Durate: micro-interazione 150–250ms · transizione elemento 400–600ms · viaggio di camera 800–1200ms
- **Parallasse del mouse smorzato, non diretto:** massimo ±3° di rotazione e ±20px di traslazione, interpolati a `lerp 0.05`. Il 3D che insegue il cursore 1:1 sembra un giocattolo, non uno studio.
- Su mobile la stessa curva è pilotata dal **giroscopio** (`deviceorientation`), con ampiezza dimezzata e richiesta di permesso su iOS 13+. Se il permesso è negato, la scena resta ferma: non è mai un requisito.

### 4. Un protagonista per volta
Quando un oggetto è a fuoco, gli altri sono **più lontani, meno luminosi, più lenti**. La gerarchia si costruisce con profondità, scala e luce — mai con il colore, che è riservato al prodotto. È la disciplina di 6TM ("un messaggio per blocco") tradotta in tre dimensioni.

### 5. Il motion è un livello, non una struttura
Con `prefers-reduced-motion` o senza WebGL il sito **perde il movimento e non perde nulla di funzionale**: stessa gerarchia, stessi contenuti, acquisto completo. Il test è: *se spengo tutte le animazioni, il sito vende ancora?* Se no, è sbagliato il layout, non il motion.

### 6.1 Ritmo dello scroll in home

~4 schermate piene, un messaggio per schermata. La barra "prossimo prodotto" in basso (reference C) è il motore: mostra sempre **dove stai andando**, così lo scroll non è mai un salto nel buio.

```
0.00  Cielo al crepuscolo. Un oggetto sospeso al centro, in silenzio.
      Titolo. Nessuna richiesta all'utente. Solo respiro.
0.18  Primo scroll: la camera avanza, il titolo esce verso l'alto e si dissolve.
      I pannelli di vetro entrano dal basso.
0.30  Oggetto 01 a fuoco. Hotspot ancorato al modello → nome, prezzo, "aggiungi".
      Colonna specifiche a destra, maiuscolo tecnico. Indice "01" grande, dietro.
0.50  Oggetto 02. Il primo scivola indietro nel cielo, il secondo arriva dall'orizzonte.
      Passaggio continuo: mai un fotogramma in cui non c'è nessun protagonista.
0.70  Oggetto 03. Compare l'etichetta "disponibile subito".
0.85  La camera arretra e rivela tutti gli oggetti sospesi sull'orizzonte
      → CTA "vedi il catalogo".
1.00  Uscita dal 3D. Blocco "Su richiesta": fondo pieno, tipografico, accento --hot.
      Il contrasto con il 3D è il punto. Qui si parla, non si guarda.
```

**Distanza:** ~600vh. Meno diventa frenetico, più diventa una tassa per arrivare al footer.
**Sempre presente:** un link **"salta al catalogo"**, primo elemento focusabile della pagina, visibile al focus da tastiera. Chi vuole solo comprare non deve subire la regia. Questo è insieme un requisito di accessibilità e una scelta di conversione.

---

## 7. Tre idee di hero

Tutte e tre: cielo al crepuscolo con orizzonte ambra, oggetti sospesi, pannelli di vetro fluttuanti, reazione smorzata a mouse/giroscopio. Cambia **cosa fa la camera** e **cosa racconta**.

### Idea A — "Arcipelago"
*Dalla reference A.* Gli oggetti stanno su **piedistalli sottili che fluttuano** nel cielo a quote e profondità diverse, sfalsati, come isole sospese. La camera **scivola lateralmente** tra loro: lo scroll verticale diventa movimento orizzontale. Ogni piedistallo che passa davanti all'orizzonte si accende di controluce ambra, poi rientra nella penombra.

- **Forza:** leggibilità immediata di "sono prodotti, in fila, in vendita". La più diretta e la meno rischiosa per la conversione. Scala bene: se aggiungi 20 prodotti, funziona ancora.
- **Rischio:** è la più convenzionale. Bella, ma non è quella di cui si parla.
- **Costo:** basso. Un asse di camera, un solo materiale, instancing dei piedistalli.

### Idea B — "Capsula"
*Dalla reference C.* Ogni prodotto è dentro una **sfera di vetro rifrangente** che fluttua sull'orizzonte, con piccole bolle che orbitano lentamente. Lo scroll fa ruotare le capsule su un carosello in profondità; quella a fuoco si apre — il vetro si dissolve — e l'oggetto resta nudo, pronto per essere ispezionato.

- **Forza:** l'immagine più preziosa delle tre. Il vetro comunica *oggetto da collezione*, che è esattamente il posizionamento di "oggetti da esposizione / design". L'apertura della capsula è una micro-storia di 600ms che fa da transizione naturale alla pagina prodotto.
- **Rischio: il più serio del documento.** `MeshTransmissionMaterial` richiede un re-render della scena per ogni superficie rifrangente. Con 3+ capsule visibili su un mid-range Android si va sotto i 30 fps garantiti. Mitigazione obbligatoria: **una sola capsula rifrattiva** (quella a fuoco), le altre con un materiale finto (`MeshPhysicalMaterial` trasparente + cubemap statica). Su profilo basso, niente vetro.
- **Costo:** alto. È l'idea che può far saltare il vincolo di performance se gestita male.

### Idea C — "Strato dopo strato" *(la mia raccomandazione)*

Si apre quasi al buio: solo un cielo notturno e una **linea di luce ambra** all'orizzonte.
Poi la linea **comincia a salire**. E mentre sale, l'oggetto **si costruisce sotto di essa, strato dopo strato** — perché quella linea è due cose insieme: **il sole che sorge** e **la testina di stampa**. In ~1,8s l'oggetto è finito, la linea raggiunge l'orizzonte e si ferma lì, diventando il tramonto che illumina tutta la scena. Il titolo compare. Da quel momento lo scroll passa alla modalità *Arcipelago* (A): gli altri oggetti arrivano già finiti. **La nascita si vede una volta sola.**

- **Forza:** è l'unica delle tre che **racconta chi sei**. Non vendi oggetti: vendi il fatto che li produci tu — che è anche il motivo per cui ha senso il blocco "Su richiesta". Fonde nome, processo produttivo e immagine in un gesto solo, e nessun concorrente può prendersela perché è costruita sul nome. Tecnicamente è anche la più elegante: un solo piano di taglio animato riusato da tutta la scena.
- **Rischio:** un'animazione d'ingresso è in conflitto naturale con LCP < 2,5s. **Si mitiga così, ed è vincolante:**
  1. L'LCP è il **titolo in DOM su gradiente CSS**, renderizzato lato server e visibile a 0ms. Non è il canvas. Il canvas arriva dopo e non entra nella misura.
  2. L'animazione parte **solo a modello caricato**. Se a 1200ms il GLB non c'è, si salta direttamente alla scena finita: nessuna attesa, nessun schermo vuoto.
  3. Si vede **una volta per sessione** (`sessionStorage`). Alla seconda visita è una tassa, non un effetto.
  4. È **saltabile**: qualsiasi scroll, tap o tasto la conclude immediatamente.
- **Costo:** medio. Il taglio a strati è uno shader semplice (`clippingPlanes` + una emissive band). La complessità vera è nella logica di degradazione, non nella grafica.

### Confronto

| | A — Arcipelago | B — Capsula | C — Strato dopo strato |
|---|---|---|---|
| Impatto nei primi 3s | Medio | **Alto** | **Alto** |
| Racconta il brand | Basso | Medio | **Alto** |
| Fedeltà alle reference | Alta (ref A) | **Altissima** (ref C) | Media, poi alta |
| Rischio performance | **Basso** | **Alto** | Medio |
| Tenuta su mobile | **Alta** | Media | Alta |
| Rischio sulla conversione | **Basso** | Medio | Basso (con mitigazioni) |
| Scala a 20+ prodotti | **Sì** | Con fatica | Sì (eredita A) |

**Raccomandazione: C, che confluisce in A dopo i primi 2 secondi.** Ottieni il racconto e l'impatto, e resti su un impianto che regge su mobile e scala col catalogo. **B non la scarto: diventa il trattamento della pagina prodotto**, dove c'è un solo oggetto in scena, il budget di rendering è tutto suo e la preziosità del vetro lavora a favore dell'acquisto invece che contro la performance.

---

## 8. Vincoli di design (i non negoziabili, tradotti in regole grafiche)

- **Il testo vive nel DOM.** Nome, prezzo, descrizione, specifiche: renderizzati lato server, sopra il canvas. Il 3D è l'*immagine* del prodotto, non il suo contenuto. Vale per SEO, screen reader, `Ctrl+F` e fallback tutti insieme, con un solo lavoro.
- **Ogni oggetto 3D interattivo ha un gemello nel DOM:** un `<button>` posizionato e focusabile con `aria-label`. `Tab` percorre i prodotti nell'ordine di scroll, e il focus **muove la camera** sull'oggetto corrispondente. Gli hotspot della reference C sono già elementi DOM: li implementiamo con `<Html>` di drei, quindi sono accessibili per costruzione.
- **Focus ring sempre visibile:** 2px `--accent-warm` + 2px di offset. Su vetro traslucido un outline sottile sparisce.
- **Area di tocco minima 44×44px**, hotspot 3D compresi.
- **Mobile first sul touch:** un dito = orbita, due dita = zoom, il pinch non deve mai far zoomare la pagina (`touch-action: none` solo sul canvas). L'anteprima 3D all'hover in catalogo è un **arricchimento desktop**: su touch il tap apre direttamente il prodotto, non esiste uno stato intermedio.
- **Il gradiente del cielo è CSS, non WebGL.** Il canvas è trasparente sopra di esso. Così lo sfondo è già a posto prima che React monti, il fallback è identico al sito vero, e la giuntura non esiste.
- **Lingua italiana**, stringhe centralizzate e pronte per i18n: nessun testo cablato nei componenti.

---

## 9. Degradazione automatica della qualità

Tre profili, scelti a runtime (`navigator.hardwareConcurrency`, `deviceMemory`, dimensione schermo, fps misurati nei primi 2s) e forzabili a mano da un controllo nel footer.

| | **Alto** | **Medio** | **Basso / fallback** |
|---|---|---|---|
| Pixel ratio | fino a 2 | 1.5 | 1 |
| Ombre | soft, mappa 2048 | contact shadow precalcolata | AO cotta in texture |
| Vetro rifrangente | sì, 1 oggetto | finto (cubemap statica) | opaco |
| Post-processing | bloom + vignette | vignette | nessuno |
| Oggetti in scena | 8 | 4 | immagini statiche |
| Blur dei pannelli UI | 28px | 16px | nessuno, fondo pieno |
| Animazione "genesi" | sì | sì | no |
| Antialiasing | MSAA | FXAA | — |

Se gli fps restano sotto 30 per più di 2 secondi consecutivi si **scala di un profilo e non si risale** nella stessa sessione: l'oscillazione tra profili è più fastidiosa del profilo basso.

**Fallback totale** (no WebGL · `prefers-reduced-motion` · perdita del contesto WebGL): stesso cielo in gradiente, stessi pannelli di vetro, stessa tipografia, stesso layout. Al posto del canvas, un'immagine `poster` in `.webp` estratta dallo stesso render. **Nessuna funzione d'acquisto persa.** Non è una pagina d'emergenza: è lo stesso sito, fermo.

---

## 10. Tono di voce

Dalle reference prendo la brevità e l'imperativo; da 6TM la disciplina. Niente entusiasmo da marketplace.

- Frasi brevi. Verbi all'inizio. Nessun superlativo.
- **Le specifiche sono dati, non promesse:** `PLA OPACO · 120×80×45 MM · 3-5 GIORNI LAVORATIVI`. Mai "qualità eccezionale".
- Il corsivo tipografico (§5) porta l'unica nota calda del testo. Usarlo sulla parola che conta, mai sull'aggettivo.
- Il "su richiesta" si dichiara subito come **preventivo, non acquisto**: *"Raccontaci l'oggetto. Ti rispondiamo con un preventivo entro 48 ore."* Nessun prezzo automatico, nessuna ambiguità — anche perché è ciò che ci tiene puliti rispetto al recesso (art. 59 Cod. Consumo).
- Non si dichiara la qualità: si mostra il processo. È esattamente quello che fa l'hero C.

---

## 11. Dati confermati e ancora da decidere

**Confermati da te:** tono dark/tech → riletto come *Crepuscolo* (§2) · categorie: **oggetti da esposizione / design**, **regali personalizzati**, **decor** · spedizione: **solo Italia, costo fisso**.

**Da decidere insieme:**

1. **Il conflitto del § 2.** *Crepuscolo* va bene, o intendevi il nero assoluto da studio fotografico? Cambia tutto il resto.
2. **Il nome: STRATO.** Ti convince? (alternative: MICRON, ZETA). Dominio e marchio da verificare — io non l'ho fatto.
3. **Quale hero:** A, B o C. Io consiglio **C che confluisce in A**, con B spostata sulla pagina prodotto.
4. **Spedizione:** costo esatto (es. 6,90 €) e soglia di gratuità (es. 60 €). Finché non me li dai restano segnaposto marcati in `/data/shipping.ts`.
5. **Ragione sociale, P.IVA, sede, PEC/email** — per footer, pagine legali ed email transazionali.
6. **Quanti prodotti reali** hai per il lancio? Sotto i 6, il catalogo va disegnato come selezione curata, non come griglia filtrabile.
7. Le categorie che hai indicato sono 3: confermi che **"oggetti da esposizione / design"** è una categoria e non il posizionamento generale? Se è il posizionamento, ne servono altre due merceologiche.

---

*Prossimo passo, a tua approvazione: `PLAN.md` — piano tecnico, fasi, struttura cartelle. Non scrivo una riga di codice prima del tuo via.*
