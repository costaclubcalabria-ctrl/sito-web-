"use client";

import { useState } from "react";
import { simulateTable, type SettingsInput } from "@/lib/engine/cost";
import { euro, pct } from "@/lib/format";
import { Stat } from "@/components/bits";

export type SimDish = { id: number; name: string; category: string; cost: string; menuPrice: string; portions: number };

export function Simulator({ dishes, settings }: { dishes: SimDish[]; settings: SettingsInput }) {
  const [people, setPeople] = useState(4);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const bump = (id: number, d: number) => setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));
  const chosen = dishes.filter((d) => (counts[d.id] ?? 0) > 0);
  const r = simulateTable(chosen.map((d) => ({ cost: d.cost, menuPrice: d.menuPrice, portions: d.portions, count: counts[d.id] })), people, settings);
  const below = r.diffFromTarget.lt(0);
  const over = r.foodCostPct != null && r.foodCostPct.gt(settings.targetFoodCostPct);
  const categories = [...new Set(dishes.map((d) => d.category))];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <div className="card flex items-center gap-3">
          <span className="mr-auto font-semibold">Persone al tavolo</span>
          <button type="button" className="btn-ghost w-11 px-0 text-lg" onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Una persona in meno">−</button>
          <span className="num w-8 text-center text-xl font-bold" aria-live="polite">{people}</span>
          <button type="button" className="btn-ghost w-11 px-0 text-lg" onClick={() => setPeople((p) => Math.min(50, p + 1))} aria-label="Una persona in più">+</button>
        </div>
        {dishes.length === 0 && <p className="card text-sm text-muted">Nessun piatto in carta con costo calcolabile.</p>}
        {categories.map((cat) => (
          <section key={cat} className="card p-0">
            <h2 className="h2 border-b border-line p-3">{cat || "Senza categoria"}</h2>
            <ul className="divide-y divide-line">
              {dishes.filter((d) => d.category === cat).map((d) => {
                const n = counts[d.id] ?? 0;
                return (
                  <li key={d.id} className={`flex items-center gap-2 px-3 py-2 ${n > 0 ? "bg-accent-soft/50" : ""}`}>
                    <div className="mr-auto min-w-0">
                      <div className="truncate font-medium">{d.name}</div>
                      <div className="num text-xs text-muted">{euro(d.menuPrice)} · per {d.portions}</div>
                    </div>
                    <button type="button" className="btn-ghost w-11 px-0 text-lg" onClick={() => bump(d.id, -1)} disabled={n === 0} aria-label={`Togli ${d.name}`}>−</button>
                    <span className="num w-6 text-center font-bold">{n}</span>
                    <button type="button" className="btn-ghost w-11 px-0 text-lg" onClick={() => bump(d.id, 1)} aria-label={`Aggiungi ${d.name}`}>+</button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Telefono: riga riassuntiva sempre visibile sopra la barra di navigazione */}
      <div className="num sticky bottom-16 z-10 flex justify-between gap-3 rounded-xl border border-line bg-card px-3 py-2 text-sm shadow-lg md:hidden" aria-hidden="true">
        <span>A persona <strong className={chosen.length ? (below ? "text-over" : "text-accent") : ""}>{euro(r.grossPerCover)}</strong></span>
        <span>Food cost <strong className={r.foodCostPct ? (over ? "text-over" : "text-accent") : ""}>{pct(r.foodCostPct)}</strong></span>
      </div>

      <aside className="h-fit space-y-3 rounded-xl border border-line bg-card p-3 md:sticky md:top-16">
        <h2 className="h2">Risultato per coperto</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Incasso a persona" value={euro(r.grossPerCover)} tone={chosen.length ? (below ? "over" : "ok") : undefined}
            sub={chosen.length ? `${below ? "" : "+"}${euro(r.diffFromTarget)} sul target di ${euro(settings.targetReceipt, 0)}` : `target ${euro(settings.targetReceipt, 0)}`} />
          <Stat label="Food cost" value={pct(r.foodCostPct)} tone={r.foodCostPct ? (over ? "over" : "ok") : undefined} sub={`soglia ${pct(settings.targetFoodCostPct, 0)}`} />
          <Stat label="Costo a persona" value={euro(r.costPerCover)} />
          <Stat label="Margine a persona" value={euro(r.marginPerCover)} sub="IVA esclusa" />
        </div>
        <dl className="num grid grid-cols-2 gap-y-1 text-sm">
          <dt className="text-muted">Incasso tavolo</dt><dd className="text-right font-semibold">{euro(r.gross)}</dd>
          <dt className="text-muted">Incasso senza IVA</dt><dd className="text-right">{euro(r.net)}</dd>
          <dt className="text-muted">Costo tavolo</dt><dd className="text-right">{euro(r.cost)}</dd>
          <dt className="text-muted">Porzioni servite</dt><dd className="text-right">{r.portions} per {people} persone</dd>
        </dl>
        {chosen.length > 0 && <button type="button" className="btn-ghost w-full" onClick={() => setCounts({})}>Svuota tavolo</button>}
      </aside>
    </div>
  );
}
