import { describe, expect, it } from "vitest";
import Decimal from "decimal.js";
import {
  Engine, dishMetrics, ingredientUnitCost, netOfVat, newlyOverTarget, simulateTable, wouldCreateCycle,
  type IngredientInput, type RecipeInput,
} from "@/lib/engine/cost";
import { convert, UnitError } from "@/lib/engine/units";
import { parseDecimal, euro, pct } from "@/lib/format";

// Tutti i casi sono verificabili a mano: i conti sono scritti nei commenti.

const S = { targetFoodCostPct: "30", vatPct: "10", targetReceipt: "35" };
const eq = (d: Decimal | null | undefined, expected: string) => expect(d?.toFixed()).toBe(new Decimal(expected).toFixed());

const ing = (p: Partial<IngredientInput> & { id: number }): IngredientInput => ({
  name: "ing" + p.id, purchaseQty: "1", purchaseUnit: "kg", price: "1", yieldPct: "100", pieceWeightG: null, ...p,
});
const rec = (p: Partial<RecipeInput> & { id: number }): RecipeInput => ({
  type: "PIATTO", name: "r" + p.id, category: "", batchQty: null, batchUnit: null, pieceWeightG: null,
  portions: 1, menuPrice: null, onMenu: true, items: [], ...p,
});

describe("conversioni di unità", () => {
  it("kg <-> g e l <-> ml", () => {
    eq(convert("1.5", "kg", "peso"), "1500");
    eq(convert("250", "g", "peso"), "250");
    eq(convert("0.75", "l", "volume"), "750");
  });
  it("pezzi <-> peso con il peso medio", () => {
    eq(convert("3", "pz", "peso", "60"), "180"); // 3 uova da 60 g = 180 g
    eq(convert("300", "g", "pezzi", "60"), "5"); // 300 g / 60 g = 5 pezzi
  });
  it("rifiuta le conversioni impossibili", () => {
    expect(() => convert("1", "pz", "peso")).toThrow(UnitError); // manca il peso medio
    expect(() => convert("1", "l", "peso")).toThrow(UnitError); // volume -> peso
  });
});

describe("resa", () => {
  it("costo sul peso netto: 1,20 €/kg con resa 80% = 1,50 €/kg netto", () => {
    const uc = ingredientUnitCost(ing({ id: 1, price: "1.20", yieldPct: "80" }));
    eq(uc.costPerBase.mul(1000), "1.5");
  });
  it("confezione: latta da 2,5 kg a 6 € = 2,40 €/kg", () => {
    const uc = ingredientUnitCost(ing({ id: 1, price: "6", purchaseQty: "2.5" }));
    eq(uc.costPerBase.mul(1000), "2.4");
  });
  it("200 g netti di cipolla (1,20 €/kg, resa 80%) costano 0,30 €", () => {
    const e = new Engine([ing({ id: 1, price: "1.20", yieldPct: "80" })],
      [rec({ id: 1, items: [{ ingredientId: 1, subRecipeId: null, quantity: "200", unit: "g" }] })], S);
    const rc = e.recipeCost(1);
    expect(rc.ok).toBe(true);
    if (rc.ok) eq(rc.total, "0.3");
  });
  it("resa non valida segnalata come errore, senza far saltare tutto", () => {
    const e = new Engine([ing({ id: 1, yieldPct: "0" })],
      [rec({ id: 1, items: [{ ingredientId: 1, subRecipeId: null, quantity: "1", unit: "kg" }] })], S);
    expect(e.recipeCost(1).ok).toBe(false);
  });
});

describe("scorporo IVA e scheda piatto", () => {
  it("11,00 € IVA inclusa = 10,00 € IVA esclusa", () => eq(netOfVat("11", "10"), "10"));
  it("piatto da 22 € a menù con costo 6 €, 4 porzioni", () => {
    // netto 22 / 1,10 = 20 ; food cost 6/20 = 30% ; margine 14 ; a porzione 1,50 e 3,50
    // prezzo consigliato al 30%: 6 / 0,30 = 20 netto -> 22 a menù
    const m = dishMetrics("6", "22", 4, S);
    eq(m.netPrice, "20");
    eq(m.foodCostPct, "30");
    eq(m.margin, "14");
    eq(m.costPerPortion, "1.5");
    eq(m.marginPerPortion, "3.5");
    eq(m.suggestedPrice, "22");
    expect(m.overTarget).toBe(false); // 30% non supera la soglia del 30%
  });
  it("sopra soglia: costo 6,60 € su 22 € a menù = 33%", () => {
    // prezzo consigliato: 6,60 / 0,30 = 22 netto -> 24,20 a menù
    const m = dishMetrics("6.6", "22", 4, S);
    eq(m.foodCostPct, "33");
    eq(m.suggestedPrice, "24.2");
    expect(m.overTarget).toBe(true);
  });
  it("il food cost usa il prezzo scorporato, non quello a menù", () => {
    const m = dishMetrics("3", "11", 1, S); // 3 / 10 = 30%, non 3 / 11 = 27,3%
    eq(m.foodCostPct, "30");
  });
});

