# Food cost

Web app per il controllo del food cost di una trattoria: quanto costa ogni
piatto, che food cost % ha, quanto margine lascia. I numeri si ricalcolano da
soli a ogni variazione di prezzo di un ingrediente.

È un'app indipendente: vive in questa cartella e non ha legami con il resto
del repository.

## Avvio

Serve Node.js 20.9 o successivo.

**Modo rapido:** su Windows doppio clic su `avvia.bat`; su Mac e Linux
`sh avvia.sh`. Fanno da soli installazione, database, build e avvio.
Dopo un aggiornamento del codice, cancellare la cartella `.next` prima di
riavviare.

Passi manuali equivalenti:

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run db:setup
```

```bash
npm run db:seed
```

```bash
npm run build
```

```bash
npm start
```

- `db:setup` crea il database in `data/foodcost.db`.
- `db:seed` è facoltativo: carica i dati di esempio (20 ingredienti, 3
  semilavorati, 6 piatti). Non fa nulla se ci sono già ingredienti.
- L'app risponde su `http://localhost:3100`. Da tablet e telefono sulla stessa
  rete: `http://<indirizzo-del-computer>:3100`.
- **Al primo accesso l'app chiede di creare il primo account.** Gli altri si
  aggiungono da Impostazioni. Non esistono password predefinite.

Per lavorare sul codice: `npm run dev`.

## Backup dei dati

Tutti i dati stanno in un solo file: `data/foodcost.db`.

```bash
npm run db:backup
```

Crea una copia con data e ora in `backup/` (es. `foodcost-2026-11-17-21-30.db`).
Si può lanciare con l'app accesa. Consigli:

- farlo ogni giorno in automatico (operazione pianificata / cron);
- copiare la cartella `backup/` **fuori dal computer** (chiavetta, cloud):
  un backup sullo stesso disco non protegge da un guasto.

**Ripristino:** fermare l'app, copiare il file di backup scelto sopra
`data/foodcost.db`, riavviare.

## Password dimenticata

```bash
npm run utente -- nomeutente nuovapassword
```

Crea l'account se non esiste, altrimenti ne cambia la password.

## Dove metterla in funzione

L'app usa SQLite, cioè un file su disco: serve una macchina con **disco
persistente**.

- Va bene: un computer sempre acceso in trattoria, oppure un piccolo server
  online (VPS o servizi con volume persistente).
- Non va bene: Vercel e simili "serverless", dove il disco si azzera.
- Se è raggiungibile da internet va messa dietro HTTPS (reverse proxy).

## Regole di calcolo

| Regola | Come è applicata |
|---|---|
| Costo sul peso netto | costo netto = prezzo ÷ quantità acquistata ÷ resa. Cipolle a 1,20 €/kg con resa 80% → 1,50 €/kg di cipolla pulita |
| Quantità in ricetta | sempre **nette** (prodotto già pulito) |
| Semilavorati | costo unitario = costo del lotto ÷ resa del lotto; utilizzabili dentro altre ricette, anche annidati |
| Food cost % | costo ingredienti (IVA esclusa) ÷ prezzo di vendita **scorporato dell'IVA** |
| Prezzo a menù | è del piatto intero in condivisione, IVA inclusa; le "porzioni" dicono per quante persone basta |
| Prezzo consigliato | costo ÷ food cost obiettivo, poi IVA aggiunta |
| Unità | kg/g, l/ml, pezzi; tra pezzi e peso serve il peso medio del pezzo. Tra volume e peso non c'è conversione |
| Decimali | importi e quantità sono salvati come testo e calcolati con `decimal.js`: mai numeri in virgola mobile. Si arrotonda solo in visualizzazione |
| Cascata | nessun costo è salvato: ogni pagina ricalcola da ingredienti → semilavorati → piatti |
| Riferimenti circolari | bloccati al salvataggio; i semilavorati che creerebbero un giro non compaiono nemmeno tra le scelte |
| Avvisi | quando una variazione porta un piatto in carta da dentro a fuori soglia, compare un avviso sull'ingrediente e in dashboard |

## Test

```bash
npm test
```

I test del motore di calcolo (`tests/engine.test.ts`) usano casi verificabili
a mano: i conti sono scritti nei commenti accanto a ogni caso.

## Struttura

```
prisma/schema.prisma     database (comprese le tabelle della fase 2)
prisma/seed.ts           dati di esempio
src/lib/engine/          motore di calcolo, senza dipendenze dal resto
src/lib/actions.ts       salvataggi, import, avvisi, accesso
src/app/(app)/           schermate
src/app/export/          PDF scheda piatto, listino Excel, modello di import
scripts/                 backup e gestione account
```

## Fase 2 (non costruita)

Il database contiene già le tabelle per il food cost reale, non ancora usate
dall'interfaccia: `Purchase` / `PurchaseLine` (acquisti), `InventoryCount` /
`InventoryLine` (inventario periodico, anche di semilavorati), `DishSale`
(piatti venduti, con prezzo e costo teorico del giorno).

Consumo reale = inventario iniziale + acquisti − inventario finale.
Consumo teorico = Σ piatti venduti × costo teorico.
Scostamento = reale − teorico, in euro.
