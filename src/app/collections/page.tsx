import { getAllTools } from "@/lib/db";
import { CollectionsPageClient } from "@/components/CollectionsPageClient/CollectionsPageClient";

interface CollectionsPageProps {
  searchParams: Promise<{ share?: string; name?: string }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { share = "", name = "" } = await searchParams;
  const tools = await getAllTools();

  return <CollectionsPageClient tools={tools} sharedIds={share} sharedName={name} />;
}

