import { notFound } from "next/navigation";
import { db, pages, type Section } from "@/lib/db";
import { eq } from "drizzle-orm";
import { PageEditor } from "@/components/admin/PageEditor";
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

  return (
    <main className="main-content" style={{ padding: 0 }}>
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
