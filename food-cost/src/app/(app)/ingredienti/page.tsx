import Link from "next/link";
import { getAll } from "@/lib/data";
import { netCostLabel } from "@/lib/labels";
import { euro, num, pct } from "@/lib/format";
import { PageHead } from "@/components/bits";

export const dynamic = "force-dynamic";

export default async function Ingredienti({ searchParams }: { searchParams: Promise<{ q?: string; categoria?: string }> }) {
  const sp = await searchParams;
  const { ingredients, ingInputs } = await getAll();
  const categories = [...new Set(ingredients.map((i) => i.category).filter(Boolean))].sort();
  const q = (sp.q ?? "").trim().toLowerCase();
  const list = ingredients.filter((i) => (!q || i.name.toLowerCase().includes(q)) && (!sp.categoria || i.category === sp.categoria));
  return (
    <>
      <PageHead title="Ingredienti">
        <Link href="/ingredienti/importa" className="btn-ghost">Importa</Link>
        <Link href="/ingredienti/nuovo" className="btn">Nuovo</Link>
      </PageHead>
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Cerca per nome" className="input" />
        <select name="categoria" defaultValue={sp.categoria ?? ""} className="input max-w-40">
          <option value="">Tutte</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-ghost">Filtra</button>
      </form>
      <div className="card p-0">
        {list.length === 0 && <p className="p-4 text-sm text-muted">Nessun ingrediente trovato.</p>}
        <ul className="divide-y divide-line">
          {list.map((i) => (
            <li key={i.id}>
              <Link href={`/ingredienti/${i.id}`} className="flex items-center gap-3 px-3 py-3 hover:bg-paper">
                <div className="mr-auto min-w-0">
                  <div className="truncate font-semibold">{i.name}</div>
                  <div className="truncate text-xs text-muted">{[i.category, i.supplier?.name].filter(Boolean).join(" · ") || "—"}</div>
                </div>
                <div className="num text-right text-sm">
                  <div>{euro(i.price)} / {i.purchaseQty === "1" ? "" : num(i.purchaseQty) + " "}{i.purchaseUnit}</div>
                  <div className="text-xs text-muted">resa {pct(i.yieldPct, 0)} → netto {netCostLabel(ingInputs.find((x) => x.id === i.id)!)}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
