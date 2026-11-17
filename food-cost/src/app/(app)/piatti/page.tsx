import { RecipeList } from "@/components/RecipePages";

export const dynamic = "force-dynamic";

export default function Page() {
  return <RecipeList kind="PIATTO" />;
}
