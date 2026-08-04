import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { careerApplications, db, jobPostings } from "@/lib/db";

type Props = { searchParams: Promise<{ status?: string }> };
export default async function ApplicantsPage({ searchParams }: Props) {
  const query = await searchParams;
  const all = await db.select({ application: careerApplications, jobTitle: jobPostings.title })
    .from(careerApplications).leftJoin(jobPostings, eq(careerApplications.jobId, jobPostings.id))
    .orderBy(desc(careerApplications.submittedAt));
  const rows = query.status ? all.filter((row) => row.application.status === query.status) : all;
  const stages = ["new", "screening", "shortlisted", "interview", "offer", "hired", "rejected"];
  return <main className="main-content">
    <div className="page-head-a"><div><h1>Career <span className="it">applications.</span></h1><div className="sub">{all.length} candidates across the hiring pipeline.</div></div><a className="btn" href="/admin/jobs">Manage job listings</a></div>
    <div className="admin-pipeline">{stages.map((stage) => <a key={stage} href={`/admin/applicants?status=${stage}`} className={query.status === stage ? "on" : ""}><b>{all.filter((row) => row.application.status === stage).length}</b><span>{stage}</span></a>)}</div>
    <div className="panel">{rows.length === 0 ? <div style={{ padding: 36 }}>No applications in this stage.</div> : <table className="tbl"><thead><tr><th>Candidate</th><th>Role</th><th>Experience</th><th>Rating</th><th>Status</th><th>Received</th></tr></thead><tbody>{rows.map(({ application: a, jobTitle }) => <tr key={a.id}>
      <td><Link href={`/admin/applicants/${a.id}`} style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</Link><div className="sub">{a.email} · {a.phone}</div></td>
      <td>{jobTitle || a.roleInterest}<div className="sub">{a.suburb || "Location not supplied"}</div></td><td>{a.yearsExperience || "—"}</td>
      <td>{a.rating ? "★".repeat(a.rating) : "—"}</td><td><span className={`chip ${a.status === "new" ? "draft" : "paid"}`}>{a.status}</span></td>
      <td className="mono muted">{new Date(a.submittedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</td>
    </tr>)}</tbody></table>}</div>
  </main>;
}
