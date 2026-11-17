import { cache } from "react";
import { db } from "./db";
import { Engine, type IngredientInput, type RecipeInput, type SettingsInput } from "./engine/cost";
import { isUnit, type Unit } from "./engine/units";

export async function getSettings(): Promise<SettingsInput> {
  const s = await db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  return { targetFoodCostPct: s.targetFoodCostPct, vatPct: s.vatPct, targetReceipt: s.targetReceipt };
}

const unit = (u: string | null): Unit => (u && isUnit(u) ? u : "g");

/** Carica tutto e costruisce il motore: ogni lettura ricalcola a cascata dai prezzi correnti. */
export async function loadAll() {
  const [ingredients, recipes, settings] = await Promise.all([
    db.ingredient.findMany({ include: { supplier: true }, orderBy: { name: "asc" } }),
    db.recipe.findMany({ include: { items: { orderBy: { position: "asc" } } }, orderBy: { name: "asc" } }),
    getSettings(),
  ]);
  const ingInputs: IngredientInput[] = ingredients.map((i) => ({
    id: i.id, name: i.name, purchaseQty: i.purchaseQty, purchaseUnit: unit(i.purchaseUnit),
    price: i.price, yieldPct: i.yieldPct, pieceWeightG: i.pieceWeightG,
  }));
  const recInputs: RecipeInput[] = recipes.map((r) => ({
    id: r.id, type: r.type as RecipeInput["type"], name: r.name, category: r.category,
    batchQty: r.batchQty, batchUnit: r.batchUnit ? unit(r.batchUnit) : null, pieceWeightG: r.pieceWeightG,
    portions: r.portions, menuPrice: r.menuPrice, onMenu: r.onMenu,
    items: r.items.map((it) => ({ ingredientId: it.ingredientId, subRecipeId: it.subRecipeId, quantity: it.quantity, unit: unit(it.unit) })),
  }));
  return { ingredients, recipes, settings, ingInputs, recInputs, engine: new Engine(ingInputs, recInputs, settings) };
}

/** Versione condivisa all'interno della stessa richiesta. */
export const getAll = cache(loadAll);
