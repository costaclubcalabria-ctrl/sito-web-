"use client";

import { useActionState, useState } from "react";
import type { State } from "@/lib/actions";
import { Message, SubmitButton } from "./ui";

export type IngredientValues = {
  name: string; category: string; supplier: string; purchaseQty: string; purchaseUnit: string;
  price: string; yieldPct: string; pieceWeightG: string; notes: string;
};

export function IngredientForm({ action, values, categories, suppliers }: {
  action: (prev: State, fd: FormData) => Promise<State>;
  values: IngredientValues; categories: string[]; suppliers: string[];
}) {
  const [state, run] = useActionState(action, null);
  const [unit, setUnit] = useState(values.purchaseUnit);
  const volume = unit === "l" || unit === "ml";
  return (
    <form action={run} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">Nome</label>
        <input id="name" name="name" className="input" defaultValue={values.name} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Categoria</label>
          <input id="category" name="category" className="input" defaultValue={values.category} list="cat-list" placeholder="es. Verdure" />
          <datalist id="cat-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <label className="label" htmlFor="supplier">Fornitore</label>
          <input id="supplier" name="supplier" className="input" defaultValue={values.supplier} list="sup-list" />
          <datalist id="sup-list">{suppliers.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
      </div>

      <fieldset className="rounded-xl border border-line p-3">
        <legend className="px-1 text-sm font-semibold">Acquisto</legend>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="price">Prezzo €</label>
            <input id="price" name="price" className="input" inputMode="decimal" defaultValue={values.price} required />
          </div>
          <div>
            <label className="label" htmlFor="purchaseQty">per</label>
            <input id="purchaseQty" name="purchaseQty" className="input" inputMode="decimal" defaultValue={values.purchaseQty} />
          </div>
          <div>
            <label className="label" htmlFor="purchaseUnit">Unità</label>
            <select id="purchaseUnit" name="purchaseUnit" className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="kg">kg</option><option value="g">g</option><option value="l">l</option>
              <option value="ml">ml</option><option value="pz">pezzo</option>
            </select>
          </div>
        </div>
        <p className="hint">Prezzo IVA esclusa. Esempio: latta da 2,5 kg a 6,00 € → prezzo 6, per 2,5, unità kg.</p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="yieldPct">Resa %</label>
          <input id="yieldPct" name="yieldPct" className="input" inputMode="decimal" defaultValue={values.yieldPct} />
          <p className="hint">Quanta parte resta utilizzabile dopo pulizia o cottura. 100 = nessuno scarto.</p>
        </div>
        {!volume && (
          <div>
            <label className="label" htmlFor="pieceWeightG">Peso medio di un pezzo (g)</label>
            <input id="pieceWeightG" name="pieceWeightG" className="input" inputMode="decimal" defaultValue={values.pieceWeightG} />
            <p className="hint">Facoltativo. Serve per usarlo in ricetta sia a pezzi sia a peso (es. uovo 60 g).</p>
          </div>
        )}
      </div>
      <div>
        <label className="label" htmlFor="notes">Note</label>
        <input id="notes" name="notes" className="input" defaultValue={values.notes} />
      </div>
      <Message state={state} />
      <SubmitButton>Salva</SubmitButton>
    </form>
  );
}
