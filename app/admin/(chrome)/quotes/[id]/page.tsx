import { notFound } from "next/navigation";
import { db, quotes } from "@/lib/db";
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

  return (
    <main className="main-content">
      <QuoteDetail
        quote={{
          id: q.id,
          name: q.name,
          company: q.company || "",
          email: q.email,
          phone: q.phone || "",
          sector: q.sector || "",
          budget: q.budget || "",
          brief: q.brief,
          status: q.status,
          notes: q.notes || "",
          receivedAt: q.receivedAt.toISOString(),
        }}
        save={saveQuote}
      />
    </main>
  );
}
