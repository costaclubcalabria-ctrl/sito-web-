"use client";

import { useActionState, useMemo, useState } from "react";
import Decimal from "decimal.js";
import type { RecipePayload, State } from "@/lib/actions";
import type { ComponentOption } from "@/lib/labels";
import { dishMetrics, type SettingsInput } from "@/lib/engine/cost";
import { convert, dimensionOf, isUnit, toBase } from "@/lib/engine/units";
import { euro, parseDecimal, pct } from "@/lib/format";
import { Message, SubmitButton } from "./ui";

type Row = { key: number; ref: string; quantity: string; unit: string };

export function RecipeForm({ action, initial, options, settings, categories }: {
  action: (prev: State, fd: FormData) => Promise<State>;
  initial: RecipePayload; options: ComponentOption[]; settings: SettingsInput; categories: string[];
}) {
  const [state, run] = useActionState(action, null);
  const isDish = initial.type === "PIATTO";
  const [f, setF] = useState<Omit<RecipePayload, "items">>(initial);
  const [rows, setRows] = useState<Row[]>(() => initial.items.map((it, i) => ({ key: i, ...it })));
  const [nextKey, setNextKey] = useState(initial.items.length);
  const byRef = useMemo(() => new Map(options.map((o) => [o.ref, o])), [options]);
  const set = (patch: Partial<Omit<RecipePayload, "items">>) => setF((cur) => ({ ...cur, ...patch }));

  const addRow = () => { setRows((r) => [...r, { key: nextKey, ref: "", quantity: "", unit: "g" }]); setNextKey((k) => k + 1); };
  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => {
    if (r.key !== key) return r;
    const next = { ...r, ...patch };
    const o = byRef.get(next.ref);
    if (o && !o.units.includes(next.unit as never)) next.unit = o.units[0];
    return next;
  }));

  // Costo in tempo reale (stessa aritmetica decimale del server).
  const lineCost = (r: Row): Decimal | null => {
    const o = byRef.get(r.ref);
    const q = parseDecimal(r.quantity);
    if (!o || !o.costPerBase || !q || !isUnit(r.unit)) return null;
    try { return convert(q, r.unit, o.dimension, o.pieceWeightG).mul(o.costPerBase); } catch { return null; }
  };
  const costs = rows.map(lineCost);
  const total = costs.reduce<Decimal>((s, c) => (c ? s.plus(c) : s), new Decimal(0));
  const price = parseDecimal(f.menuPrice);
  const portions = Number(f.portions) || 1;
  const m = isDish && price && new Decimal(price).gt(0) ? dishMetrics(total, price, portions, settings) : null;
  const batch = parseDecimal(f.batchQty);
  let batchCost: string | null = null;
  if (!isDish && batch && new Decimal(batch).gt(0) && isUnit(f.batchUnit)) {
    const perBase = total.div(toBase(batch, f.batchUnit));
    const dim = dimensionOf(f.batchUnit);
    batchCost = dim === "pezzi" ? `${euro(perBase, 3)} al pezzo` : `${euro(perBase.mul(1000))} al ${dim === "peso" ? "kg" : "litro"}`;
  }

  const payload: RecipePayload = { ...f, items: rows.map(({ ref, quantity, unit }) => ({ ref, quantity, unit })) };
  const ingredients = options.filter((o) => o.kind === "ingrediente");
  const semis = options.filter((o) => o.kind === "semilavorato");

  return (
    <form action={run} className="space-y-4">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />
      <div className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Nome</label>
            <input id="name" className="input" value={f.name} onChange={(e) => set({ name: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="category">Categoria</label>
            <input id="category" className="input" value={f.category} onChange={(e) => set({ category: e.target.value })} list="rcat"
              placeholder={isDish ? "es. Primi" : "es. Sughi"} />
            <datalist id="rcat">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
        </div>
        {isDish ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="menuPrice">Prezzo a menù €</label>
              <input id="menuPrice" className="input" inputMode="decimal" value={f.menuPrice} onChange={(e) => set({ menuPrice: e.target.value })} required />
              <p className="hint">Del piatto intero, IVA inclusa.</p>
            </div>
            <div>
              <label className="label" htmlFor="portions">Porzioni</label>
              <input id="portions" className="input" inputMode="numeric" value={f.portions} onChange={(e) => set({ portions: e.target.value })} required />
              <p className="hint">Per quante persone basta.</p>
            </div>
            <label className="col-span-2 flex min-h-11 items-center gap-3 text-sm font-medium">
              <input type="checkbox" className="size-5 accent-accent" checked={f.onMenu} onChange={(e) => set({ onMenu: e.target.checked })} />
              In carta
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="batchQty">Resa del lotto</label>
              <input id="batchQty" className="input" inputMode="decimal" value={f.batchQty} onChange={(e) => set({ batchQty: e.target.value })} required />
              <p className="hint">Quanto prodotto finito si ottiene.</p>
            </div>
            <div>
              <label className="label" htmlFor="batchUnit">Unità</label>
              <select id="batchUnit" className="input" value={f.batchUnit} onChange={(e) => set({ batchUnit: e.target.value })}>
                <option value="kg">kg</option><option value="g">g</option><option value="l">l</option><option value="ml">ml</option><option value="pz">pezzi</option>
              </select>
            </div>
            {f.batchUnit !== "l" && f.batchUnit !== "ml" && (
              <div className="col-span-2 sm:col-span-1">
                <label className="label" htmlFor="pw">Peso di un pezzo (g)</label>
                <input id="pw" className="input" inputMode="decimal" value={f.pieceWeightG} onChange={(e) => set({ pieceWeightG: e.target.value })} />
                <p className="hint">Facoltativo: per usarlo a pezzi e a peso (es. polpetta 30 g).</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="h2">Ingredienti e semilavorati</h2>
        <p className="hint mb-3">Quantità nette: peso già pulito e pronto all'uso.</p>
        <ul className="space-y-3">
          {rows.map((r, i) => {
            const o = byRef.get(r.ref);
            return (
              <li key={r.key} className="grid grid-cols-[1fr_5rem_auto] items-center gap-2 rounded-lg border border-line p-2 sm:grid-cols-[1fr_6rem_5rem_5.5rem_auto]">
                <select aria-label={`Componente ${i + 1}`} className="input col-span-3 sm:col-span-1" value={r.ref} onChange={(e) => update(r.key, { ref: e.target.value })}>
                  <option value="">Scegli…</option>
                  {semis.length > 0 && <optgroup label="Semilavorati">{semis.map((s) => <option key={s.ref} value={s.ref}>{s.name}</option>)}</optgroup>}
                  <optgroup label="Ingredienti">{ingredients.map((s) => <option key={s.ref} value={s.ref}>{s.name}</option>)}</optgroup>
                </select>
                <input aria-label={`Quantità ${i + 1}`} className="input" inputMode="decimal" placeholder="Quantità" value={r.quantity} onChange={(e) => update(r.key, { quantity: e.target.value })} />
                <select aria-label={`Unità ${i + 1}`} className="input" value={r.unit} onChange={(e) => update(r.key, { unit: e.target.value })}>
                  {(o?.units ?? ["g", "kg", "ml", "l", "pz"]).map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <span className="num text-right text-sm font-semibold">{euro(costs[i])}</span>
                <button type="button" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                  className="col-span-3 justify-self-end rounded-md px-2 py-1 text-xs font-semibold text-over underline sm:col-span-1" aria-label={`Togli riga ${i + 1}`}>Togli</button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={addRow} className="btn-ghost mt-3">+ Aggiungi riga</button>
      </div>

      <div className="card">
        <label className="label" htmlFor="notes">Note</label>
        <textarea id="notes" className="input" rows={2} value={f.notes} onChange={(e) => set({ notes: e.target.value })} />
      </div>

      <div className="sticky bottom-16 z-10 rounded-xl border border-line bg-card p-3 shadow-lg md:bottom-3">
        <div className="num mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span>Costo <strong>{euro(total)}</strong></span>
          {isDish && m && (
            <>
              <span>Food cost <strong className={m.overTarget ? "text-over" : "text-accent"}>{pct(m.foodCostPct)}</strong></span>
              <span>Margine <strong>{euro(m.margin)}</strong></span>
              <span>Consigliato <strong>{euro(m.suggestedPrice)}</strong></span>
            </>
          )}
          {batchCost && <span><strong>{batchCost}</strong></span>}
        </div>
        <Message state={state} />
        <div className="mt-2"><SubmitButton className="btn w-full sm:w-auto">Salva</SubmitButton></div>
      </div>
    </form>
  );
}
