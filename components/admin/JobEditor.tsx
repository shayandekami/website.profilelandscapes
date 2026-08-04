"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

type Job = { title?: string; slug?: string; team?: string; location?: string; employmentType?: string; summary?: string; description?: string | null; responsibilities?: string[]; requirements?: string[]; desirable?: string[]; salaryRange?: string | null; closingDate?: Date | null; status?: string; sortOrder?: number; };
function SaveJobButton() {
  const { pending } = useFormStatus();
  return <button className="btn pri" type="submit" disabled={pending}>{pending ? "Saving…" : "Save job"}</button>;
}
export function JobEditor({ job, action, savedMessage }: { job?: Job; action: (form: FormData) => void | Promise<void>; savedMessage?: string }) {
  return <form action={action} className="panel" style={{ padding: 26, maxWidth: 980 }}>
    {savedMessage && <div className="admin-form-success" role="status">{savedMessage}</div>}
    <div className="form-grid">
      <label>Job title<input className="field" required name="title" defaultValue={job?.title} /></label>
      <label>URL slug<input className="field" name="slug" defaultValue={job?.slug} placeholder="Generated from title" /></label>
      <label>Team<input className="field" required name="team" defaultValue={job?.team} placeholder="Site, Nursery, Office" /></label>
      <label>Location<input className="field" required name="location" defaultValue={job?.location} placeholder="Sydney Metro" /></label>
      <label>Employment type<input className="field" required name="employmentType" defaultValue={job?.employmentType} placeholder="Full-time" /></label>
      <label>Indicative salary<input className="field" name="salaryRange" defaultValue={job?.salaryRange || ""} placeholder="$85k–$105k + super" /></label>
      <label>Closing date<input className="field" type="date" name="closingDate" defaultValue={job?.closingDate ? new Date(job.closingDate).toISOString().slice(0, 10) : ""} /></label>
      <label>Display order<input className="field" type="number" name="sortOrder" defaultValue={job?.sortOrder || 0} /></label>
      <label className="full">Card summary<textarea className="field" required name="summary" rows={3} defaultValue={job?.summary} /></label>
      <label className="full">Role description<textarea className="field" name="description" rows={6} defaultValue={job?.description || ""} /></label>
      <label>Responsibilities <small>One per line</small><textarea className="field" name="responsibilities" rows={8} defaultValue={job?.responsibilities?.join("\n")} /></label>
      <label>Required criteria <small>One per line</small><textarea className="field" name="requirements" rows={8} defaultValue={job?.requirements?.join("\n")} /></label>
      <label className="full">Desirable criteria <small>One per line</small><textarea className="field" name="desirable" rows={5} defaultValue={job?.desirable?.join("\n")} /></label>
      <label>Status<select className="field" name="status" defaultValue={job?.status || "draft"}><option value="draft">Draft</option><option value="live">Live</option><option value="closed">Closed</option></select></label>
    </div>
    <div style={{ marginTop: 22, display: "flex", gap: 10 }}><SaveJobButton /><Link className="btn" href="/admin/jobs">Back</Link></div>
  </form>;
}
