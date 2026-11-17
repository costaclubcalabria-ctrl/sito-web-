"use client";

import { useActionState } from "react";
import { importIngredients } from "@/lib/actions";
import { Message, SubmitButton } from "@/components/ui";

export function ImportForm() {
  const [state, run] = useActionState(importIngredients, null);
  return (
    <form action={run} className="space-y-4">
      <div>
        <label className="label" htmlFor="file">File CSV o Excel (.xlsx)</label>
        <input id="file" name="file" type="file" accept=".csv,.xlsx,.txt" className="input" required />
      </div>
      <Message state={state} />
      <SubmitButton>Importa</SubmitButton>
    </form>
  );
}
