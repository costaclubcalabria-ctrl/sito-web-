import { getAll } from "@/lib/data";
import { db } from "@/lib/db";
import { saveIngredient } from "@/lib/actions";
import { IngredientForm } from "@/components/IngredientForm";
import { PageHead } from "@/components/bits";

export const dynamic = "force-dynamic";

export default async function NuovoIngrediente() {
  const { ingredients } = await getAll();
  const suppliers = (await db.supplier.findMany({ orderBy: { name: "asc" } })).map((s) => s.name);
  const categories = [...new Set(ingredients.map((i) => i.category).filter(Boolean))].sort();
  return (
    <>
      <PageHead title="Nuovo ingrediente" />
      <div className="card max-w-2xl">
        <IngredientForm action={saveIngredient.bind(null, null)} categories={categories} suppliers={suppliers}
          values={{ name: "", category: "", supplier: "", purchaseQty: "1", purchaseUnit: "kg", price: "", yieldPct: "100", pieceWeightG: "", notes: "" }} />
      </div>
    </>
  );
}
