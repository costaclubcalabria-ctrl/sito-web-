// Dati di esempio: 20 ingredienti, 3 semilavorati, 6 piatti da trattoria calabrese.
// Uso: npm run db:seed   (si rifiuta di partire se ci sono già ingredienti)
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type Ing = [name: string, category: string, supplier: string, price: string, qty: string, unit: string, yieldPct: string, pieceG?: string];
const INGREDIENTS: Ing[] = [
  ["Semola rimacinata di grano duro", "Farine", "Molino Sila", "1.10", "1", "kg", "100"],
  ["Uova", "Latticini e uova", "Azienda agricola Greco", "0.28", "1", "pz", "100", "60"],
  ["Pomodori pelati (latta 2,5 kg)", "Conserve", "Ingrosso Jonio", "4.50", "2.5", "kg", "100"],
  ["Cipolla rossa di Tropea", "Verdure", "Ortofrutta Tropea", "2.40", "1", "kg", "85"],
  ["Aglio", "Verdure", "Ortofrutta Tropea", "6.00", "1", "kg", "80"],
  ["Olio extravergine d'oliva", "Dispensa", "Frantoio Lamezia", "9.50", "1", "l", "100"],
  ["Macinato di maiale", "Carni", "Macelleria Serra", "7.50", "1", "kg", "100"],
  ["'Nduja di Spilinga", "Salumi", "Salumificio Spilinga", "16.00", "1", "kg", "95"],
  ["Pecorino crotonese", "Formaggi", "Caseificio Crotone", "18.00", "1", "kg", "92"],
  ["Pane raffermo", "Dispensa", "Forno del paese", "2.00", "1", "kg", "100"],
  ["Melanzane", "Verdure", "Ortofrutta Tropea", "1.80", "1", "kg", "85"],
  ["Peperoni", "Verdure", "Ortofrutta Tropea", "2.50", "1", "kg", "80"],
  ["Patate della Sila", "Verdure", "Ortofrutta Tropea", "1.20", "1", "kg", "82"],
  ["Baccalà ammollato", "Pesce", "Pescheria Jonio", "14.00", "1", "kg", "85"],
  ["Olive nere", "Conserve", "Ingrosso Jonio", "7.00", "1", "kg", "80"],
  ["Peperoncino fresco", "Verdure", "Ortofrutta Tropea", "9.00", "1", "kg", "90"],
  ["Caciocavallo silano", "Formaggi", "Caseificio Crotone", "15.00", "1", "kg", "95"],
  ["Capocollo di Calabria", "Salumi", "Salumificio Spilinga", "24.00", "1", "kg", "95"],
  ["Basilico", "Verdure", "Ortofrutta Tropea", "12.00", "1", "kg", "70"],
  ["Sale fino", "Dispensa", "Ingrosso Jonio", "0.40", "1", "kg", "100"],
];

type Line = [name: string, quantity: string, unit: string];
type Semi = { name: string; category: string; batchQty: string; batchUnit: string; pieceWeightG?: string; lines: Line[] };
// In ordine: un semilavorato può usare solo quelli che lo precedono.
const SEMIS: Semi[] = [
  { name: "Sugo di pomodoro", category: "Sughi", batchQty: "5", batchUnit: "kg", lines: [
    ["Pomodori pelati (latta 2,5 kg)", "5", "kg"], ["Cipolla rossa di Tropea", "400", "g"], ["Aglio", "30", "g"],
    ["Olio extravergine d'oliva", "150", "ml"], ["Basilico", "40", "g"], ["Sale fino", "40", "g"]] },
  { name: "Pasta fresca (fileja)", category: "Pasta", batchQty: "2", batchUnit: "kg", lines: [
    ["Semola rimacinata di grano duro", "1.4", "kg"], ["Uova", "4", "pz"], ["Sale fino", "20", "g"]] },
  { name: "Polpette di carne al sugo", category: "Secondi", batchQty: "60", batchUnit: "pz", pieceWeightG: "30", lines: [
    ["Macinato di maiale", "1.2", "kg"], ["Pane raffermo", "300", "g"], ["Uova", "3", "pz"], ["Pecorino crotonese", "150", "g"],
    ["Aglio", "10", "g"], ["Sugo di pomodoro", "800", "g"]] },
];

