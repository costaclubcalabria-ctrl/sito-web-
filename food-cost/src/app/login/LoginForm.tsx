"use client";

import { useActionState } from "react";
import { login, setupFirstUser } from "@/lib/actions";
import { Message, SubmitButton } from "@/components/ui";

export function LoginForm({ firstRun }: { firstRun: boolean }) {
  const [state, action] = useActionState(firstRun ? setupFirstUser : login, null);
  return (
    <form action={action} className="space-y-4">
      {firstRun && (
        <>
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            Primo avvio: crea il tuo account. Gli altri si aggiungono poi da Impostazioni.
          </p>
          <div>
            <label className="label" htmlFor="name">Il tuo nome</label>
            <input id="name" name="name" className="input" autoComplete="name" />
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor="username">Nome utente</label>
        <input id="username" name="username" className="input" autoCapitalize="none" autoCorrect="off" autoComplete="username" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" required
          autoComplete={firstRun ? "new-password" : "current-password"} />
        {firstRun && <p className="hint">Almeno 8 caratteri.</p>}
      </div>
      <Message state={state} />
      <SubmitButton className="btn w-full">{firstRun ? "Crea account ed entra" : "Entra"}</SubmitButton>
    </form>
  );
}
