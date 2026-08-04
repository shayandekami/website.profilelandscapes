import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { applicationEvents, careerApplications, db, jobPostings } from "@/lib/db";

export const metadata: Metadata = { title: "Application progress", robots: { index: false, follow: false } };

const STATUS: Record<string, { label: string; detail: string }> = {
  new: { label: "Application received", detail: "Your application is safely with our hiring team." },
  screening: { label: "Under review", detail: "We are reviewing your experience against the role requirements." },
  shortlisted: { label: "Shortlisted", detail: "Your application has progressed. We’ll contact you about the next step." },
  interview: { label: "Interview stage", detail: "Your application is in the interview stage." },
  offer: { label: "Offer stage", detail: "We are preparing or discussing an offer with you." },
  hired: { label: "Successful", detail: "Welcome to Profile Landscapes." },
  rejected: { label: "Application concluded", detail: "We are not progressing this application, but appreciate the time you invested." },
  withdrawn: { label: "Withdrawn", detail: "This application has been withdrawn." },
};

type Props = { params: Promise<{ token: string }> };

export default async function ApplicationProgress({ params }: Props) {
  const { token } = await params;
  const [application] = await db.select().from(careerApplications).where(eq(careerApplications.accessToken, token)).limit(1);
  if (!application) notFound();
  const [events, jobRows] = await Promise.all([
    db.select().from(applicationEvents).where(eq(applicationEvents.applicationId, application.id)).orderBy(asc(applicationEvents.createdAt)),
    application.jobId ? db.select().from(jobPostings).where(eq(jobPostings.id, application.jobId)).limit(1) : Promise.resolve([]),
  ]);
  const current = STATUS[application.status] ?? STATUS.new;

  return (
    <main className="career-progress-page">
      <div className="career-progress-card">
        <span className="eyebrow">Application {application.referenceCode}</span>
        <h1 className="display">Thank you, {application.firstName}.</h1>
        <p className="career-progress-lede">We’ve received your application for <strong>{jobRows[0]?.title || application.roleInterest}</strong>. We recorded {application.email} for application updates; keep this private tracking page as your confirmation.</p>
        <div className={`career-status career-status-${application.status}`}>
          <small>Current status</small><h2>{current.label}</h2><p>{current.detail}</p>
        </div>
        <section>
          <h2>What happens next</h2>
          <div className="career-next-grid">
            <div><b>1. Human review</b><p>Usually completed within five business days.</p></div>
            <div><b>2. Initial conversation</b><p>Shortlisted candidates have a 20–30 minute phone call.</p></div>
            <div><b>3. Interview</b><p>Depending on the role, this may include a site, practical or portfolio discussion.</p></div>
            <div><b>4. Outcome</b><p>We’ll update you either way. Offers include checks relevant to the role.</p></div>
          </div>
        </section>
        <section>
          <h2>Progress history</h2>
          <ol className="career-timeline">
            {events.filter((event) => event.candidateVisible).map((event) => (
              <li key={event.id}><span>{STATUS[event.status]?.label || event.status}</span><time>{new Date(event.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</time>{event.message && <p>{event.message}</p>}</li>
            ))}
          </ol>
        </section>
        <p className="career-progress-help">Questions or changed circumstances? Email <a href="mailto:carlo@profilelandscapes.com.au">carlo@profilelandscapes.com.au</a> and include {application.referenceCode}.</p>
      </div>
    </main>
  );
}
