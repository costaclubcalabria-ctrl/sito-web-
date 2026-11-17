import { RecipeDetail } from "@/components/RecipePages";

export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvato?: string }> }) {
  return <RecipeDetail kind="SEMILAVORATO" id={Number((await params).id)} saved={(await searchParams).salvato === "1"} />;
}
