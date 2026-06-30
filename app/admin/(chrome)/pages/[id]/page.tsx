import { notFound } from "next/navigation";
import { db, pages, pageRevisions, users, type Section } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { PageEditor } from "@/components/admin/PageEditor";
import { RevisionsPanel } from "@/components/admin/RevisionsPanel";
import { savePage } from "./actions";

type Params = { params: Promise<{ id: string }> };

export default async function PageEditPage({ params }: Params) {
  const { id } = await params;
  const pageId = Number(id);
  if (!Number.isFinite(pageId)) notFound();

  const page = await db.query.pages.findFirst({
    where: eq(pages.id, pageId),
  });
  if (!page) notFound();

  const revRows = await db
    .select({ id: pageRevisions.id, title: pageRevisions.title, sections: pageRevisions.sections, createdAt: pageRevisions.createdAt, author: users.name })
    .from(pageRevisions)
    .leftJoin(users, eq(pageRevisions.authorId, users.id))
    .where(eq(pageRevisions.pageId, pageId))
    .orderBy(desc(pageRevisions.createdAt))
    .limit(20);
  const revisions = revRows.map((r) => ({
    id: r.id, title: r.title, sectionCount: Array.isArray(r.sections) ? (r.sections as Section[]).length : 0,
    author: r.author, createdAt: r.createdAt.toISOString(),
  }));

  return (
    <main className="main-content" style={{ padding: 0 }}>
      <RevisionsPanel pageId={page.id} revisions={revisions} />
      <PageEditor
        page={{
          id: page.id,
          slug: page.slug,
          title: page.title,
          lede: page.lede || "",
          seoTitle: page.seoTitle || "",
          seoDescription: page.seoDescription || "",
          status: page.status,
          sections: page.sections as Section[],
          updatedAt: page.updatedAt.toISOString(),
        }}
        save={savePage}
      />
    </main>
  );
}
