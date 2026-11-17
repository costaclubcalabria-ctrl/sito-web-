import Link from "next/link";
import Decimal from "decimal.js";
import { getAll } from "@/lib/data";
import { db } from "@/lib/db";
import { dismissAlert } from "@/lib/actions";
import { euro, pct } from "@/lib/format";
import { FcBadge, PageHead, Stat } from "@/components/bits";

export const dynamic = "force-dynamic";

type SP = { ordine?: string; verso?: string; categoria?: string; fuori?: string };

export default async function Dashboard({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { engine, recipes, settings } = await getAll();
  const target = settings.targetFoodCostPct;
  const order = sp.ordine === "margine" ? "margine" : "fc";
  const dir = sp.verso === "asc" ? "asc" : "desc";
  const showOff = sp.fuori === "1";

  const dishes = recipes.filter((r) => r.type === "PIATTO");
  const onMenu = dishes.filter((r) => r.onMenu);
  const categories = [...new Set(dishes.map((d) => d.category).filter(Boolean))].sort();
  const rows = (showOff ? dishes : onMenu)
    .filter((d) => !sp.categoria || d.category === sp.categoria)
    .map((d) => ({ d, m: engine.dishMetrics(d.id), rc: engine.recipeCost(d.id) }));
  rows.sort((a, b) => {
    if (!a.m || !b.m) return a.m ? 1 : b.m ? -1 : 0; // quelli con errori in cima
    const c = order === "fc" ? a.m.foodCostPct.cmp(b.m.foodCostPct) : a.m.margin.cmp(b.m.margin);
    return dir === "asc" ? c : -c;
  });

  const menuMetrics = onMenu.map((d) => engine.dishMetrics(d.id)).filter((m) => m != null);
  const over = menuMetrics.filter((m) => m.overTarget).length;
  const sumCost = menuMetrics.reduce((s, m) => s.plus(m.total), new Decimal(0));
  const sumNet = menuMetrics.reduce((s, m) => s.plus(m.netPrice), new Decimal(0));
  const avg = sumNet.gt(0) ? sumCost.div(sumNet).mul(100) : null;
  const top = engine.topIngredients(onMenu.map((d) => d.id)).slice(0, 10);

  // Avvisi ancora attuali: il piatto è in carta ed è tuttora sopra soglia.
  const alerts = (await db.alert.findMany({ where: { dismissed: false }, include: { ingredient: true, recipe: true }, orderBy: { createdAt: "desc" } }))
    .filter((a) => a.recipe.onMenu && engine.dishMetrics(a.recipeId)?.overTarget);

  const link = (patch: Partial<SP>) => {
    const q = new URLSearchParams();
    const next = { ordine: order, verso: dir, categoria: sp.categoria, fuori: sp.fuori, ...patch };
    for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
    return "/?" + q.toString();
  };
  const sortLink = (o: "fc" | "margine") => link({ ordine: o, verso: order === o && dir === "desc" ? "asc" : "desc" });
  const arrow = (o: string) => (order === o ? (dir === "desc" ? " ↓" : " ↑") : "");

  return (
    <>
      <PageHead title="Dashboard">
        <a href="/export/listino" className="btn-ghost">Listino in Excel</a>
      </PageHead>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Piatti in carta" value={String(onMenu.length)} />
        <Stat label="Sopra soglia" value={String(over)} tone={over > 0 ? "over" : "ok"} sub={`soglia ${pct(target, 0)}`} />
        <Stat label="Food cost medio del menù" value={pct(avg)} tone={avg && avg.gt(target) ? "over" : undefined} sub="un piatto di ciascuno" />
        <Stat label="Scontrino obiettivo" value={euro(settings.targetReceipt)} sub="a persona" />
      </div>

      {alerts.length > 0 && (
        <section className="mb-5 rounded-xl border border-over/30 bg-over-soft p-4">
          <h2 className="h2 text-over">Aumenti che hanno fatto sforare un piatto</h2>
          <ul className="mt-2 divide-y divide-over/15">
            {alerts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <span className="mr-auto">
                  <Link href={`/piatti/${a.recipeId}`} className="font-semibold underline">{a.recipe.name}</Link>{" "}
                  <span className="num">da {pct(a.oldPct)} a {pct(a.newPct)}</span>{" "}
                  dopo la variazione di <Link href={`/ingredienti/${a.ingredientId}`} className="underline">{a.ingredient.name}</Link>
                </span>
                <form action={dismissAlert.bind(null, a.id)}>
                  <button className="rounded-md px-2 py-1 text-xs font-semibold text-over underline">Ho visto</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card mb-5 p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <h2 className="h2 mr-auto">Piatti</h2>
          <Link href={sortLink("fc")} className={`btn-ghost ${order === "fc" ? "border-accent text-accent" : ""}`}>Food cost %{arrow("fc")}</Link>
          <Link href={sortLink("margine")} className={`btn-ghost ${order === "margine" ? "border-accent text-accent" : ""}`}>Margine €{arrow("margine")}</Link>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-line p-3 text-sm">
          <Link href={link({ categoria: undefined })} className={`badge py-1.5 ${!sp.categoria ? "bg-accent text-white" : "bg-paper text-muted"}`}>Tutte</Link>
          {categories.map((c) => (
            <Link key={c} href={link({ categoria: c })} className={`badge py-1.5 ${sp.categoria === c ? "bg-accent text-white" : "bg-paper text-muted"}`}>{c}</Link>
          ))}
          <Link href={link({ fuori: showOff ? undefined : "1" })} className="ml-auto text-sm text-muted underline">
            {showOff ? "Solo piatti in carta" : "Mostra anche fuori carta"}
          </Link>
        </div>
        {rows.length === 0 && <p className="p-4 text-sm text-muted">Nessun piatto. <Link className="underline" href="/piatti/nuovo">Aggiungine uno</Link>.</p>}
        <ul className="divide-y divide-line">
          {rows.map(({ d, m, rc }) => (
            <li key={d.id}>
              <Link href={`/piatti/${d.id}`} className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-3 py-3 hover:bg-paper md:grid-cols-[1fr_7rem_7rem_7rem_6rem] ${m?.overTarget ? "bg-over-soft/50" : ""}`}>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{d.name}{!d.onMenu && <span className="ml-2 text-xs font-normal text-muted">fuori carta</span>}</div>
                  <div className="text-xs text-muted">{d.category || "—"}{!rc.ok && <span className="text-over"> · {rc.error}</span>}</div>
                </div>
                <div className="justify-self-end md:order-last"><FcBadge value={m?.foodCostPct ?? null} target={target} /></div>
                <div className="num col-span-2 flex gap-4 text-xs text-muted md:contents md:text-sm md:text-ink">
                  <span className="md:text-right"><span className="md:hidden">Menù </span>{euro(d.menuPrice)}</span>
                  <span className="md:text-right"><span className="md:hidden">Costo </span>{euro(m?.total)}</span>
                  <span className="md:text-right md:font-semibold"><span className="md:hidden">Margine </span>{euro(m?.margin)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="hidden border-t border-line px-3 py-2 text-right text-xs text-muted md:block">Colonne: prezzo a menù · costo · margine (IVA esclusa) · food cost %</p>
      </section>

      <section className="card">
        <h2 className="h2">Ingredienti che pesano di più</h2>
        <p className="hint mb-3">Costo generato preparando una volta ogni piatto in carta, semilavorati compresi.</p>
        {top.length === 0 && <p className="text-sm text-muted">Ancora nessun dato.</p>}
        <ul className="space-y-2">
          {top.map((t) => (
            <li key={t.ingredientId}>
              <Link href={`/ingredienti/${t.ingredientId}`} className="block">
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="mr-auto truncate font-medium">{t.name}</span>
                  <span className="whitespace-nowrap text-xs text-muted">{t.dishes} {t.dishes === 1 ? "piatto" : "piatti"}</span>
                  <span className="num w-16 text-right">{euro(t.cost)}</span>
                  <span className="num w-14 text-right font-semibold">{pct(t.sharePct)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-paper">
                  <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Decimal.min(100, t.sharePct.div(top[0].sharePct).mul(100)).toFixed(1)}%` }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
