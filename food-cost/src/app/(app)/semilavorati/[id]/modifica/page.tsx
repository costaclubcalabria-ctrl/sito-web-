import { RecipeEdit } from "@/components/RecipePages";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <RecipeEdit kind="SEMILAVORATO" id={Number((await params).id)} />;
}
