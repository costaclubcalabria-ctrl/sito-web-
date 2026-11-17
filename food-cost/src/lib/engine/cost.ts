import Decimal from "decimal.js";
import { convert, dimensionOf, toBase, UnitError, type Dimension, type Unit } from "./units";

// ─────────────────────────── Dati in ingresso ───────────────────────────
// Tutti i numeri arrivano come testo decimale ("12.50"): mai float.

export type IngredientInput = {
  id: number;
  name: string;
  purchaseQty: string;
  purchaseUnit: Unit;
  price: string; // € IVA esclusa per purchaseQty purchaseUnit
  yieldPct: string; // resa %
  pieceWeightG: string | null;
};

export type RecipeItemInput = {
  ingredientId: number | null;
  subRecipeId: number | null;
  quantity: string; // quantità NETTA
  unit: Unit;
};

export type RecipeInput = {
  id: number;
  type: "SEMILAVORATO" | "PIATTO";
  name: string;
  category: string;
  batchQty: string | null;
  batchUnit: Unit | null;
  pieceWeightG: string | null;
  portions: number | null;
  menuPrice: string | null; // IVA inclusa
  onMenu: boolean;
  items: RecipeItemInput[];
};

export type SettingsInput = { targetFoodCostPct: string; vatPct: string; targetReceipt: string };

// ─────────────────────────────── Risultati ───────────────────────────────

export type UnitCost = { dimension: Dimension; costPerBase: Decimal; pieceWeightG: string | null };

export type LineCost = {
  kind: "ingrediente" | "semilavorato";
  refId: number;
  name: string;
  quantity: string;
  unit: Unit;
  cost: Decimal;
  sharePct: Decimal; // peso della riga sul costo totale
};

export type RecipeCost =
  | { ok: true; id: number; total: Decimal; lines: LineCost[] }
  | { ok: false; id: number; error: string };

export type DishMetrics = {
  total: Decimal; // costo del piatto intero
  costPerPortion: Decimal;
  netPrice: Decimal; // prezzo a menù scorporato dell'IVA
  foodCostPct: Decimal;
  margin: Decimal; // € sul piatto intero, IVA esclusa
  marginPerPortion: Decimal;
  suggestedPrice: Decimal; // prezzo a menù (IVA inclusa) per stare nel target
  overTarget: boolean;
};

const HUNDRED = new Decimal(100);

/** Prezzo IVA inclusa -> IVA esclusa. */
export function netOfVat(gross: Decimal.Value, vatPct: Decimal.Value): Decimal {
  return new Decimal(gross).div(new Decimal(1).plus(new Decimal(vatPct).div(HUNDRED)));
}

/** Prezzo IVA esclusa -> IVA inclusa. */
export function withVat(net: Decimal.Value, vatPct: Decimal.Value): Decimal {
  return new Decimal(net).mul(new Decimal(1).plus(new Decimal(vatPct).div(HUNDRED)));
}

/**
 * Costo di un ingrediente per unità base (g, ml o pz) di prodotto NETTO.
 * costo netto = prezzo / quantità acquistata / resa
 * Es. cipolle 1,20 €/kg con resa 80% -> 1,50 €/kg di cipolla pulita.
 */
export function ingredientUnitCost(ing: IngredientInput): UnitCost {
  const qty = toBase(ing.purchaseQty, ing.purchaseUnit);
  const y = new Decimal(ing.yieldPct);
  if (qty.lte(0)) throw new UnitError("quantità di acquisto non valida");
  if (y.lte(0) || y.gt(100)) throw new UnitError("resa non valida (deve essere tra 1 e 100)");
  return {
    dimension: dimensionOf(ing.purchaseUnit),
    costPerBase: new Decimal(ing.price).div(qty).div(y.div(HUNDRED)),
    pieceWeightG: ing.pieceWeightG,
  };
}

export class Engine {
  private ingredients = new Map<number, IngredientInput>();
  private recipes = new Map<number, RecipeInput>();
  private memo = new Map<number, RecipeCost>();
  private stack: number[] = [];

  constructor(ingredients: IngredientInput[], recipes: RecipeInput[], readonly settings: SettingsInput) {
    for (const i of ingredients) this.ingredients.set(i.id, i);
    for (const r of recipes) this.recipes.set(r.id, r);
  }

