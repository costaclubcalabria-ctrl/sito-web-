import Link from "next/link";
import { notFound } from "next/navigation";
import { getAll } from "@/lib/data";
import { db } from "@/lib/db";
import { deleteIngredient, saveIngredient } from "@/lib/actions";
import { dateIt, euro, inputValue, num, pct } from "@/lib/format";
import { IngredientForm } from "@/components/IngredientForm";
import { PageHead, Saved } from "@/components/bits";
import { DeleteButton } from "@/components/ui";
import { netCostLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function Ingrediente({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvato?: string }> }) {
  const id = Number((await params).id);
  const { ingredients, ingInputs, recipes, engine } = await getAll();
  const ing = ingredients.find((i) => i.id === id);
  if (!ing) notFound();
  const [history, suppliers, alerts] = await Promise.all([
    db.priceHistory.findMany({ where: { ingredientId: id }, orderBy: { date: "desc" } }),
    db.supplier.findMany({ orderBy: { name: "asc" } }),
    db.alert.findMany({ where: { ingredientId: id, dismissed: false }, include: { recipe: true } }),
  ]);
  const categories = [...new Set(ingredients.map((i) => i.category).filter(Boolean))].sort();
  const usedIn = recipes.filter((r) => r.items.some((it) => it.ingredientId === id));
  const live = alerts.filter((a) => a.recipe.onMenu && engine.dishMetrics(a.recipeId)?.overTarget);

  return (
    <>
      <PageHead title={ing.name}>
        <Link href="/ingredienti" className="btn-ghost">Elenco</Link>
      </PageHead>
      <Saved show={(await searchParams).salvato === "1"} />
      {live.length > 0 && (
        <div className="mb-4 rounded-xl border border-over/30 bg-over-soft p-3 text-sm text-over">
          <p className="font-semibold">Con questo prezzo sono finiti sopra soglia:</p>
          <ul className="mt-1 list-disc pl-5">
            {live.map((a) => (
              <li key={a.id}><Link className="underline" href={`/piatti/${a.recipeId}`}>{a.recipe.name}</Link> <span className="num">(da {pct(a.oldPct)} a {pct(a.newPct)})</span></li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
        <div className="card">
          <p className="mb-4 rounded-lg bg-paper px-3 py-2 text-sm">Costo sul peso netto utilizzabile: <strong className="num">{netCostLabel(ingInputs.find((x) => x.id === id)!)}</strong></p>
          <IngredientForm action={saveIngredient.bind(null, id)} categories={categories} suppliers={suppliers.map((s) => s.name)}
            values={{ name: ing.name, category: ing.category, supplier: ing.supplier?.name ?? "", purchaseQty: inputValue(ing.purchaseQty),
              purchaseUnit: ing.purchaseUnit, price: inputValue(ing.price), yieldPct: inputValue(ing.yieldPct),
              pieceWeightG: inputValue(ing.pieceWeightG), notes: ing.notes }} />
        </div>
        <div className="space-y-4">
          <section className="card">
            <h2 className="h2 mb-2">Storico prezzi</h2>
            <ul className="divide-y divide-line text-sm">
              {history.map((h) => (
                <li key={h.id} className="num flex justify-between py-1.5">
                  <span className="text-muted">{dateIt(h.date)}</span>
                  <span>{euro(h.price)} / {h.purchaseQty === "1" ? "" : num(h.purchaseQty) + " "}{h.purchaseUnit}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="h2 mb-2">Usato in</h2>
            {usedIn.length === 0 && <p className="text-sm text-muted">Nessuna ricetta.</p>}
            <ul className="space-y-1 text-sm">
              {usedIn.map((r) => (
                <li key={r.id}><Link className="underline" href={`/${r.type === "PIATTO" ? "piatti" : "semilavorati"}/${r.id}`}>{r.name}</Link></li>
              ))}
            </ul>
          </section>
          <DeleteButton action={deleteIngredient.bind(null, id)} label="Elimina ingrediente" confirmText={`Eliminare "${ing.name}"?`} />
        </div>
      </div>
    </>
  );
}
