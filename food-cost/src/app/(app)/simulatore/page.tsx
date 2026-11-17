import { getAll } from "@/lib/data";
import { PageHead } from "@/components/bits";
import { Simulator, type SimDish } from "./Simulator";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { recipes, engine, settings } = await getAll();
  const dishes: SimDish[] = [];
  for (const r of recipes) {
    if (r.type !== "PIATTO" || !r.onMenu) continue;
    const m = engine.dishMetrics(r.id);
    if (m) dishes.push({ id: r.id, name: r.name, category: r.category, cost: m.total.toFixed(), menuPrice: r.menuPrice!, portions: r.portions ?? 1 });
  }
  dishes.sort((a, b) => a.category.localeCompare(b.category, "it") || a.name.localeCompare(b.name, "it"));
  return (
    <>
      <PageHead title="Tavolo tipo" />
      <Simulator dishes={dishes} settings={settings} />
    </>
  );
}
