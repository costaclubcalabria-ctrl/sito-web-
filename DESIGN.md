# DESIGN.md — Direzione creativa

**Stato: v4 — "Vetro".** Brand **STRATO**.

Tre versioni scartate prima di questa, e vale la pena dire perche: servono a
spiegare cos'e questa.

| | Direzione | Perche e stata scartata |
|---|---|---|
| **v1** | *Crepuscolo* — cielo notturno in gradiente, oggetti sospesi | *"Non mi piace quel layout con gradiente… deve essere qualcosa di sensazionale"*. E il concetto era decorazione: le linee di stampa erano un motivo grafico sopra un sito che avrebbe funzionato identico senza. |
| **v2** | *Alba* — cielo stratificato, piatto riflettente | Stesso problema, piu bello. |
| **v3** | *Stratigrafia* — strati geologici, lo scroll come testina | Il meccanismo era giusto, il risultato era **scuro e archeologico**: un sito che raccontava un processo invece di vendere un oggetto. |

La v4 risponde a quattro richieste precise, e ognuna e diventata una regola:

1. **I due oggetti allegati come esempi** → il catalogo e costruito intorno a
   loro: il busto del **David** in tinta piena e la lampada a blocco. Entrambi
   portano un'avvertenza legale, che sta nella §8 e in testa a
   `data/products.ts`: non sono dettagli, sono due rischi reali.
2. **"Una soluzione neutra ma molto figa dietro, con i colori accesi degli
   oggetti stampati"** → la **stanza** e un grigio chiarissimo da cabina di
   posa; l'unico colore in pagina e quello del pezzo che stai guardando, e il
   fondo lo raccoglie in un alone larghissimo (§4). Cambi pezzo, cambia la luce
   della stanza.
3. **"Usa tipo il liquid glass di Apple"** → tutta l'interfaccia e vetro con
   spessore, non il glassmorphism piatto (§5). Con una nota onesta su cosa di
   quell'effetto **non** e riproducibile oggi, e perche non l'ho finto.
4. **"Uno scorrimento continuo nella home con gli oggetti 3d che si muovono"**
   → la home e un **fiume**: i pezzi non si fermano mai e ogni scheda scorre
   attaccata al suo pezzo (§2).

La §1 (analisi delle reference) e la §3 (il nome) restano dalla v1: sono ancora
gli input. Tutto il resto e nuovo.

> Nota di metodo. Quasi tutto quello che sta qui sotto e stato **verificato a
> schermo**, non ragionato: ogni versione di questa pagina e stata fotografata
> su desktop e su mobile e corretta su quello che si vedeva. I difetti trovati
> cosi sono elencati nella §13, perche sono la parte piu utile del documento.

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

## 2. Il principio: la home e un fiume

**La camera non si muove. Scorrono i pezzi.**

Una camera fissa, frontale, come quella puntata su un banco di posa. I pezzi
attraversano l'inquadratura in continuo su una traiettoria ad arco: arrivano da
destra, passano vicini al punto di posa, escono a sinistra rimpicciolendo. Non
ci sono soste, non ci sono dissolvenze incrociate, non ci sono "schermate": la
pagina ha una **corsa**.

### Un solo numero muove tutto

E la regola architetturale piu importante del progetto, e nasce da un difetto
che si e ripresentato in tutte le versioni precedenti: **il testo che racconta
un pezzo diverso da quello che vedi.**

Qui la posizione della fila e un numero, `s`. La distanza di un pezzo dal punto
di posa e `d = i − s`. Da `d` dipendono: dove sta il pezzo, quanto e grande,
quanto e opaco, e **dove sta la sua scheda nel DOM e quanto e opaca**. Testo e
oggetto non possono desincronizzarsi perche leggono lo stesso numero, e la
conversione fra unita di scena e pixel (`pixelPerUnita`, da fov e distanza
della camera) e **una sola funzione** condivisa, non due copie.

La scheda non sta ferma cambiando contenuto: **appartiene al pezzo** e si muove
con lui. Percorre una frazione della corsa del pezzo (0,36) — una parallasse
fra un piano vicino e uno lontano, non una desincronizzazione: entrano, passano
a fuoco ed escono nello stesso istante.

