import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, encyclopediaEntries } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";
import { DefaultEncyclopediaEntryPage } from "@/components/commerce/defaults/DefaultEncyclopediaEntryPage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = await db
    .select()
    .from(encyclopediaEntries)
    .where(and(eq(encyclopediaEntries.slug, slug), eq(encyclopediaEntries.status, "live")))
    .limit(1)
    .then((r) => r[0]);

  if (!entry) return {};
  return {
    title: entry.commonName
      ? `${entry.commonName} (${entry.latinName})`
      : entry.latinName,
    description: entry.description?.slice(0, 160) || undefined,
    openGraph: entry.images?.[0]
      ? { images: [{ url: entry.images[0].url }] }
      : undefined,
  };
}

export default async function EncyclopediaEntryPage({ params }: Params) {
  const { slug } = await params;

  const entry = await db
    .select()
    .from(encyclopediaEntries)
    .where(and(eq(encyclopediaEntries.slug, slug), eq(encyclopediaEntries.status, "live")))
    .limit(1)
    .then((r) => r[0]);

  if (!entry) notFound();

  // Companion entries: look up by slugs in entry.companions[]
  const companions =
    entry.companions.length > 0
      ? await db
          .select()
          .from(encyclopediaEntries)
          .where(
            and(
              eq(encyclopediaEntries.status, "live"),
              inArray(encyclopediaEntries.slug, entry.companions)
            )
          )
      : [];

  return <DefaultEncyclopediaEntryPage entry={entry} companions={companions} />;
}
