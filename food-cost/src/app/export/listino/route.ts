import ExcelJS from "exceljs";
import Decimal from "decimal.js";
import { requireUser } from "@/lib/auth";
import { loadAll } from "@/lib/data";
import { ingredientUnitCost } from "@/lib/engine/cost";

// Nel foglio Excel i valori sono numeri veri (per poterli sommare e filtrare):
// si arrotonda qui, in uscita, a 4 decimali.
const n = (d: Decimal | null | undefined) => (d == null ? null : Number(d.toFixed(4)));
const EUR = '#,##0.00 "€"';
const PCT = '0.0"%"';

export async function GET() {
  await requireUser();
  const { engine, recipes, ingredients, ingInputs, settings } = await loadAll();
  const wb = new ExcelJS.Workbook();
  const head = (ws: ExcelJS.Worksheet) => { ws.getRow(1).font = { bold: true }; ws.views = [{ state: "frozen", ySplit: 1 }]; };

  const p = wb.addWorksheet("Piatti");
  p.columns = [
    { header: "Piatto", key: "name", width: 34 }, { header: "Categoria", key: "cat", width: 16 },
    { header: "In carta", key: "on", width: 10 }, { header: "Porzioni", key: "por", width: 10 },
    { header: "Prezzo a menù (IVA incl.)", key: "price", width: 22, style: { numFmt: EUR } },
    { header: "Prezzo senza IVA", key: "net", width: 17, style: { numFmt: EUR } },
    { header: "Costo piatto", key: "cost", width: 14, style: { numFmt: EUR } },
    { header: "Costo a porzione", key: "cpp", width: 17, style: { numFmt: EUR } },
    { header: "Food cost %", key: "fc", width: 12, style: { numFmt: PCT } },
    { header: "Margine", key: "margin", width: 12, style: { numFmt: EUR } },
    { header: `Prezzo consigliato (${settings.targetFoodCostPct}%)`, key: "sug", width: 24, style: { numFmt: EUR } },
    { header: "Sopra soglia", key: "over", width: 13 },
  ];
  for (const r of recipes.filter((x) => x.type === "PIATTO")) {
    const m = engine.dishMetrics(r.id);
    const row = p.addRow({
      name: r.name, cat: r.category, on: r.onMenu ? "sì" : "no", por: r.portions,
      price: r.menuPrice ? Number(new Decimal(r.menuPrice).toFixed(2)) : null,
      net: n(m?.netPrice), cost: n(m?.total), cpp: n(m?.costPerPortion), fc: n(m?.foodCostPct),
      margin: n(m?.margin), sug: n(m?.suggestedPrice), over: m ? (m.overTarget ? "SÌ" : "no") : "",
    });
    if (m?.overTarget) row.font = { color: { argb: "FFB42318" }, bold: true };
  }
  head(p);

  const s = wb.addWorksheet("Semilavorati");
  s.columns = [
    { header: "Semilavorato", key: "name", width: 34 }, { header: "Categoria", key: "cat", width: 16 },
    { header: "Resa lotto", key: "qty", width: 12 }, { header: "Unità", key: "unit", width: 8 },
    { header: "Costo lotto", key: "cost", width: 14, style: { numFmt: EUR } },
    { header: "Costo per kg / l / pz", key: "uc", width: 22, style: { numFmt: '#,##0.000 "€"' } },
  ];
  for (const r of recipes.filter((x) => x.type === "SEMILAVORATO")) {
    const rc = engine.recipeCost(r.id);
    let uc: Decimal | null = null;
    try { const u = engine.semiUnitCost(r.id); uc = u.dimension === "pezzi" ? u.costPerBase : u.costPerBase.mul(1000); } catch { /* vuoto */ }
    s.addRow({ name: r.name, cat: r.category, qty: r.batchQty ? Number(r.batchQty) : null, unit: r.batchUnit, cost: rc.ok ? n(rc.total) : null, uc: n(uc) });
  }
  head(s);

  const i = wb.addWorksheet("Ingredienti");
  i.columns = [
    { header: "Ingrediente", key: "name", width: 34 }, { header: "Categoria", key: "cat", width: 18 },
    { header: "Fornitore", key: "sup", width: 22 },
    { header: "Prezzo (IVA escl.)", key: "price", width: 18, style: { numFmt: EUR } },
    { header: "per quantità", key: "qty", width: 13 }, { header: "Unità", key: "unit", width: 8 },
    { header: "Resa %", key: "y", width: 9 },
    { header: "Costo netto per kg / l / pz", key: "uc", width: 26, style: { numFmt: '#,##0.000 "€"' } },
  ];
  for (const ing of ingredients) {
    let uc: Decimal | null = null;
    try { const u = ingredientUnitCost(ingInputs.find((x) => x.id === ing.id)!); uc = u.dimension === "pezzi" ? u.costPerBase : u.costPerBase.mul(1000); } catch { /* vuoto */ }
    i.addRow({ name: ing.name, cat: ing.category, sup: ing.supplier?.name ?? "", price: Number(new Decimal(ing.price).toFixed(4)),
      qty: Number(ing.purchaseQty), unit: ing.purchaseUnit, y: Number(ing.yieldPct), uc: n(uc) });
  }
  head(i);

  const buf = await wb.xlsx.writeBuffer();
  const day = new Date().toISOString().slice(0, 10);
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="listino-food-cost-${day}.xlsx"`,
    },
  });
}
