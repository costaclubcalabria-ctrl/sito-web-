import ExcelJS from "exceljs";
import { requireUser } from "@/lib/auth";
import { IMPORT_COLUMNS } from "@/lib/import";

export async function GET() {
  await requireUser();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Ingredienti");
  ws.addRow([...IMPORT_COLUMNS]);
  ws.addRow(["Cipolla rossa di Tropea", "Verdure", "Ortofrutta Rossi", "kg", 1, 2.4, 85, ""]);
  ws.addRow(["Pomodori pelati (latta)", "Conserve", "Ingrosso Sud", "kg", 2.5, 4.5, 100, ""]);
  ws.addRow(["Uova", "Latticini e uova", "", "pz", 1, 0.28, 100, 60]);
  ws.getRow(1).font = { bold: true };
  ws.columns.forEach((c) => { c.width = 24; });
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modello-ingredienti.xlsx"',
    },
  });
}
