import Decimal from "decimal.js";

// L'arrotondamento avviene SOLO qui, in visualizzazione.

function it(fixed: string): string {
  const [int, dec] = fixed.split(".");
  const neg = int.startsWith("-");
  const digits = neg ? int.slice(1) : int;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "−" : "") + grouped + (dec ? "," + dec : "");
}

export function euro(v: Decimal.Value | null | undefined, decimals = 2): string {
  if (v == null || v === "") return "—";
  return it(new Decimal(v).toFixed(decimals)) + " €";
}

export function pct(v: Decimal.Value | null | undefined, decimals = 1): string {
  if (v == null || v === "") return "—";
  return it(new Decimal(v).toFixed(decimals)) + " %";
}

/** Numero senza zeri finali inutili: "2.500" -> "2,5". */
export function num(v: Decimal.Value | null | undefined, maxDecimals = 3): string {
  if (v == null || v === "") return "—";
  const d = new Decimal(v).toDecimalPlaces(maxDecimals);
  return it(d.toFixed());
}

/** Valore per un campo di input: punto -> virgola. */
export function inputValue(v: string | null | undefined): string {
  return v == null ? "" : v.replace(".", ",");
}

/**
 * Legge un numero scritto all'italiana ("1.250,50", "12,5", "12.5")
 * e lo restituisce come testo decimale canonico, oppure null se non valido.
 */
export function parseDecimal(raw: unknown): string | null {
  if (raw == null) return null;
  let s = String(raw).trim().replace(/[€%\s]/g, "");
  if (s === "") return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return new Decimal(s).toFixed();
}

export function dateIt(d: Date): string {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Rome" });
}
