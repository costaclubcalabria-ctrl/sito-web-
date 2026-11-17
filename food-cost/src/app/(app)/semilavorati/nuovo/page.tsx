import { RecipeEdit } from "@/components/RecipePages";

export const dynamic = "force-dynamic";

export default function Page() {
  return <RecipeEdit kind="SEMILAVORATO" id={null} />;
}