  /** Costo totale di una ricetta, sommando ingredienti e semilavorati (anche annidati). */
  recipeCost(id: number): RecipeCost {
    const cached = this.memo.get(id);
    if (cached) return cached;
    const recipe = this.recipes.get(id);
    if (!recipe) return { ok: false, id, error: "ricetta non trovata" };
    if (this.stack.includes(id)) {
      // Non si memorizza: l'errore riguarda il giro in corso.
      return { ok: false, id, error: `riferimento circolare su "${recipe.name}"` };
    }
    this.stack.push(id);
    let result: RecipeCost;
    try {
      const partial: Omit<LineCost, "sharePct">[] = [];
      for (const item of recipe.items) {
        if (item.ingredientId != null) {
          const ing = this.ingredients.get(item.ingredientId);
          if (!ing) throw new UnitError("ingrediente non trovato");
          let cost: Decimal;
          try {
            const uc = ingredientUnitCost(ing);
            cost = convert(item.quantity, item.unit, uc.dimension, uc.pieceWeightG).mul(uc.costPerBase);
          } catch (e) {
            throw new UnitError(`${ing.name}: ${(e as Error).message}`);
          }
          partial.push({ kind: "ingrediente", refId: ing.id, name: ing.name, quantity: item.quantity, unit: item.unit, cost });
        } else if (item.subRecipeId != null) {
          const sub = this.recipes.get(item.subRecipeId);
          if (!sub) throw new UnitError("semilavorato non trovato");
          const uc = this.semiUnitCost(sub.id);
          let cost: Decimal;
          try {
            cost = convert(item.quantity, item.unit, uc.dimension, uc.pieceWeightG).mul(uc.costPerBase);
          } catch (e) {
            throw new UnitError(`${sub.name}: ${(e as Error).message}`);
          }
          partial.push({ kind: "semilavorato", refId: sub.id, name: sub.name, quantity: item.quantity, unit: item.unit, cost });
        }
      }
      const total = partial.reduce((s, l) => s.plus(l.cost), new Decimal(0));
      const lines = partial.map((l) => ({ ...l, sharePct: total.gt(0) ? l.cost.div(total).mul(HUNDRED) : new Decimal(0) }));
      result = { ok: true, id, total, lines };
    } catch (e) {
      result = { ok: false, id, error: (e as Error).message };
    }
    this.stack.pop();
    this.memo.set(id, result);
    return result;
  }

  /** Costo di un semilavorato per unità base del lotto (g, ml o pz). */
  semiUnitCost(id: number): UnitCost {
    const sub = this.recipes.get(id);
    if (!sub) throw new UnitError("semilavorato non trovato");
    if (!sub.batchQty || !sub.batchUnit) throw new UnitError(`"${sub.name}" non ha la resa del lotto`);
    const batch = toBase(sub.batchQty, sub.batchUnit);
    if (batch.lte(0)) throw new UnitError(`"${sub.name}" ha una resa del lotto non valida`);
    const rc = this.recipeCost(id);
    if (!rc.ok) throw new UnitError(rc.error);
    return { dimension: dimensionOf(sub.batchUnit), costPerBase: rc.total.div(batch), pieceWeightG: sub.pieceWeightG };
  }

  /** Numeri della scheda piatto. `null` se la ricetta ha errori o manca il prezzo. */
  dishMetrics(id: number): DishMetrics | null {
    const r = this.recipes.get(id);
    const rc = this.recipeCost(id);
    if (!r || !rc.ok || r.type !== "PIATTO") return null;
    if (!r.menuPrice || new Decimal(r.menuPrice).lte(0)) return null;
    return dishMetrics(rc.total, r.menuPrice, r.portions ?? 1, this.settings);
  }

  /**
   * Scompone una ricetta nei soli ingredienti di base (aprendo i semilavorati):
   * ingrediente -> costo che genera in questa ricetta.
   */
  rawBreakdown(id: number): Map<number, Decimal> {
    const out = new Map<number, Decimal>();
    const rc = this.recipeCost(id);
    if (!rc.ok) return out;
    for (const line of rc.lines) {
      if (line.kind === "ingrediente") {
        out.set(line.refId, (out.get(line.refId) ?? new Decimal(0)).plus(line.cost));
      } else {
        const sub = this.recipeCost(line.refId);
        if (!sub.ok || sub.total.lte(0)) continue;
        const factor = line.cost.div(sub.total);
        for (const [ingId, c] of this.rawBreakdown(line.refId)) {
          out.set(ingId, (out.get(ingId) ?? new Decimal(0)).plus(c.mul(factor)));
        }
      }
    }
    return out;
  }

