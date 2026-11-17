"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { State } from "@/lib/actions";

export function SubmitButton({ children, className = "btn" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Attendi…" : children}
    </button>
  );
}

export function Message({ state }: { state: State }) {
  if (!state) return null;
  return (
    <div role="status" className="space-y-2">
      {state.error && <p className="rounded-lg bg-over-soft px-3 py-2 text-sm font-medium text-over">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-medium text-accent">{state.ok}</p>}
      {state.details && state.details.length > 0 && (
        <ul className="list-disc space-y-1 rounded-lg bg-warn-soft py-2 pl-7 pr-3 text-sm text-warn">
          {state.details.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      )}
    </div>
  );
}

/** Pulsante di eliminazione con conferma; mostra l'eventuale motivo del rifiuto. */
export function DeleteButton({ action, label = "Elimina", confirmText }: {
  action: (prev: State) => Promise<State>; label?: string; confirmText: string;
}) {
  const [state, run] = useActionState(action, null);
  return (
    <form action={run} onSubmit={(e) => { if (!confirm(confirmText)) e.preventDefault(); }} className="space-y-2">
      <SubmitButton className="btn-danger">{label}</SubmitButton>
      <Message state={state} />
    </form>
  );
}