### Le conseguenze sul funzionamento del sito

- **Niente stato React per frame.** Sessanta re-render al secondo dell'albero
  sarebbero il collo di bottiglia. Lo stato per-frame vive in un modulo
  (`lib/frame.ts`), scritto dal DOM e letto dentro `useFrame`.
- **Il canvas non si smonta mai.** Sta nel layout, non nelle pagine: un cambio
  di rotta e un movimento di camera, non un rimontaggio.
- **La matematica del fiume non importa `three`.** Sta in `lib/fiume.ts`, cosi
  il DOM la usa senza tirarsi dietro 900 KB di libreria 3D. Questa unica
  separazione vale 99 KB gzip sul percorso critico — misurati.
- **Sei pezzi nel fiume, dieci in catalogo.** Il fiume e la vetrina, non
  l'inventario.

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

## 4. La stanza e la tinta

### Il fondo e neutro, il colore arriva dai pezzi

```
--color-nebbia        #E7E7EC   la stanza
--color-nebbia-alta   #F6F6F8   la luce che cade dall'alto
--color-nebbia-bassa  #D2D2D9   l'ombra che sale dal basso
--color-ink           #16161A   il testo
--color-carbone       #17171B   il footer, l'unica superficie scura
--color-ugello        #FF4D1F   il solo accento d'interfaccia
```

Non c'e una palette di scena, e questa e la scelta centrale della versione: una
palette di brand colorata e in **concorrenza** con dieci oggetti stampati in
nove colori saturi. Il fondo sta a zero e lascia parlare i pezzi.

**Perche `#E7E7EC` e non il bianco.** Provato: sopra `#EAEAEE` il vetro non ha
niente da rifrangere e legge come una lastra di plastica bianca. La stanza va
un filo piu profonda del bianco perche il vetro abbia qualcosa da fare. Resta
neutra: e grigia, non azzurra.

**La tinta.** Il colore del pezzo a fuoco viene scritto su `:root` come
`--tinta`, e il fondo lo raccoglie in due aloni larghissimi e tenui. Deve
sembrare **luce riflessa**, non un fondo colorato — e una taratura delicata:
alla prima prova era al 46% e la pagina diventava rosa. Ora e al 30%, e sotto
il fiume (dove ci sono liste e prezzi da leggere) scende a un terzo.

Il colore di presentazione e **dichiarato dal prodotto**, non dedotto dal
materiale: su un fondo chiaro un pezzo bianco non si vede. Sta in
`ProductModel.colore` ed e un requisito di leggibilita, non una preferenza.

### La griglia

`.content-grid`: margini fluidi, colonna di testo a 62ch, e una fascia destra
riservata alla scheda di vetro da 640 px in su. Dichiarata una volta, non
compensata a mano in ogni sezione.

---

## 5. Il vetro

Non il glassmorphism piatto (un velo bianco piu un blur): quello legge come
carta velina. Il vetro qui ha **spessore**, e lo spessore si vede in tre cose,
tutte necessarie:

1. **il bordo speculare** — non un contorno uniforme: un gradiente che gira
   sull'anello di 1 px, brillante in alto a sinistra e in basso a destra, quasi
   invisibile sugli altri due lati (`mask-composite: exclude`);
2. **il riflesso interno** in alto, largo e morbido, che suggerisce una
   superficie leggermente convessa;
3. **l'ombra ambientale** sotto, staccata su tre raggi, che solleva la lastra
   dal fondo.

Piu `backdrop-filter: blur() saturate() brightness()`: la saturazione e la
parte che si dimentica, ed e quella che fa **bere il colore** al vetro. Un
pezzo rosso che passa dietro una scheda la tinge di rosa.

### Due spessori, e il secondo non e negoziabile

`.vetro` (barre, controlli, indicatori) e sottile: 20% di bianco, blur 20 px.
`.vetro-scheda` (tutto cio che contiene testo da leggere) e spesso: 52% di
bianco, blur 28 px. **La leggibilita vince sull'effetto**: sopra una scena che
cambia in continuo, un vetro sottile non garantisce contrasto.

