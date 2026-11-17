import Decimal from "decimal.js";

// Precisione ampia: si arrotonda solo in visualizzazione.
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export const UNITS = ["kg", "g", "l", "ml", "pz"] as const;
export type Unit = (typeof UNITS)[number];
export type Dimension = "peso" | "volume" | "pezzi";

export const UNIT_LABEL: Record<Unit, string> = { kg: "kg", g: "g", l: "l", ml: "ml", pz: "pz" };

export class UnitError extends Error {}

export function isUnit(u: string): u is Unit {
  return (UNITS as readonly string[]).includes(u);
}

export function dimensionOf(unit: Unit): Dimension {
  if (unit === "kg" || unit === "g") return "peso";
  if (unit === "l" || unit === "ml") return "volume";
  return "pezzi";
}

/** Unità base di ogni grandezza: grammi, millilitri, pezzi. */
export function baseUnit(dim: Dimension): Unit {
  return dim === "peso" ? "g" : dim === "volume" ? "ml" : "pz";
}

/** Converte nell'unità base della stessa grandezza (kg -> g, l -> ml). */
export function toBase(qty: Decimal.Value, unit: Unit): Decimal {
  const q = new Decimal(qty);
  return unit === "kg" || unit === "l" ? q.mul(1000) : q;
}

/**
 * Converte una quantità nell'unità base di `target`.
 * Tra peso e pezzi serve il peso medio di un pezzo (in grammi).
 * Tra volume e le altre grandezze non c'è conversione.
 */
export function convert(
  qty: Decimal.Value,
  unit: Unit,
  target: Dimension,
  pieceWeightG?: Decimal.Value | null,
): Decimal {
  const from = dimensionOf(unit);
  const base = toBase(qty, unit);
  if (from === target) return base;
  const hasPw = pieceWeightG != null && pieceWeightG !== "" && new Decimal(pieceWeightG).gt(0);
  if (from === "pezzi" && target === "peso") {
    if (!hasPw) throw new UnitError("manca il peso medio di un pezzo per convertire i pezzi in peso");
    return base.mul(pieceWeightG!);
  }
  if (from === "peso" && target === "pezzi") {
    if (!hasPw) throw new UnitError("manca il peso medio di un pezzo per convertire il peso in pezzi");
    return base.div(pieceWeightG!);
  }
  throw new UnitError(`non si può convertire ${unit} in ${baseUnit(target)}`);
}

/** Unità utilizzabili in ricetta per un componente con questa grandezza. */
export function allowedUnits(dim: Dimension, hasPieceWeight: boolean): Unit[] {
  if (dim === "volume") return ["ml", "l"];
  if (hasPieceWeight) return ["g", "kg", "pz"];
  return dim === "peso" ? ["g", "kg"] : ["pz"];
}
