"use client";

import { useActionState } from "react";
import { addUser, changePassword, saveSettings } from "@/lib/actions";
import { Message, SubmitButton } from "@/components/ui";

export function SettingsForm({ values }: { values: { targetFoodCostPct: string; vatPct: string; targetReceipt: string } }) {
  const [state, run] = useActionState(saveSettings, null);
  return (
    <form action={run} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="t">Food cost obiettivo %</label>
          <input id="t" name="targetFoodCostPct" className="input" inputMode="decimal" defaultValue={values.targetFoodCostPct} />
        </div>
        <div>
          <label className="label" htmlFor="r">Scontrino obiettivo a persona €</label>
          <input id="r" name="targetReceipt" className="input" inputMode="decimal" defaultValue={values.targetReceipt} />
        </div>
        <div>
          <label className="label" htmlFor="v">IVA sul menù %</label>
          <input id="v" name="vatPct" className="input" inputMode="decimal" defaultValue={values.vatPct} />
        </div>
      </div>
      <Message state={state} />
      <SubmitButton>Salva</SubmitButton>
    </form>
  );
}

export function AddUserForm() {
  const [state, run] = useActionState(addUser, null);
  return (
    <form action={run} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="name" className="input" placeholder="Nome" aria-label="Nome" />
        <input name="username" className="input" placeholder="Nome utente" aria-label="Nome utente" autoCapitalize="none" required />
        <input name="password" type="password" className="input" placeholder="Password (min. 8)" aria-label="Password" autoComplete="new-password" required />
      </div>
      <Message state={state} />
      <SubmitButton className="btn-ghost">Aggiungi account</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, run] = useActionState(changePassword, null);
  return (
    <form action={run} className="space-y-3">
      <input name="password" type="password" className="input max-w-xs" placeholder="Nuova password (min. 8)" aria-label="Nuova password" autoComplete="new-password" required />
      <Message state={state} />
      <SubmitButton className="btn-ghost">Cambia la mia password</SubmitButton>
    </form>
  );
}
