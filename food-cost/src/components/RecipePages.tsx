import Link from "next/link";
import { notFound } from "next/navigation";
import { getAll } from "@/lib/data";
import { deleteRecipe, saveRecipe, toggleOnMenu, type RecipePayload } from "@/lib/actions";
import { componentOptions, unitCostLabel } from "@/lib/labels";
import { euro, inputValue, num, pct } from "@/lib/format";
import { FcBadge, PageHead, Saved, Stat } from "./bits";
import { RecipeForm } from "./RecipeForm";
import { DeleteButton } from "./ui";

type Kind = "PIATTO" | "SEMILAVORATO";
const base = (k: Kind) => (k === "PIATTO" ? "/piatti" : "/semilavorati");

export async function RecipeList({ kind }: { kind: Kind }) {
  const { recipes, engine, settings } = await getAll();
  const list = recipes.filter((r) => r.type === kind);
  const isDish = kind === "PIATTO";
  return (
    <>
      <PageHead title={isDish ? "Piatti" : "Semilavorati"}>
        <Link href={`${base(kind)}/nuovo`} className="btn">Nuovo</Link>
      </PageHead>
      <div className="card p-0">
        {list.length === 0 && <p className="p-4 text-sm text-muted">Ancora niente qui.</p>}
        <ul className="divide-y divide-line">
          {list.map((r) => {
            const rc = engine.recipeCost(r.id);
            const m = isDish ? engine.dishMetrics(r.id) : null;
            let unit = "";
            if (!isDish) { try { unit = unitCostLabel(engine.semiUnitCost(r.id)); } catch { unit = ""; } }
            return (
              <li key={r.id} className={`flex items-center gap-3 px-3 ${m?.overTarget ? "bg-over-soft/50" : ""}`}>
                <Link href={`${base(kind)}/${r.id}`} className="mr-auto min-w-0 flex-1 py-3">
                  <div className="truncate font-semibold">{r.name}</div>
                  <div className="num truncate text-xs text-muted">
                    {r.category || "—"} · {rc.ok ? `costo ${euro(rc.total)}` : <span className="text-over">{rc.error}</span>}
                    {isDish ? ` · menù ${euro(r.menuPrice)}` : ` · lotto ${num(r.batchQty)} ${r.batchUnit}`}
                  </div>
                </Link>
                {isDish ? (
                  <>
                    <form action={toggleOnMenu.bind(null, r.id)}>
                      <button className={`badge min-h-9 px-3 ${r.onMenu ? "bg-accent-soft text-accent" : "bg-paper text-muted"}`} title="Cambia stato">
                        {r.onMenu ? "In carta" : "Fuori carta"}
                      </button>
                    </form>
                    <FcBadge value={m?.foodCostPct ?? null} target={settings.targetFoodCostPct} />
                  </>
                ) : (
                  <span className="num text-sm font-semibold">{unit}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export async function RecipeEdit({ kind, id }: { kind: Kind; id: number | null }) {
  const all = await getAll();
  const r = id != null ? all.recipes.find((x) => x.id === id && x.type === kind) : null;
  if (id != null && !r) notFound();
  const isDish = kind === "PIATTO";
  const initial: RecipePayload = {
    type: kind, name: r?.name ?? "", category: r?.category ?? "", notes: r?.notes ?? "",
    batchQty: inputValue(r?.batchQty), batchUnit: r?.batchUnit ?? "kg", pieceWeightG: inputValue(r?.pieceWeightG),
    portions: String(r?.portions ?? (isDish ? 4 : "")), menuPrice: inputValue(r?.menuPrice), onMenu: r?.onMenu ?? true,
    items: (r?.items ?? []).map((it) => ({
      ref: it.ingredientId != null ? `i${it.ingredientId}` : `r${it.subRecipeId}`, quantity: inputValue(it.quantity), unit: it.unit,
    })),
  };
  const categories = [...new Set(all.recipes.filter((x) => x.type === kind).map((x) => x.category).filter(Boolean))].sort();
  return (
    <>
      <PageHead title={r ? `Modifica: ${r.name}` : isDish ? "Nuovo piatto" : "Nuovo semilavorato"}>
        <Link href={r ? `${base(kind)}/${r.id}` : base(kind)} className="btn-ghost">Annulla</Link>
      </PageHead>
      <RecipeForm action={saveRecipe.bind(null, id)} initial={initial} options={componentOptions(all, id)}
        settings={all.settings} categories={categories} />
    </>
  );
}

export async function RecipeDetail({ kind, id, saved }: { kind: Kind; id: number; saved: boolean }) {
  const { recipes, engine, settings } = await getAll();
  const r = recipes.find((x) => x.id === id && x.type === kind);
  if (!r) notFound();
  const isDish = kind === "PIATTO";
  const rc = engine.recipeCost(id);
  const m = isDish ? engine.dishMetrics(id) : null;
  const usedIn = recipes.filter((x) => x.items.some((it) => it.subRecipeId === id));
  let unitCost: string | null = null, pieceCost: string | null = null;
  if (!isDish && rc.ok) {
    try {
      const uc = engine.semiUnitCost(id);
      unitCost = unitCostLabel(uc);
      if (uc.dimension === "peso" && uc.pieceWeightG) pieceCost = `${euro(uc.costPerBase.mul(uc.pieceWeightG), 3)}/pz`;
    } catch { /* mostrato sotto come errore */ }
  }
  return (
    <>
      <PageHead title={r.name}>
        {isDish && <a href={`/export/piatto/${id}`} className="btn-ghost">Scheda in PDF</a>}
        <Link href={`${base(kind)}/${id}/modifica`} className="btn">Modifica</Link>
      </PageHead>
      <Saved show={saved} />
      <p className="-mt-2 mb-4 text-sm text-muted">
        {r.category || "Senza categoria"}
        {isDish ? ` · ${r.portions} ${r.portions === 1 ? "porzione" : "porzioni"} · ${r.onMenu ? "in carta" : "fuori carta"}` : ` · lotto da ${num(r.batchQty)} ${r.batchUnit}`}
      </p>
      {!rc.ok && <p className="mb-4 rounded-lg bg-over-soft px-3 py-2 text-sm font-medium text-over">Costo non calcolabile: {rc.error}.</p>}

      {isDish && m && (
        <>
          {m.overTarget && (
            <p className="mb-4 rounded-lg bg-over-soft px-3 py-2 text-sm font-medium text-over">
              Sopra la soglia del {pct(settings.targetFoodCostPct, 0)}. Per rientrare servirebbe un prezzo a menù di {euro(m.suggestedPrice)}.
            </p>
          )}
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Food cost" value={pct(m.foodCostPct)} tone={m.overTarget ? "over" : "ok"} sub={`soglia ${pct(settings.targetFoodCostPct, 0)}`} />
            <Stat label="Costo del piatto" value={euro(m.total)} sub={`${euro(m.costPerPortion)} a porzione`} />
            <Stat label="Margine" value={euro(m.margin)} sub={`${euro(m.marginPerPortion)} a porzione`} />
            <Stat label="Prezzo consigliato" value={euro(m.suggestedPrice)} sub={`per stare al ${pct(settings.targetFoodCostPct, 0)}`} />
            <Stat label="Prezzo a menù" value={euro(r.menuPrice)} sub="IVA inclusa" />
            <Stat label="Prezzo senza IVA" value={euro(m.netPrice)} sub={`IVA ${pct(settings.vatPct, 0)} scorporata`} />
          </div>
        </>
      )}
      {!isDish && rc.ok && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Costo del lotto" value={euro(rc.total)} sub={`${num(r.batchQty)} ${r.batchUnit}`} />
          <Stat label="Costo unitario" value={unitCost ?? "—"} sub={pieceCost ?? undefined} />
        </div>
      )}

      {rc.ok && (
        <section className="card mb-5 p-0">
          <h2 className="h2 border-b border-line p-3">Composizione</h2>
          <ul className="divide-y divide-line">
            {rc.lines.map((l, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <Link href={`/${l.kind === "ingrediente" ? "ingredienti" : "semilavorati"}/${l.refId}`} className="mr-auto min-w-0 truncate">
                  <span className="font-medium underline">{l.name}</span>
                  {l.kind === "semilavorato" && <span className="ml-2 text-xs text-muted">semilavorato</span>}
                </Link>
                <span className="num text-muted">{num(l.quantity)} {l.unit}</span>
                <span className="num w-16 text-right font-semibold">{euro(l.cost)}</span>
                <span className="num w-14 text-right text-muted">{pct(l.sharePct, 0)}</span>
              </li>
            ))}
            <li className="num flex items-center gap-3 bg-paper px-3 py-2.5 text-sm font-bold">
              <span className="mr-auto">Totale</span><span className="w-16 text-right">{euro(rc.total)}</span><span className="w-14" />
            </li>
          </ul>
        </section>
      )}
      {r.notes && <p className="card mb-5 whitespace-pre-wrap text-sm">{r.notes}</p>}
      {!isDish && (
        <section className="card mb-5">
          <h2 className="h2 mb-2">Usato in</h2>
          {usedIn.length === 0 && <p className="text-sm text-muted">Nessuna ricetta.</p>}
          <ul className="space-y-1 text-sm">
            {usedIn.map((u) => <li key={u.id}><Link className="underline" href={`${base(u.type as Kind)}/${u.id}`}>{u.name}</Link></li>)}
          </ul>
        </section>
      )}
      <DeleteButton action={deleteRecipe.bind(null, id)} label={isDish ? "Elimina piatto" : "Elimina semilavorato"} confirmText={`Eliminare "${r.name}"?`} />
    </>
  );
}
