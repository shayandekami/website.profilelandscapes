import { notFound } from "next/navigation";
import { db, quoteAttachments, quotes } from "@/lib/db";
import { eq } from "drizzle-orm";
import { QuoteDetail } from "@/components/admin/QuoteDetail";
import { saveQuote } from "../actions";

type Params = { params: Promise<{ id: string }> };

export default async function QuotePage({ params }: Params) {
  const { id } = await params;
  const qid = Number(id);
  if (!Number.isFinite(qid)) notFound();

  const q = await db.query.quotes.findFirst({ where: eq(quotes.id, qid) });
  if (!q) notFound();
  const attachments = await db.select().from(quoteAttachments).where(eq(quoteAttachments.quoteId, qid));

  return (
    <main className="main-content">
      <QuoteDetail
        quote={{
          id: q.id,
          referenceCode: q.referenceCode || `Quote ${q.id}`,
          name: q.name,
          company: q.company || "",
          email: q.email,
          phone: q.phone || "",
          sector: q.sector || "",
          budget: q.budget || "",
          siteAddress: q.siteAddress || "",
          postcode: q.postcode || "",
          projectStage: q.projectStage || "",
          services: q.services,
          desiredStart: q.desiredStart || "",
          tenderDue: q.tenderDue?.toISOString() || "",
          contactPreference: q.contactPreference || "",
          architect: q.architect || "",
          brief: q.brief,
          status: q.status,
          notes: q.notes || "",
          receivedAt: q.receivedAt.toISOString(),
          attachments: attachments.map((file) => ({ id: file.id, filename: file.filename, mimeType: file.mimeType, sizeBytes: file.sizeBytes })),
        }}
        save={saveQuote}
      />
    </main>
  );
}