type Dish = { name: string; category: string; portions: number; menuPrice: string; lines: Line[] };
const DISHES: Dish[] = [
  { name: "Fileja alla 'nduja", category: "Primi", portions: 4, menuPrice: "24", lines: [
    ["Pasta fresca (fileja)", "600", "g"], ["Sugo di pomodoro", "500", "g"], ["'Nduja di Spilinga", "80", "g"],
    ["Pecorino crotonese", "50", "g"], ["Olio extravergine d'oliva", "20", "ml"]] },
  { name: "Polpette al sugo", category: "Secondi", portions: 4, menuPrice: "18", lines: [
    ["Polpette di carne al sugo", "16", "pz"], ["Sugo di pomodoro", "300", "g"], ["Basilico", "5", "g"]] },
  { name: "Parmigiana di melanzane", category: "Secondi", portions: 4, menuPrice: "20", lines: [
    ["Melanzane", "800", "g"], ["Sugo di pomodoro", "400", "g"], ["Caciocavallo silano", "120", "g"],
    ["Pecorino crotonese", "40", "g"], ["Olio extravergine d'oliva", "80", "ml"]] },
  { name: "Baccalà con patate e olive", category: "Secondi", portions: 4, menuPrice: "34", lines: [
    ["Baccalà ammollato", "400", "g"], ["Patate della Sila", "600", "g"], ["Olive nere", "80", "g"],
    ["Cipolla rossa di Tropea", "100", "g"], ["Olio extravergine d'oliva", "50", "ml"]] },
  { name: "Peperoni e patate", category: "Contorni", portions: 4, menuPrice: "10", lines: [
    ["Peperoni", "400", "g"], ["Patate della Sila", "500", "g"], ["Cipolla rossa di Tropea", "80", "g"],
    ["Olio extravergine d'oliva", "40", "ml"]] },
  { name: "Tagliere di salumi e formaggi", category: "Antipasti", portions: 4, menuPrice: "22", lines: [
    ["Capocollo di Calabria", "80", "g"], ["'Nduja di Spilinga", "40", "g"], ["Caciocavallo silano", "80", "g"],
    ["Pecorino crotonese", "60", "g"], ["Olive nere", "60", "g"]] },
];

async function main() {
  if ((await db.ingredient.count()) > 0) {
    console.log("Il database contiene già degli ingredienti: dati di esempio NON caricati.");
    return;
  }
  await db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  const ingId = new Map<string, number>();
  for (const [name, category, supplier, price, purchaseQty, purchaseUnit, yieldPct, pieceWeightG] of INGREDIENTS) {
    const s = await db.supplier.upsert({ where: { name: supplier }, update: {}, create: { name: supplier } });
    const i = await db.ingredient.create({
      data: { name, category, supplierId: s.id, price, purchaseQty, purchaseUnit, yieldPct, pieceWeightG: pieceWeightG ?? null,
        priceHistory: { create: { price, purchaseQty, purchaseUnit } } },
    });
    ingId.set(name, i.id);
  }
  const semiId = new Map<string, number>();
  const items = (lines: Line[]) => lines.map(([name, quantity, unit], position) => {
    const ingredientId = ingId.get(name) ?? null;
    const subRecipeId = ingredientId == null ? semiId.get(name) ?? null : null;
    if (ingredientId == null && subRecipeId == null) throw new Error(`Componente sconosciuto: ${name}`);
    return { ingredientId, subRecipeId, quantity, unit, position };
  });
  for (const s of SEMIS) {
    const r = await db.recipe.create({
      data: { type: "SEMILAVORATO", name: s.name, category: s.category, batchQty: s.batchQty, batchUnit: s.batchUnit,
        pieceWeightG: s.pieceWeightG ?? null, items: { create: items(s.lines) } },
    });
    semiId.set(s.name, r.id);
  }
  for (const d of DISHES) {
    await db.recipe.create({
      data: { type: "PIATTO", name: d.name, category: d.category, portions: d.portions, menuPrice: d.menuPrice, onMenu: true,
        items: { create: items(d.lines) } },
    });
  }
  console.log(`Caricati ${INGREDIENTS.length} ingredienti, ${SEMIS.length} semilavorati, ${DISHES.length} piatti.`);
}

main().finally(() => db.$disconnect());
