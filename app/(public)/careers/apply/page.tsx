import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db, jobPostings } from "@/lib/db";
import { ApplicationForm } from "./ApplicationForm";

export const metadata: Metadata = { title: "Apply — Careers", description: "Apply to join Profile Landscapes." };

type Props = { searchParams: Promise<{ job?: string; role?: string }> };

export default async function ApplyPage({ searchParams }: Props) {
  const query = await searchParams;
  const jobs = await db.select().from(jobPostings).where(eq(jobPostings.status, "live")).orderBy(asc(jobPostings.sortOrder));
  const selectedJobId = query.job && Number.isFinite(Number(query.job)) ? Number(query.job) : undefined;
  return (
    <main className="career-apply-page">
      <ApplicationForm jobs={jobs.map((job) => ({ ...job, closingDate: undefined, createdAt: undefined, updatedAt: undefined, status: undefined, slug: undefined, sortOrder: undefined }))} selectedJobId={selectedJobId} role={query.role} />
    </main>
  );
}
