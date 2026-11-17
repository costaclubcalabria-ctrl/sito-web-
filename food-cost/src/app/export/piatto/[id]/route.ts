import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { requireUser } from "@/lib/auth";
import { loadAll } from "@/lib/data";
import { dateIt, euro, num, pct } from "@/lib/format";

// I font standard dei PDF coprono solo l'alfabeto occidentale: il resto diventa "?".
const WIN_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
const safe = (s: string) =>
  [...s.replace(/−/g, "-").replace(/\s+/g, " ")].map((c) => (c.charCodeAt(0) <= 0xff || WIN_EXTRA.includes(c) ? c : "?")).join("");

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  const { recipes, engine, settings } = await loadAll();
  const r = recipes.find((x) => x.id === id && x.type === "PIATTO");
  if (!r) return new Response("Piatto non trovato", { status: 404 });
  const rc = engine.recipeCost(id);
  const m = engine.dishMetrics(id);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, L = 48, R = W - 48;
  const ink = rgb(0.16, 0.15, 0.13), muted = rgb(0.44, 0.4, 0.37), red = rgb(0.7, 0.14, 0.09), green = rgb(0.18, 0.36, 0.31), line = rgb(0.9, 0.87, 0.83);
  let page: PDFPage = pdf.addPage([W, H]);
  let y = H - 56;

  const text = (s: string, x: number, size = 10, f: PDFFont = font, color = ink) => page.drawText(safe(s), { x, y, size, font: f, color });
  const right = (s: string, x: number, size = 10, f: PDFFont = font, color = ink) =>
    page.drawText(safe(s), { x: x - f.widthOfTextAtSize(safe(s), size), y, size, font: f, color });
  const rule = () => page.drawLine({ start: { x: L, y: y + 12 }, end: { x: R, y: y + 12 }, thickness: 0.7, color: line });
  const fit = (s: string, max: number, size: number, f: PDFFont) => {
    let t = safe(s);
    while (t.length > 1 && f.widthOfTextAtSize(t, size) > max) t = t.slice(0, -2) + "…";
    return t;
  };
  const need = (space: number) => { if (y < 56 + space) { page = pdf.addPage([W, H]); y = H - 56; } };

  text("SCHEDA PIATTO", L, 9, bold, muted);
  right(dateIt(new Date()), R, 9, font, muted);
  y -= 28;
  text(fit(r.name, R - L, 22, bold), L, 22, bold);
  y -= 18;
  text(`${r.category || "Senza categoria"}  ·  ${r.portions} ${r.portions === 1 ? "porzione" : "porzioni"}  ·  ${r.onMenu ? "in carta" : "fuori carta"}`, L, 10, font, muted);
  y -= 34;

  if (m) {
    const cells: [string, string, string][] = [
      ["Food cost", pct(m.foodCostPct), `soglia ${pct(settings.targetFoodCostPct, 0)}`],
      ["Costo del piatto", euro(m.total), `${euro(m.costPerPortion)} a porzione`],
      ["Margine", euro(m.margin), `${euro(m.marginPerPortion)} a porzione`],
      ["Prezzo a menù", euro(r.menuPrice), `${euro(m.netPrice)} senza IVA ${pct(settings.vatPct, 0)}`],
    ];
    const cw = (R - L) / cells.length;
    cells.forEach(([label, value, sub], i) => {
      const x = L + i * cw;
      page.drawText(safe(label), { x, y: y + 16, size: 8.5, font, color: muted });
      page.drawText(safe(value), { x, y, size: 15, font: bold, color: i === 0 ? (m.overTarget ? red : green) : ink });
      page.drawText(safe(sub), { x, y: y - 13, size: 8, font, color: muted });
    });
    y -= 40;
    text(`Prezzo consigliato per un food cost del ${pct(settings.targetFoodCostPct, 0)}: ${euro(m.suggestedPrice)} a menù (IVA inclusa)`, L, 10, bold, m.overTarget ? red : ink);
    y -= 34;
  }

  if (!rc.ok) {
    text(`Costo non calcolabile: ${rc.error}`, L, 10, bold, red);
  } else {
    const cQty = 370, cCost = 470;
    text("Composizione", L, 9, bold, muted); right("Quantità", cQty, 9, bold, muted); right("Costo", cCost, 9, bold, muted); right("Peso", R, 9, bold, muted);
    y -= 18;
    for (const l of rc.lines) {
      need(20);
      rule();
      text(fit(l.name + (l.kind === "semilavorato" ? " (semilavorato)" : ""), 250, 10, font), L);
      right(`${num(l.quantity)} ${l.unit}`, cQty); right(euro(l.cost), cCost); right(pct(l.sharePct, 0), R, 10, font, muted);
      y -= 18;
    }
    rule();
    text("Totale", L, 10, bold); right(euro(rc.total), cCost, 10, bold);
    y -= 30;
  }

  if (r.notes) {
    need(40);
    text("Note", L, 9, bold, muted);
    y -= 15;
    for (const raw of r.notes.split("\n")) {
      let rest = safe(raw);
      while (rest.length) {
        let cut = rest.length;
        while (font.widthOfTextAtSize(rest.slice(0, cut), 10) > R - L) cut = rest.lastIndexOf(" ", cut - 1) > 0 ? rest.lastIndexOf(" ", cut - 1) : cut - 1;
        need(16);
        text(rest.slice(0, cut), L);
        rest = rest.slice(cut).trimStart();
        y -= 14;
      }
    }
  }
  need(30);
  y -= 6;
  text("Quantità nette. Costi IVA esclusa, calcolati con i prezzi d'acquisto correnti e la resa di ogni ingrediente.", L, 8, font, muted);

  const bytes = await pdf.save();
  const file = r.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "piatto";
  return new Response(Buffer.from(bytes), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="scheda-${file}.pdf"` },
  });
}
