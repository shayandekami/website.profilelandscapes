"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContactFormProps = {
  tenderTitle?: string;
  tenderBody?: string;
  tenderEmail?: string;
  tenderSubject?: string;
};

export function ContactForm({ props }: { props?: Record<string, unknown> }) {
  const content = (props || {}) as ContactFormProps;
  const tenderEmail = content.tenderEmail || "carlo@profilelandscapes.com.au";
  const tenderSubject = content.tenderSubject || "Tender invitation - project name / suburb";
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.getAll("services").length === 0) {
      setError("Select at least one service so we can direct your enquiry correctly.");
      form.querySelector<HTMLElement>(".quote-service-grid")?.focus();
      setSubmitting(false);
      return;
    }
    const files = data.getAll("attachments").filter((item): item is File => item instanceof File && item.size > 0);
    if (files.length > 6 || files.some((file) => file.size > 15 * 1024 * 1024) || files.reduce((sum, file) => sum + file.size, 0) > 40 * 1024 * 1024) {
      setError("Check the documents: maximum 6 files, 15 MB each and 40 MB combined.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        body: data,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Could not send. Please try again.");
      }
      const result = await res.json();
      router.push(`/thank-you?ref=${encodeURIComponent(result.referenceCode)}&token=${encodeURIComponent(result.accessToken)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="wrap">
        <div className="contact-page">
          <div className="addr">
            <span className="eyebrow">Studio &amp; contact</span>
            <h2 style={{ marginTop: 14 }}>
              Petersham,
              <br />
              <span className="it">Sydney.</span>
            </h2>
            <div className="row">
              <span className="k">Email</span>
              <span>
                <a href="mailto:carlo@profilelandscapes.com.au">
                  carlo@profilelandscapes.com.au
                </a>
              </span>
            </div>
            <div className="row">
              <span className="k">Phone</span>
              <span>
                <a href="tel:+61295685868">(02) 9568 5868</a>
              </span>
            </div>
            <div className="row">
              <span className="k">Studio</span>
              <span>
                16 New Canterbury Rd
                <br />
                Petersham NSW 2049
              </span>
            </div>
            <div className="row">
              <span className="k">Principal</span>
              <span>Carlo Capogreco · Director</span>
            </div>
            <div className="row">
              <span className="k">Hours</span>
              <span>Mon – Fri, 7.00am – 5.00pm</span>
            </div>
            <div className="tender-invite-card">
              <span className="eyebrow">Documented projects</span>
              <h3>{content.tenderTitle || "Invite us to tender"}</h3>
              <p>{content.tenderBody || "Already have a documented project or formal tender package? Email Carlo directly with the drawings, specification, BOQ, closing date and site contact."}</p>
              <a href={`mailto:${tenderEmail}?subject=${encodeURIComponent(tenderSubject)}`}>
                {tenderEmail} →
              </a>
              <small>Suggested subject: {tenderSubject}</small>
            </div>
          </div>

          <form className="form-card" onSubmit={onSubmit}>
            <h3>Request a quote</h3>
            <p className="lede">
              Tell us about the project — we&apos;ll be in touch shortly.
            </p>
            {error && (
              <div className="form-error" role="alert" aria-live="polite" style={{ color: "#c2783a", marginBottom: 12 }}>
                {error}
              </div>
            )}

            <div className="grid-2">
              <div className="field">
                <label>
                  Name <span className="req">*</span>
                </label>
                <input required name="name" type="text" placeholder="Your name" />
              </div>
              <div className="field">
                <label>Company</label>
                <input name="company" type="text" placeholder="Organisation" />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>
                  Email <span className="req">*</span>
                </label>
                <input required name="email" type="email" placeholder="you@company.com" />
              </div>
              <div className="field">
                <label>Phone</label>
                <input name="phone" type="tel" placeholder="04XX XXX XXX" />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Site address / suburb <span className="req">*</span></label>
                <input required name="siteAddress" placeholder="Project address or suburb" />
              </div>
              <div className="field">
                <label>Postcode <span className="req">*</span></label>
                <input required name="postcode" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="2049" />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Project type</label>
                <select name="sector" defaultValue="">
                  <option value="">Select…</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Civic &amp; Public</option>
                  <option>Healthcare &amp; Education</option>
                  <option>Hospitality</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label>Approximate budget</label>
                <select name="budget" defaultValue="">
                  <option value="">Select…</option>
                  <option>Under $100K</option>
                  <option>$100K – $500K</option>
                  <option>$500K – $1M</option>
                  <option>$1M – $5M</option>
                  <option>$5M+</option>
                  <option>Not yet known</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Services required <span className="req">*</span></label>
              <div className="quote-service-grid" tabIndex={-1}>
                {["Landscape construction", "Landscape design", "Planting / softscape", "Irrigation", "Maintenance", "Nursery supply", "Tender pricing", "Other"].map((service) => (
                  <label key={service} className="quote-check"><input type="checkbox" name="services" value={service} /> {service}</label>
                ))}
              </div>
            </div>
            <div className="grid-2">
              <div className="field"><label>Project stage <span className="req">*</span></label><select required name="projectStage" defaultValue=""><option value="">Select…</option><option>Early feasibility</option><option>Concept design</option><option>Development application</option><option>Construction documentation</option><option>Tender / pricing</option><option>Ready to commence</option><option>Existing landscape / maintenance</option></select></div>
              <div className="field"><label>Preferred start</label><select name="desiredStart" defaultValue=""><option value="">Select…</option><option>As soon as possible</option><option>Within 1–3 months</option><option>Within 3–6 months</option><option>Within 6–12 months</option><option>More than 12 months</option><option>Not yet known</option></select></div>
            </div>
            <div className="grid-2">
              <div className="field"><label>Tender / response due</label><input type="date" name="tenderDue" /></div>
              <div className="field"><label>Architect / designer</label><input name="architect" maxLength={200} placeholder="Practice or consultant, if appointed" /></div>
            </div>
            <div className="field"><label>Preferred contact</label><select name="contactPreference" defaultValue="Email"><option>Email</option><option>Phone</option><option>Either email or phone</option></select></div>
            <div className="field">
              <label>
                Project brief <span className="req">*</span>
              </label>
              <textarea
                required
                name="brief"
                minLength={80}
                placeholder="Location, scope, timeframe, links to drawings / BOQ…"
              />
            </div>
            <div className="field quote-upload">
              <label>Drawings and project documents</label>
              <input type="file" name="attachments" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.dwg,.dxf,.zip" />
              <small>Up to 6 files: drawings, specifications, BOQ, site photos, surveys or tender documents. Maximum 15 MB each and 40 MB total. Stored privately.</small>
            </div>
            {/* honeypot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", left: "-10000px", width: 1, height: 1 }}
            />
            <button className="form-submit" type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send enquiry →"}
            </button>
            <div className="form-note">
              We reply to all enquiries within two business days.
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