### ⚠️ Una nota onesta sulla rifrazione

Il vero effetto Apple **sposta i pixel** dietro il bordo, come una lente. Oggi
si ottiene solo con `backdrop-filter: url(#filtro)` e una displacement map SVG,
che funziona in Chrome e non in Safari ne in Firefox — cioe non funziona
proprio dove l'utente se lo aspetta. Quindi non c'e: bordo speculare, riflesso
e saturazione del fondo fanno la quasi totalita della resa, in tutti i browser.
Quando `backdrop-filter: url()` sara supportato si aggiunge dietro un
`@supports`, senza toccare nient'altro.

### ⚠️ E un difetto che ho trovato solo misurando il CSS compilato

Nel sorgente il vetro era perfetto. Nel CSS compilato **la sfocatura non
c'era**: il minificatore (Lightning CSS, dentro la pipeline di Next) aveva
tenuto solo `-webkit-backdrop-filter`, perche nel sorgente la riga con il
prefisso stava **dopo** quella standard. E Chrome non supporta la versione
prefissata (`CSS.supports('-webkit-backdrop-filter','blur(1px)')` restituisce
`false`): l'effetto centrale di questa versione era spento nel browser della
maggior parte delle persone, e le schede erano veli bianchi con i pezzi nitidi
che si vedevano attraverso il testo.

Il prefisso va **prima**, lo standard **dopo**. La regola e scritta a commento
sopra la dichiarazione, perche e il tipo di errore che si rimette da solo alla
prima riformattazione.

---

## 6. Tipografia

Tre famiglie, tre lavori distinti. Nessuna decorativa.

| Ruolo | Famiglia | Perche |
|---|---|---|
| **Display** | `Syne` 400-800 | Proporzioni volutamente anomale: la `O` e quasi un cerchio perfetto, la `A` ha il vertice tagliato, gli spessori cambiano dove non te lo aspetti. Non si confonde con nulla, ed e cio che serve a un marchio riconoscibile da una parola sola. |
| **Corpo · UI** | `Inter` | Leggibilita a corpo piccolo, metriche ampie. |
| **Misure** | `JetBrains Mono` | Quote, spessori, numero di strati e tempi sono *misure*, e le misure si incolonnano. Senza un monospaziato tabellare le colonne ballano. |

Caricate con `next/font` (self-hosted, nessuna richiesta a Google in runtime) e
`display: swap`, perche l'`<h1>` e l'elemento dell'LCP.

### L'enfasi e cavata a strati

Le parole che portano il significato non sono in corsivo di un'altra famiglia:
sono **cavate a strati**, con righe orizzontali da uno strato ritagliate nel
pieno delle lettere (`background-clip: text`). Il marchio e il titolo dicono la
stessa cosa nello stesso modo. Una sola enfasi per titolo.

### Il logotipo

Syne ExtraBold con le **linee di stampa dentro le lettere** — non disegnate
sopra la parola, ritagliate nella parola: esistono solo dove c'e inchiostro. Al
passaggio del mouse una linea ambra lo attraversa dal basso verso l'alto, come
la testina che depone uno strato. Una volta, non in loop: e un gesto.

Dove `background-clip: text` non e supportato la parola resta piena. Un
logotipo invisibile sarebbe un difetto molto peggiore di uno senza le sue
righe.

---

## 7. Motion — il fiume

### Lo scorrimento

