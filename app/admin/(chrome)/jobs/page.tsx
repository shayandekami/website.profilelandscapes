import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, jobPostings } from "@/lib/db";
export default async function JobsPage() {
  const jobs = await db.select().from(jobPostings).orderBy(asc(jobPostings.sortOrder), asc(jobPostings.title));
  return <main className="main-content"><div className="page-head-a"><div><h1>Job <span className="it">listings.</span></h1><div className="sub">Publish roles and manage their requirements.</div></div><Link className="btn pri" href="/admin/jobs/new">New job</Link></div>
    <div className="panel">{jobs.length === 0 ? <div style={{ padding: 36 }}>No job listings yet.</div> : <table className="tbl"><thead><tr><th>Role</th><th>Team</th><th>Type</th><th>Status</th><th>Closing</th></tr></thead><tbody>{jobs.map((job) => <tr key={job.id}><td><Link href={`/admin/jobs/${job.id}`} style={{ fontWeight: 600 }}>{job.title}</Link><div className="sub">{job.location}</div></td><td>{job.team}</td><td>{job.employmentType}</td><td><span className={`chip ${job.status === "live" ? "paid" : "draft"}`}>{job.status}</span></td><td>{job.closingDate?.toLocaleDateString("en-AU") || "Open"}</td></tr>)}</tbody></table>}</div></main>;
}
