import ExcelJS from "exceljs";

export const IMPORT_COLUMNS = [
  "Nome", "Categoria", "Fornitore", "Unità di acquisto", "Quantità confezione",
  "Prezzo (IVA esclusa)", "Resa %", "Peso medio pezzo (g)",
] as const;

export type ImportRow = Record<"nome" | "categoria" | "fornitore" | "unita" | "quantita" | "prezzo" | "resa" | "pesoPezzo", string>;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// Intestazioni riconosciute (senza accenti, spazi e simboli).
const ALIASES: Record<keyof ImportRow, string[]> = {
  nome: ["nome", "ingrediente", "prodotto", "descrizione", "articolo"],
  categoria: ["categoria", "reparto"],
  fornitore: ["fornitore"],
  unita: ["unitadiacquisto", "unita", "um", "unitadimisura"],
  quantita: ["quantitaconfezione", "quantita", "confezione", "qta"],
  prezzo: ["prezzoivaesclusa", "prezzo", "prezzoacquisto", "costo", "prezzounitario"],
  resa: ["resa", "resapercentuale"],
  pesoPezzo: ["pesomediopezzog", "pesomediopezzo", "pesopezzo", "pesomedio"],
};

/** CSV con separatore ; , o tab (rilevato dalla prima riga) e campi tra virgolette. */
export function parseCsv(text: string): string[][] {
  const t = text.replace(/^﻿/, "");
  const first = t.split(/\r?\n/, 1)[0] ?? "";
  const count = (c: string) => first.split(c).length - 1;
  const sep = count(";") >= count(",") && count(";") >= count("\t") ? ";" : count("\t") > count(",") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quoted) {
      if (c === '"' && t[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("result" in v && v.result != null) return cellText(v.result as ExcelJS.CellValue);
    if ("richText" in v) return v.richText.map((r) => r.text).join("");
    if ("text" in v) return String(v.text);
    return "";
  }
  return String(v);
}

export async function parseXlsx(buf: ArrayBuffer): Promise<string[][]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.worksheets[0];
  if (!ws) return [];
  const rows: string[][] = [];
  ws.eachRow((r) => {
    const cells: string[] = [];
    for (let c = 1; c <= ws.columnCount; c++) cells.push(cellText(r.getCell(c).value));
    if (cells.some((c) => c.trim() !== "")) rows.push(cells);
  });
  return rows;
}

/** Abbina le colonne alle intestazioni. Restituisce le righe oppure l'elenco delle colonne mancanti. */
export function mapRows(table: string[][]): { rows: ImportRow[]; missing: string[] } {
  if (table.length === 0) return { rows: [], missing: ["il file è vuoto"] };
  const header = table[0].map(norm);
  const idx = {} as Record<keyof ImportRow, number>;
  for (const key of Object.keys(ALIASES) as (keyof ImportRow)[]) {
    idx[key] = header.findIndex((h) => ALIASES[key].includes(h));
  }
  const missing: string[] = [];
  if (idx.nome < 0) missing.push("Nome");
  if (idx.unita < 0) missing.push("Unità di acquisto");
  if (idx.prezzo < 0) missing.push("Prezzo");
  if (missing.length) return { rows: [], missing };
  const rows = table.slice(1).map((r) => {
    const get = (k: keyof ImportRow) => (idx[k] >= 0 ? (r[idx[k]] ?? "").trim() : "");
    return { nome: get("nome"), categoria: get("categoria"), fornitore: get("fornitore"), unita: get("unita"),
      quantita: get("quantita"), prezzo: get("prezzo"), resa: get("resa"), pesoPezzo: get("pesoPezzo") };
  });
  return { rows, missing: [] };
}

export function normalizeUnit(raw: string): string | null {
  const u = norm(raw);
  if (["kg", "chilo", "chili", "chilogrammo", "chilogrammi"].includes(u)) return "kg";
  if (["g", "gr", "grammo", "grammi"].includes(u)) return "g";
  if (["l", "lt", "litro", "litri"].includes(u)) return "l";
  if (["ml", "millilitro", "millilitri"].includes(u)) return "ml";
  if (["pz", "pezzo", "pezzi", "cad", "nr", "n", "unita"].includes(u)) return "pz";
  return null;
}