Un solo `ScrollTrigger` sull'intera corsa della home (`top top` → `bottom
bottom`), ~110 svh di corsa per pezzo. Lenis per l'inerzia. Nessuna sosta, e
quindi nessun pinning che vada gestito: il progresso e continuo e si traduce in
`s` senza discontinuita.

### La rotazione: **oscillazione, non giro**

Ogni pezzo oscilla di ±27° intorno al suo angolo di presentazione, con
l'ampiezza che si stringe quando arriva a fuoco: da lontano si muove di piu, a
fuoco si mostra.

E una correzione, non una scelta estetica. Prima i pezzi compivano un giro
completo, e un pezzo asimmetrico che gira mostra il suo **dietro** per metà del
tempo: il dietro di una lampada a borchie e un rettangolo liscio, e in
screenshot la lampada era un rettangolo arancione. Ora ogni forma dichiara
l'angolo da cui si legge (`INQUADRATURA`): il blocco a tre quarti, perche e
l'unico angolo da cui le borchie si vedono come borchie.

### La dissolvenza d'entrata e **asimmetrica**

A sinistra del punto di posa c'e spazio aperto: un pezzo che esce resta
visibile a lungo e si dissolve piano. E la profondita del fiume.

A destra c'e la scheda. Il pezzo che arriva passa **dietro** la lastra — e
inevitabile, le schede stanno a destra e i pezzi arrivano da destra — e dietro
il vetro un pezzo colorato e un bellissimo alone. Il problema e il pezzo che
**sporge** dal bordo della lastra: quello legge come un rettangolo colorato
incollato all'interfaccia. Quindi in arrivo il pezzo e solo un alone, e diventa
solido quando ne e uscito.

Con un'eccezione, e sta nel codice come parametro `velo`: **all'apertura la
scheda non c'e**. Il primo pezzo sta a destra del titolo e li deve essere
pieno, perche e la prima cosa che si vede del sito.

### La prima stampa

Una volta per sessione, all'apertura, il primo pezzo **si costruisce a strati**:
un piano di taglio sale, un anello color ugello segna la quota di deposizione,
e il pezzo non ruota mentre si stampa. Dura poco piu di due secondi, la salta
qualunque scroll, e non si ripete (`sessionStorage`). E l'unico momento in cui
il sito spiega cosa fa invece di dirlo.

### Il puntatore

La camera resta ferma; il puntatore inclina di pochissimo i pezzi a fuoco e
sposta la key light. Su touch lo fa il giroscopio, se c'e il permesso. Serve a
una cosa sola: far leggere gli oggetti come **manipolabili**.

---

## 8. I due pezzi d'esempio, e le loro avvertenze

Le due immagini che mi hai mandato sono diventate i primi due prodotti del
catalogo. Entrambe portano un problema legale che **non ho deciso io di
ignorare**: sta scritto in testa a `data/products.ts` e va risolto prima di
vendere.

**Il busto del David.** L'opera e in pubblico dominio come *opera*, ma il
Codice dei beni culturali (artt. 107-108) sottopone lo **sfruttamento
commerciale della riproduzione** dei beni in consegna a un museo statale
all'autorizzazione della Galleria dell'Accademia, che la concede e la tariffa.
Il nostro modello e una **reinterpretazione stilizzata**, non una scansione — e
un'attenuante, non una risposta. **Da far verificare a un legale prima della
vendita.**

**La lampada a blocco.** La forma del mattoncino a incastro con le borchie e un
**marchio di forma registrato** e difeso attivamente. Il pezzo si chiama
**"Blocco"**, ha proporzioni e numero di borchie propri, e il nome del marchio
non compare in nessun testo, titolo, tag o annuncio. La somiglianza di famiglia
resta un rischio: e una decisione commerciale, da prendere con gli occhi
aperti.

I segnaposto 3D di questi due pezzi sono **nostri** e procedurali (vedi §9):
nessun file di terzi e entrato nel progetto.

---

## 9. Come si vede che e stampato

Tre dettagli, e senza di essi il concetto resta scritto e non visibile.

**Le linee sull'oggetto.** Una mappa di rilievo con una riga per strato, e la
luce radente che le accende. Il profilo di un singolo strato non e una riga: e
un **cordone** — chiaro al centro dove il filamento e piu spesso, scuro al
bordo dove due passate si incontrano. Le creste sono anche piu lucide delle
valli, perche la punta del cordone e stata schiacciata dall'ugello. Disegnata
su canvas, zero byte di rete.

**L'ombra di contatto.** Su fondo chiaro e **l'elemento piu importante della
scena**: e cio che appoggia il pezzo su un piano. Senza, un oggetto su fondo
chiaro e un ritaglio incollato.

**La mappa d'ambiente.** Costruita in scena con dei `Lightformer`, non
scaricata: una HDRI pronta costa 2-4 MB e una connessione a un dominio terzo
sul percorso critico. Una superficie satinata non ha alcun aspetto proprio — e
fatta di quello che riflette — e senza mappa d'ambiente sembra gesso.

**E la luce ambientale va tenuta bassa.** Su un fondo chiarissimo viene
naturale alzarla: e l'errore. A 1,35 i pezzi erano macchie di colore piatte,
senza un lato in ombra. Il contrasto su fondo chiaro viene dall'**ombra**, non
dalla luce.

### I segnaposto procedurali

I GLB reali non esistono ancora, quindi le forme sono generate in codice,
deterministiche (stesso seme, stessa forma) e in cache. Restano poi come rete
di sicurezza: se un modello manca, il sito non mostra mai un buco.

Il busto ha richiesto quattro tentativi, e il diario e nel codice perche e
istruttivo: una figura di rivoluzione ha la silhouette di una campana da
qualsiasi angolo (una **pedina**); un'estrusione della sagoma frontale ha due
facce piatte e un cordone di smusso (un **flacone**); la stessa con i fianchi
verticali e un **cassone**. Funziona solo una **superficie parametrica** in cui
il raggio dipende sia dall'altezza sia dall'angolo — 0,30h di mezza larghezza
alle spalle contro 0,135h di mezza profondita al petto — con la sezione a
superellisse e la spalla che cala verso la punta. Piu un naso da tre
millimetri, che vale piu di tutto il resto della testa: e il solo dettaglio che
trasforma un ovale in un volto.

`MODELS.md` documenta la pipeline STL/3MF → GLB per sostituirli (Meshopt,
< 1,5 MB per modello).

---

## 10. Vincoli di design (i non negoziabili, tradotti in regole)

- **Il testo vive nel DOM**, mai dentro il canvas. Una scelta, quattro problemi
  risolti: SEO, screen reader, `Ctrl+F` e fallback senza WebGL.
- **La leggibilita vince sull'effetto.** Se una scheda non ha contrasto
  sufficiente sopra la scena, si ispessisce il vetro.
- **Focus ring visibile**, 4px (uno strato) nel colore dell'ugello.
- **Area di tocco minima 44×44 px.**
- **Mobile first sul touch:** la scheda occupa il basso dello schermo e **non
  ha corsa orizzontale** — un telefono non ha un pixel di gioco laterale, e
  qualunque parallasse le tagliava il testo. Li scorre in verticale, di poco.
- **Il fiume non e l'unica strada.** La seconda voce di tab e "Salta al
  catalogo": la distinta sotto il fiume contiene tutti e dieci i pezzi con
  nome, tempi e prezzo, ed e il percorso completo per tastiera e screen reader.
  Le schede del fiume sono focalizzabili quando il loro pezzo e in scena, e
  ricevendo il fuoco portano il fiume su di loro.
- **Lingua italiana**, stringhe centralizzate e pronte per i18n.

---

## 11. Degradazione automatica della qualita

| | **Alto** | **Medio** | **Basso / fallback** |
|---|---|---|---|
| Pixel ratio | fino a 2 | 1.5 | 1 |
| Mappa d'ambiente | 256 px | 128 px | nessuna |
| Ombra di contatto | 1024 px | 512 px | nessuna |
| Ombre proiettate | si | no | no |
| Pezzi nel fiume | 6 | 6 | immagini statiche |
| Prima stampa | si | si | no |
| Antialiasing | MSAA | FXAA | — |

Il fiume monta sei pezzi anche nel profilo alto: sono quanti sono le schede nel
DOM, e un pezzo in scena senza la sua scheda sarebbe un oggetto di cui non si
puo leggere niente.

Se gli fps restano sotto 30 per piu di 2 secondi consecutivi si **scala di un
profilo e non si risale**: l'oscillazione e piu fastidiosa del profilo basso.
Si puo forzare un profilo con `?qualita=high|medium|low`.

**Fallback totale** (no WebGL · `prefers-reduced-motion`): le schede si
impilano e si leggono una dopo l'altra, con i pezzi gia stampati. Stesso
contenuto, stessa gerarchia, acquisto completo. Verificato: con
`prefers-reduced-motion` il chunk 3D **non viene scaricato** (628 KB di
JavaScript invece di 1,62 MB non compressi), e senza JavaScript tutte e sei le
schede restano nel flusso con nomi e prezzi visibili.

---

## 12. Tono di voce

- Frasi brevi. Verbi all'inizio. Nessun superlativo.
- **Le specifiche sono dati, non promesse:** `100 × 95 × 150 MM · 0,16 MM ·
  938 STRATI · 4-6 GIORNI LAVORATIVI`. Mai "qualita eccezionale".
- L'elenco dei prodotti e una **distinta di produzione**, non una griglia di
  card: una riga per pezzo, incolonnata — pastiglia del colore, numero, nome,
  tempi, prezzo.
- Il "su richiesta" si dichiara subito come **preventivo, non acquisto**.
- Non si dichiara la qualita: si mostra il processo. E cio che fa il sito
  intero.

---

## 13. I difetti trovati a schermo (e non ragionando)

Questa sezione esiste perche e la piu utile: sono tutti errori che nel codice
sembravano corretti.

| Difetto | Causa | Rimedio |
|---|---|---|
| Il vetro non sfocava niente, in Chrome | il minificatore teneva solo `-webkit-backdrop-filter`, che Chrome non supporta | prefisso prima, standard dopo (§5) |
| "strato dopo strato" invisibile nell'hero | `currentColor` in un `background-image` con `color: transparent` per il `background-clip: text` | colore delle righe in una custom property dedicata |
| La scheda sbordava di 150 px a destra | un passo del fiume vale ~780 px: la scheda non puo farlo tutto | corsa ridotta a 0,36 e posa arretrata (§2) |
| Su mobile la scheda era tagliata a meta | stessa causa, senza un pixel di gioco laterale | nessuna corsa orizzontale sotto 640 px |
| Il busto era una pedina, poi un flacone, poi un cassone | geometria di rivoluzione, poi estrusa | superficie parametrica (§9) |
| Il busto era una **palla rosa** | `mergeGeometries` rifiuta insiemi con attributi diversi e restituiva `null` in silenzio: si ripiegava sulla sfera di scorta | normalizzazione degli attributi, piu un `console.warn` in sviluppo |
| La lampada a blocco era un rettangolo liscio | il giro completo ne mostrava il dietro | oscillazione intorno all'angolo di presentazione (§7) |
| I pezzi erano macchie piatte | luce ambientale a 1,35 su fondo chiarissimo | ambiente a 0,5, il volume lo fa l'ombra (§9) |
| La pastiglia dell'indice finiva sotto la scheda, su mobile | due elementi fissi nello stesso angolo | l'indice non compare sotto 640 px: numero e totale sono gia nella scheda |
| Il fondo diventava rosa | tinta al 46% | 30%, e un terzo sotto il fiume (§4) |

---

## 14. Dati confermati e ancora da decidere

**Confermati:** brand **STRATO** · spedizione **8,99 €**, gratuita da
**90,00 €**, solo Italia · **10 prodotti** · categorie *decor · illuminazione ·
scrittoio · regali personalizzati* · ragione sociale e P.IVA come segnaposto.

**Da decidere:**

1. **Ragione sociale, P.IVA, sede e PEC/email**: obbligatori per legge prima
   del lancio, oggi segnaposto dichiarati.
2. **Dominio e marchio "STRATO"**: non verificati. Non ho strumenti per una
   verifica affidabile e non voglio darti una certezza che non ho.
3. **La posizione legale su David e sul blocco a borchie** (§8).
4. Email dove ricevere i preventivi e dominio per le email transazionali.
5. Chiavi Stripe in modalita test.
6. Preferenza storage per gli upload: Vercel Blob (default) o Cloudflare R2.
