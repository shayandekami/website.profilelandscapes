import type { Metadata } from "next";
import { db, encyclopediaEntries } from "@/lib/db";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { DefaultEncyclopediaPage } from "@/components/commerce/defaults/DefaultEncyclopediaPage";
import { theme } from "@/themes/active";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plant Encyclopedia",
  description: "Comprehensive botanical reference for garden planning and plant selection.",
};

interface EncyclopediaPageProps {
  searchParams: Promise<{ tag?: string; q?: string }>;
}

export default async function EncyclopediaPage({ searchParams }: EncyclopediaPageProps) {
  const { tag: selectedTag, q: searchQuery } = await searchParams;

  const conditions = [eq(encyclopediaEntries.status, "live")];

  if (selectedTag && selectedTag.trim()) {
    conditions.push(
      sql`${encyclopediaEntries.tags}::jsonb @> ${JSON.stringify([selectedTag.trim()])}::jsonb`
    );
  }

  if (searchQuery && searchQuery.trim()) {
    conditions.push(
      or(
        ilike(encyclopediaEntries.latinName, `%${searchQuery.trim()}%`),
        ilike(encyclopediaEntries.commonName, `%${searchQuery.trim()}%`)
      )!
    );
  }

  const entries = await db
    .select()
    .from(encyclopediaEntries)
    .where(and(...conditions))
    .orderBy(encyclopediaEntries.latinName);

  const IndexPage = theme.encyclopedia?.IndexPage ?? DefaultEncyclopediaPage;

  return (
    <IndexPage
      entries={entries}
      selectedTag={selectedTag}
      searchQuery={searchQuery}
    />
  );
}
