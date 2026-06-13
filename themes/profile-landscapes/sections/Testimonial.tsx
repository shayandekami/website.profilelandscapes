type Props = {
  quote?: string;
  attribution?: string;
  role?: string;
  company?: string;
};

export function Testimonial({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;

  return (
    <section className="quote-band">
      <div className="wrap">
        <figure className="big-quote">
          <span className="q" aria-hidden="true">&ldquo;</span>
          <p>
            {p.quote ??
              "Profile Landscapes delivered a technically complex project on time and to a very high standard. Their in-house nursery supply was a genuine differentiator — quality plants, guaranteed availability."}
          </p>
          <footer>
            <div>
              <span className="name">
                {p.attribution ?? "James Rafferty"}
              </span>
              {(p.role || p.company) && (
                <span style={{ marginLeft: 8 }}>
                  — {[p.role, p.company].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </footer>
        </figure>
      </div>
    </section>
  );
}
