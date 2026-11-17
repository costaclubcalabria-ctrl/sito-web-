import Link from "next/link";
import { IMPORT_COLUMNS } from "@/lib/import";
import { PageHead } from "@/components/bits";
import { ImportForm } from "./ImportForm";

export default function Importa() {
  return (
    <>
      <PageHead title="Importa ingredienti">
        <Link href="/ingredienti" className="btn-ghost">Elenco</Link>
      </PageHead>
      <div className="card max-w-2xl space-y-4">
        <div className="text-sm">
          <p>La prima riga deve contenere le intestazioni. Colonne riconosciute:</p>
          <p className="mt-1 font-medium">{IMPORT_COLUMNS.join(" · ")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>Obbligatorie: Nome, Unità di acquisto (kg, g, l, ml, pz) e Prezzo.</li>
            <li>Se il nome esiste già, l'ingrediente viene aggiornato e il nuovo prezzo entra nello storico.</li>
            <li>I numeri possono avere la virgola (2,40).</li>
          </ul>
          <a href="/export/modello" className="btn-ghost mt-3">Scarica il modello Excel</a>
        </div>
        <ImportForm />
      </div>
    </>
  );
}