describe("semilavorati", () => {
  // Sugo: 2 kg di pomodoro a 1,50 €/kg (3,00 €) + 100 g di cipolla netta a 1,50 €/kg netto (0,15 €)
  //       = 3,15 € per un lotto da 1,5 kg -> 2,10 €/kg
  const ingredients = [
    ing({ id: 1, name: "Pomodoro", price: "1.50" }),
    ing({ id: 2, name: "Cipolla", price: "1.20", yieldPct: "80" }),
    ing({ id: 3, name: "Carne", price: "8" }),
    ing({ id: 4, name: "Pasta", price: "2" }),
  ];
  const sugo = rec({ id: 10, type: "SEMILAVORATO", name: "Sugo", batchQty: "1.5", batchUnit: "kg", items: [
    { ingredientId: 1, subRecipeId: null, quantity: "2", unit: "kg" },
    { ingredientId: 2, subRecipeId: null, quantity: "100", unit: "g" },
  ] });
  // Polpette al sugo: 1 kg di carne (8,00 €) + 500 g di sugo (1,05 €) = 9,05 €
  //                   lotto da 40 pezzi da 30 g -> 0,22625 € a polpetta
  const polpette = rec({ id: 11, type: "SEMILAVORATO", name: "Polpette al sugo", batchQty: "40", batchUnit: "pz",
    pieceWeightG: "30", items: [
      { ingredientId: 3, subRecipeId: null, quantity: "1", unit: "kg" },
      { ingredientId: null, subRecipeId: 10, quantity: "500", unit: "g" },
    ] });
  // Piatto: 8 polpette (1,81 €) + 200 g di pasta (0,40 €) + 100 g di sugo (0,21 €) = 2,42 €
  const piatto = rec({ id: 20, name: "Pasta e polpette", portions: 2, menuPrice: "11", items: [
    { ingredientId: null, subRecipeId: 11, quantity: "8", unit: "pz" },
    { ingredientId: 4, subRecipeId: null, quantity: "200", unit: "g" },
    { ingredientId: null, subRecipeId: 10, quantity: "100", unit: "g" },
  ] });
  const e = new Engine(ingredients, [sugo, polpette, piatto], S);

  it("costo del lotto e costo al kg", () => {
    const rc = e.recipeCost(10);
    expect(rc.ok).toBe(true);
    if (rc.ok) eq(rc.total, "3.15");
    eq(e.semiUnitCost(10).costPerBase.mul(1000), "2.1");
  });
  it("semilavorato annidato dentro un altro semilavorato", () => {
    const rc = e.recipeCost(11);
    if (rc.ok) eq(rc.total, "9.05");
    eq(e.semiUnitCost(11).costPerBase, "0.22625");
  });
  it("piatto con due livelli di semilavorati", () => {
    const rc = e.recipeCost(20);
    expect(rc.ok).toBe(true);
    if (rc.ok) eq(rc.total, "2.42");
    const m = e.dishMetrics(20)!; // netto 10 ; 2,42 / 10 = 24,2% ; margine 7,58
    eq(m.foodCostPct, "24.2");
    eq(m.margin, "7.58");
    eq(m.costPerPortion, "1.21");
  });
  it("semilavorato a pezzi usato a peso: 240 g di polpette = 8 pezzi", () => {
    const e2 = new Engine(ingredients, [sugo, polpette, rec({ id: 21, items: [
      { ingredientId: null, subRecipeId: 11, quantity: "240", unit: "g" }] })], S);
    const rc = e2.recipeCost(21);
    if (rc.ok) eq(rc.total, "1.81");
  });
  it("scomposizione negli ingredienti di base: la somma torna al costo del piatto", () => {
    const raw = e.rawBreakdown(20);
    const sum = [...raw.values()].reduce((s, v) => s.plus(v), new Decimal(0));
    eq(sum, "2.42");
    eq(raw.get(4), "0.4"); // pasta
    eq(raw.get(3), "1.6"); // carne: 8 € × 8/40
    expect(e.topIngredients([20])[0].name).toBe("Carne");
  });
  it("ricalcolo a cascata: il pomodoro raddoppia e sale tutto", () => {
    // Sugo: 6,15 € -> 4,10 €/kg ; polpette: 8 + 2,05 = 10,05 -> 0,25125 €/pz
    // Piatto: 8 × 0,25125 (2,01) + 0,40 + 0,41 = 2,82 €
    const e2 = new Engine(ingredients.map((i) => (i.id === 1 ? { ...i, price: "3" } : i)), [sugo, polpette, piatto], S);
    const rc = e2.recipeCost(20);
    if (rc.ok) eq(rc.total, "2.82");
  });
});

