import type { Metadata } from "next";
import { db, plants } from "@/lib/db";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { DefaultNurseryPage } from "@/components/commerce/defaults/DefaultNurseryPage";
import { theme } from "@/themes/active";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nursery",
  description: "Browse our selection of plants available for purchase.",
};

interface PlantsPageProps {
  searchParams: Promise<{ tag?: string; q?: string; encyclopedia?: string }>;
}

export default async function NurseryPage({ searchParams }: PlantsPageProps) {
  const { tag: selectedTag, q: searchQuery, encyclopedia: encyclopediaSlug } = await searchParams;

  const conditions = [eq(plants.status, "live")];

  if (selectedTag && selectedTag.trim()) {
    // Filter by tag using JSON array contains
    conditions.push(
      sql`${plants.tags}::jsonb @> ${JSON.stringify([selectedTag.trim()])}::jsonb`
    );
  }

  // Cross-link from an encyclopedia entry → its in-stock nursery plants
  if (encyclopediaSlug && encyclopediaSlug.trim()) {
    conditions.push(eq(plants.encyclopediaSlug, encyclopediaSlug.trim()));
  }

  if (searchQuery && searchQuery.trim()) {
    conditions.push(
      or(
        ilike(plants.latinName, `%${searchQuery.trim()}%`),
        ilike(plants.commonName, `%${searchQuery.trim()}%`)
      )!
    );
  }

  const plantList = await db
    .select()
    .from(plants)
    .where(and(...conditions))
    .orderBy(plants.latinName);

  const NurseryPage = theme.nursery?.NurseryPage ?? DefaultNurseryPage;

  return (
    <NurseryPage
      plants={plantList}
      selectedTag={selectedTag}
      searchQuery={searchQuery}
    />
  );
}
