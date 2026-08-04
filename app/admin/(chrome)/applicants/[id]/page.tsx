import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { applicationEvents, applicationNotes, careerApplications, db, jobPostings, users } from "@/lib/db";
import { addApplicationNote, updateApplication } from "../actions";

type Props = { params: Promise<{ id: string }> };
const formatFileSize = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export default async function ApplicantPage({ params }: Props) {
  const { id } = await params; const applicationId = Number(id);
  const [application] = await db.select().from(careerApplications).where(eq(careerApplications.id, applicationId)).limit(1);
  if (!application) notFound();
  const [jobRows, notes, events] = await Promise.all([
    application.jobId ? db.select().from(jobPostings).where(eq(jobPostings.id, application.jobId)).limit(1) : Promise.resolve([]),
    db.select({ note: applicationNotes, author: users.name }).from(applicationNotes).leftJoin(users, eq(applicationNotes.authorId, users.id)).where(eq(applicationNotes.applicationId, applicationId)).orderBy(asc(applicationNotes.createdAt)),
    db.select().from(applicationEvents).where(eq(applicationEvents.applicationId, applicationId)).orderBy(asc(applicationEvents.createdAt)),
  ]);
  const job = jobRows[0];
  return <main className="main-content">
    <div className="page-head-a"><div><h1>{application.firstName} <span className="it">{application.lastName}.</span></h1><div className="sub">{application.referenceCode} · Applied {new Date(application.submittedAt).toLocaleString("en-AU")}</div></div><a className="btn pri" href={`/api/admin/applicants/${application.id}/resume`}>Download CV</a></div>
    <div className="applicant-detail-grid">
      <section className="panel applicant-profile">
        <h2>Candidate profile</h2>
        <dl><div><dt>Role</dt><dd>{job?.title || application.roleInterest}</dd></div><div><dt>Email</dt><dd><a href={`mailto:${application.email}`}>{application.email}</a></dd></div><div><dt>Phone</dt><dd><a href={`tel:${application.phone}`}>{application.phone}</a></dd></div><div><dt>Location</dt><dd>{application.suburb || "—"}</dd></div><div><dt>Experience</dt><dd>{application.yearsExperience || "—"}</dd></div><div><dt>Availability</dt><dd>{application.availability || "—"}</dd></div><div><dt>Work rights</dt><dd>{application.workRights}</dd></div><div><dt>Driver licence</dt><dd>{application.driversLicence ? "Yes" : "No"}</dd></div><div><dt>LinkedIn</dt><dd>{application.linkedinUrl ? <a target="_blank" rel="noreferrer" href={application.linkedinUrl}>Open profile ↗</a> : "—"}</dd></div><div><dt>Portfolio</dt><dd>{application.portfolioUrl ? <a target="_blank" rel="noreferrer" href={application.portfolioUrl}>Open portfolio ↗</a> : "—"}</dd></div></dl>
        <h3>Candidate statement</h3><p style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{application.coverLetter}</p>
        <div className="resume-meta"><b>{application.resumeFilename}</b><span>{formatFileSize(application.resumeSize)} · {application.resumeMime}</span></div>
      </section>
      <aside>
        <form action={updateApplication.bind(null, application.id)} className="panel" style={{ padding: 22, marginBottom: 18 }}>
          <h2>Pipeline decision</h2>
          <label>Status<select className="field" name="status" defaultValue={application.status}>{["new","screening","shortlisted","interview","offer","hired","rejected","withdrawn"].map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Candidate rating<select className="field" name="rating" defaultValue={application.rating || ""}><option value="">Not rated</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} / 5</option>)}</select></label>
          <label>Message visible to candidate<textarea className="field" name="candidateMessage" rows={4} placeholder="Optional context about this update" /></label>
          <label className="career-check"><input type="checkbox" name="notify" value="true" defaultChecked /> Email candidate about this update</label>
          <button className="btn pri" type="submit">Save decision</button>
        </form>
        <form action={addApplicationNote.bind(null, application.id)} className="panel" style={{ padding: 22, marginBottom: 18 }}><h2>Internal note</h2><textarea required className="field" name="body" rows={4} placeholder="Interview observations, reference checks, availability…" /><button className="btn" type="submit">Add private note</button></form>
        <section className="panel" style={{ padding: 22 }}><h2>Activity</h2><div className="admin-activity">{events.map((event) => <div key={`e${event.id}`}><b>{event.status}</b><time>{new Date(event.createdAt).toLocaleString("en-AU")}</time>{event.message && <p>{event.message}</p>}</div>)}{notes.map(({ note, author }) => <div key={`n${note.id}`}><b>Internal note · {author || "Admin"}</b><time>{new Date(note.createdAt).toLocaleString("en-AU")}</time><p>{note.body}</p></div>)}</div></section>
      </aside>
    </div>
  </main>;
}