  /** Ingredienti che pesano di più: somma dei costi su una preparazione di ogni piatto indicato. */
  topIngredients(dishIds: number[]): { ingredientId: number; name: string; cost: Decimal; sharePct: Decimal; dishes: number }[] {
    const sum = new Map<number, { cost: Decimal; dishes: number }>();
    for (const id of dishIds) {
      for (const [ingId, c] of this.rawBreakdown(id)) {
        const cur = sum.get(ingId) ?? { cost: new Decimal(0), dishes: 0 };
        sum.set(ingId, { cost: cur.cost.plus(c), dishes: cur.dishes + 1 });
      }
    }
    const grand = [...sum.values()].reduce((s, v) => s.plus(v.cost), new Decimal(0));
    return [...sum.entries()]
      .map(([ingredientId, v]) => ({
        ingredientId,
        name: this.ingredients.get(ingredientId)?.name ?? "?",
        cost: v.cost,
        sharePct: grand.gt(0) ? v.cost.div(grand).mul(HUNDRED) : new Decimal(0),
        dishes: v.dishes,
      }))
      .sort((a, b) => b.cost.cmp(a.cost));
  }
}

export function dishMetrics(
  total: Decimal.Value,
  menuPriceGross: Decimal.Value,
  portions: number,
  s: SettingsInput,
): DishMetrics {
  const cost = new Decimal(total);
  const p = Math.max(1, portions);
  const netPrice = netOfVat(menuPriceGross, s.vatPct);
  const foodCostPct = cost.div(netPrice).mul(HUNDRED);
  const margin = netPrice.minus(cost);
  const target = new Decimal(s.targetFoodCostPct);
  return {
    total: cost,
    costPerPortion: cost.div(p),
    netPrice,
    foodCostPct,
    margin,
    marginPerPortion: margin.div(p),
    suggestedPrice: withVat(cost.div(target.div(HUNDRED)), s.vatPct),
    overTarget: foodCostPct.gt(target),
  };
}

/**
 * Vero se usare `subIds` dentro la ricetta `recipeId` creerebbe un giro
 * (la ricetta finirebbe, direttamente o no, per contenere se stessa).
 */
export function wouldCreateCycle(
  recipeId: number,
  subIds: number[],
  graph: Map<number, number[]>, // ricetta -> semilavorati che usa
): boolean {
  const seen = new Set<number>();
  const todo = [...subIds];
  while (todo.length) {
    const cur = todo.pop()!;
    if (cur === recipeId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    todo.push(...(graph.get(cur) ?? []));
  }
  return false;
}

/** Piatti che una variazione porta SOPRA la soglia (prima erano dentro). */
export function newlyOverTarget(
  before: Map<number, Decimal>,
  after: Map<number, Decimal>,
  targetPct: Decimal.Value,
): { recipeId: number; oldPct: Decimal; newPct: Decimal }[] {
  const t = new Decimal(targetPct);
  const out: { recipeId: number; oldPct: Decimal; newPct: Decimal }[] = [];
  for (const [id, newPct] of after) {
    const oldPct = before.get(id);
    if (oldPct && oldPct.lte(t) && newPct.gt(t)) out.push({ recipeId: id, oldPct, newPct });
  }
  return out;
}

// ─────────────────────────── Simulatore tavolo ───────────────────────────

export type TableLine = { cost: Decimal.Value; menuPrice: Decimal.Value; portions: number; count: number };

export function simulateTable(lines: TableLine[], people: number, s: SettingsInput) {
  const n = Math.max(1, people);
  let cost = new Decimal(0);
  let gross = new Decimal(0);
  let portions = 0;
  for (const l of lines) {
    cost = cost.plus(new Decimal(l.cost).mul(l.count));
    gross = gross.plus(new Decimal(l.menuPrice).mul(l.count));
    portions += l.portions * l.count;
  }
  const net = netOfVat(gross, s.vatPct);
  const target = new Decimal(s.targetReceipt);
  const grossPerCover = gross.div(n);
  return {
    cost,
    gross,
    net,
    margin: net.minus(cost),
    foodCostPct: net.gt(0) ? cost.div(net).mul(HUNDRED) : null,
    costPerCover: cost.div(n),
    grossPerCover,
    netPerCover: net.div(n),
    marginPerCover: net.minus(cost).div(n),
    diffFromTarget: grossPerCover.minus(target), // + sopra / − sotto lo scontrino obiettivo
    portions,
  };
}
