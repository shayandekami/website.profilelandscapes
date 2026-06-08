"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContactForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Could not send. Please try again.");
      }
      router.push("/thank-you");
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
          </div>

          <form className="form-card" onSubmit={onSubmit}>
            <h3>Request a quote</h3>
            <p className="lede">
              Tell us about the project — we&apos;ll be in touch shortly.
            </p>
            {error && (
              <div className="form-error" style={{ color: "#c2783a", marginBottom: 12 }}>
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
              <label>
                Project brief <span className="req">*</span>
              </label>
              <textarea
                required
                name="brief"
                placeholder="Location, scope, timeframe, links to drawings / BOQ…"
              />
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
              We reply to all enquiries within three working days.
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