describe("riferimenti circolari", () => {
  it("blocca A -> B -> A e A -> A", () => {
    const graph = new Map([[1, [2]], [2, [3]], [3, []]]);
    expect(wouldCreateCycle(3, [1], graph)).toBe(true); // 3 userebbe 1, che arriva a 3
    expect(wouldCreateCycle(1, [1], graph)).toBe(true);
    expect(wouldCreateCycle(1, [3], graph)).toBe(false);
  });
  it("un giro già presente nei dati dà errore invece di bloccarsi", () => {
    const a = rec({ id: 1, type: "SEMILAVORATO", batchQty: "1", batchUnit: "kg", items: [{ ingredientId: null, subRecipeId: 2, quantity: "1", unit: "kg" }] });
    const b = rec({ id: 2, type: "SEMILAVORATO", batchQty: "1", batchUnit: "kg", items: [{ ingredientId: null, subRecipeId: 1, quantity: "1", unit: "kg" }] });
    const e = new Engine([], [a, b], S);
    expect(e.recipeCost(1).ok).toBe(false);
    expect(e.recipeCost(2).ok).toBe(false);
  });
});

describe("avvisi di sforamento", () => {
  it("segnala solo i piatti che passano da dentro a fuori soglia", () => {
    const before = new Map([[1, new Decimal(28)], [2, new Decimal(35)], [3, new Decimal(20)]]);
    const after = new Map([[1, new Decimal(31)], [2, new Decimal(38)], [3, new Decimal(22)]]);
    const out = newlyOverTarget(before, after, "30");
    expect(out.map((o) => o.recipeId)).toEqual([1]);
  });
});

describe("simulatore tavolo", () => {
  it("tavolo da 4: due piatti", () => {
    // Incasso 2×22 + 1×33 = 77 € -> netto 70 ; costo 2×6 + 9 = 21 -> food cost 30%
    // Per coperto: 19,25 € di incasso (15,75 sotto i 35), 5,25 € di costo
    const r = simulateTable([
      { cost: "6", menuPrice: "22", portions: 4, count: 2 },
      { cost: "9", menuPrice: "33", portions: 4, count: 1 },
    ], 4, S);
    eq(r.gross, "77");
    eq(r.net, "70");
    eq(r.cost, "21");
    eq(r.foodCostPct, "30");
    eq(r.grossPerCover, "19.25");
    eq(r.costPerCover, "5.25");
    eq(r.diffFromTarget, "-15.75");
    expect(r.portions).toBe(12);
  });
});

describe("decimali esatti e formati", () => {
  it("0,1 + 0,2 = 0,3 (con i float non torna)", () => {
    const e = new Engine([ing({ id: 1, price: "0.1", purchaseUnit: "pz" }), ing({ id: 2, price: "0.2", purchaseUnit: "pz" })],
      [rec({ id: 1, items: [
        { ingredientId: 1, subRecipeId: null, quantity: "1", unit: "pz" },
        { ingredientId: 2, subRecipeId: null, quantity: "1", unit: "pz" }] })], S);
    const rc = e.recipeCost(1);
    if (rc.ok) expect(rc.total.toFixed()).toBe("0.3");
  });
  it("lettura dei numeri all'italiana", () => {
    expect(parseDecimal("12,5")).toBe("12.5");
    expect(parseDecimal("1.250,50")).toBe("1250.5");
    expect(parseDecimal("12.5")).toBe("12.5");
    expect(parseDecimal("€ 3,20")).toBe("3.2");
    expect(parseDecimal("abc")).toBeNull();
    expect(parseDecimal("")).toBeNull();
  });
  it("arrotondamento solo in visualizzazione", () => {
    expect(euro("1234.565")).toBe("1.234,57 €");
    expect(pct("24.25")).toBe("24,3 %");
  });
});

import { mapRows, normalizeUnit, parseCsv } from "@/lib/import";

describe("import", () => {
  it("CSV italiano con ; e virgola decimale", () => {
    const t = parseCsv('Nome;Unità di acquisto;Prezzo (IVA esclusa);Resa %\n"Cipolla rossa; Tropea";kg;2,40;85\n');
    const { rows, missing } = mapRows(t);
    expect(missing).toEqual([]);
    expect(rows[0].nome).toBe("Cipolla rossa; Tropea");
    expect(rows[0].prezzo).toBe("2,40");
    expect(rows[0].resa).toBe("85");
  });
  it("segnala le colonne obbligatorie mancanti", () => {
    expect(mapRows(parseCsv("Nome,Categoria\nA,B")).missing).toEqual(["Unità di acquisto", "Prezzo"]);
  });
  it("riconosce le unità scritte in vari modi", () => {
    expect(normalizeUnit("Kg")).toBe("kg");
    expect(normalizeUnit("litri")).toBe("l");
    expect(normalizeUnit("pezzo")).toBe("pz");
    expect(normalizeUnit("cassa")).toBeNull();
  });
});
