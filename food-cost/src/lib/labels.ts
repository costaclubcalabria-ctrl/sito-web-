import Decimal from "decimal.js";
import { ingredientUnitCost, wouldCreateCycle, type IngredientInput, type UnitCost } from "./engine/cost";
import { allowedUnits, baseUnit, type Dimension, type Unit } from "./engine/units";
import { euro } from "./format";
import type { loadAll } from "./data";

/** Costo unitario in forma leggibile: al kg, al litro o al pezzo. */
export function unitCostLabel(uc: UnitCost): string {
  const b = baseUnit(uc.dimension);
  return b === "pz" ? `${euro(uc.costPerBase, 3)}/pz` : `${euro(uc.costPerBase.mul(1000))}/${b === "g" ? "kg" : "l"}`;
}

export function netCostLabel(i: IngredientInput): string {
  try { return unitCostLabel(ingredientUnitCost(i)); } catch { return "—"; }
}

export type ComponentOption = {
  ref: string; // "i12" ingrediente, "r5" semilavorato
  name: string;
  kind: "ingrediente" | "semilavorato";
  dimension: Dimension;
  pieceWeightG: string | null;
  costPerBase: string | null;
  units: Unit[];
};

/** Componenti selezionabili in una ricetta. Esclude i semilavorati che creerebbero un giro. */
export function componentOptions(all: Awaited<ReturnType<typeof loadAll>>, editingId: number | null): ComponentOption[] {
  const out: ComponentOption[] = [];
  const opt = (ref: string, name: string, kind: ComponentOption["kind"], uc: UnitCost | null, fallback: Dimension, pw: string | null): ComponentOption => {
    const dimension = uc?.dimension ?? fallback;
    const hasPw = pw != null && new Decimal(pw).gt(0);
    return { ref, name, kind, dimension, pieceWeightG: pw, costPerBase: uc ? uc.costPerBase.toFixed() : null, units: allowedUnits(dimension, hasPw) };
  };
  for (const i of all.ingInputs) {
    let uc: UnitCost | null = null;
    try { uc = ingredientUnitCost(i); } catch { /* resta senza costo */ }
    out.push(opt(`i${i.id}`, i.name, "ingrediente", uc, "peso", i.pieceWeightG));
  }
  const graph = new Map(all.recInputs.map((r) => [r.id, r.items.flatMap((x) => (x.subRecipeId != null ? [x.subRecipeId] : []))]));
  for (const r of all.recInputs) {
    if (r.type !== "SEMILAVORATO") continue;
    if (editingId != null && wouldCreateCycle(editingId, [r.id], graph)) continue;
    let uc: UnitCost | null = null;
    try { uc = all.engine.semiUnitCost(r.id); } catch { /* resta senza costo */ }
    out.push(opt(`r${r.id}`, r.name, "semilavorato", uc, "peso", r.pieceWeightG));
  }
  return out;
}
