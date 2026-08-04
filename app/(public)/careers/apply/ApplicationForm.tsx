"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Job = {
  id: number;
  title: string;
  team: string;
  location: string;
  employmentType: string;
  summary: string;
  description: string | null;
  responsibilities: string[];
  requirements: string[];
  desirable: string[];
  salaryRange: string | null;
};

export function ApplicationForm({ jobs, selectedJobId, role }: { jobs: Job[]; selectedJobId?: number; role?: string }) {
  const router = useRouter();
  const [jobId, setJobId] = useState(selectedJobId ? String(selectedJobId) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = jobs.find((job) => String(job.id) === jobId);

  async function submit(formData: FormData) {
    setBusy(true);
    setError("");
    const resume = formData.get("resume");
    if (!(resume instanceof File) || resume.size === 0) {
      setError("Attach your CV or résumé before submitting.");
      setBusy(false);
      return;
    }
    if (resume.size > 8 * 1024 * 1024) {
      setError("Your CV is larger than 8 MB. Compress it or attach a smaller PDF.");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch("/api/careers/apply", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not submit your application.");
      router.push(`/careers/application/${result.token}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not submit your application.");
      setBusy(false);
    }
  }

  return (
    <div className="career-apply-layout">
      <aside className="career-job-panel">
        <span className="eyebrow">Application</span>
        <h1 className="display">Join the team.</h1>
        <p>Tell us about your experience and the work you want to do. Applications are reviewed by a person, usually within five business days.</p>
        {selected && (
          <div className="career-job-summary">
            <span>{selected.employmentType}</span>
            <h2>{selected.title}</h2>
            <p>{selected.team} · {selected.location}</p>
            <p>{selected.summary}</p>
            {selected.salaryRange && <p><strong>Indicative range:</strong> {selected.salaryRange}</p>}
            {selected.responsibilities.length > 0 && <><h3>What you’ll do</h3><ul>{selected.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></>}
            {selected.requirements.length > 0 && <><h3>What you’ll bring</h3><ul>{selected.requirements.map((item) => <li key={item}>{item}</li>)}</ul></>}
            {selected.desirable.length > 0 && <><h3>Useful, not essential</h3><ul>{selected.desirable.map((item) => <li key={item}>{item}</li>)}</ul></>}
          </div>
        )}
        <div className="career-process">
          <h3>What happens next</h3>
          <ol>
            <li><b>Confirmation immediately.</b> You’ll receive a private tracking link.</li>
            <li><b>Review within 5 business days.</b> We assess experience and role fit.</li>
            <li><b>Conversation.</b> Shortlisted candidates have a phone call, then a practical or team interview.</li>
            <li><b>Outcome.</b> We update every application, including when we cannot progress it.</li>
          </ol>
        </div>
      </aside>

      <form action={submit} className="career-application-form">
        <h2>Candidate details</h2>
        <label className="full">Role
          <select name="jobId" value={jobId} onChange={(event) => setJobId(event.target.value)}>
            <option value="">General expression of interest</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.title} — {job.location}</option>)}
          </select>
        </label>
        <input type="hidden" name="roleInterest" value={selected?.title || role || "General expression of interest"} />
        <label>First name<input required name="firstName" autoComplete="given-name" maxLength={100} /></label>
        <label>Last name<input required name="lastName" autoComplete="family-name" maxLength={100} /></label>
        <label>Email<input required type="email" name="email" autoComplete="email" maxLength={255} /></label>
        <label>Phone<input required name="phone" autoComplete="tel" maxLength={60} /></label>
        <label className="full">Suburb / location<input name="suburb" autoComplete="address-level2" maxLength={160} /></label>

        <h2 className="full">Professional profile</h2>
        <label>LinkedIn profile<input type="url" name="linkedinUrl" placeholder="https://linkedin.com/in/…" maxLength={500} /></label>
        <label>Portfolio or website<input type="url" name="portfolioUrl" placeholder="https://…" maxLength={500} /></label>
        <label>Relevant experience
          <select name="yearsExperience">
            <option value="">Select</option><option>Entry level / apprentice</option><option>1–2 years</option>
            <option>3–5 years</option><option>6–10 years</option><option>10+ years</option>
          </select>
        </label>
        <label>Availability<input name="availability" placeholder="e.g. Four weeks’ notice" maxLength={120} /></label>
        <label className="full">Australian work rights
          <select required name="workRights" defaultValue="">
            <option value="" disabled>Select</option><option>Australian citizen</option><option>Permanent resident</option>
            <option>Valid unrestricted work visa</option><option>Restricted work visa</option><option>Sponsorship required</option>
          </select>
        </label>
        <label className="career-check full"><input type="checkbox" name="driversLicence" value="true" /> I hold a current Australian driver licence</label>
        <label className="full">Why Profile Landscapes, and why this role?
          <textarea required name="coverLetter" rows={7} minLength={80} maxLength={6000} placeholder="Tell us about relevant work, what you enjoy doing, and what you’d like to develop next." />
        </label>
        <label className="career-upload full">CV / résumé
          <input required type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
          <small>PDF, DOC or DOCX · maximum 8 MB. Stored privately and only available to authorised hiring staff.</small>
        </label>
        <label className="career-check full"><input required type="checkbox" name="consent" value="true" /> I consent to Profile Landscapes storing my application for recruitment purposes and confirm the information is accurate.</label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1 }} />
        {error && <div className="career-form-error full" role="alert">{error}</div>}
        <button className="career-submit full" disabled={busy}>{busy ? "Submitting securely…" : "Submit application →"}</button>
      </form>
    </div>
  );
}
