type TimelineItem = {
  year: string;
  event: string;
};

type Award = {
  year: string;
  title: string;
  body?: string;
};

type Props = {
  eyebrow?: string;
  name?: string;
  title?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  timeline?: TimelineItem[];
  awards?: Award[];
};

export function DirectorProfile({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;

  const defaultTimeline: TimelineItem[] = [
    { year: "1985", event: "Completed Cert III in Horticulture, TAFE NSW" },
    { year: "1989", event: "Leading hand, major public projects in Western Sydney" },
    { year: "1995", event: "Site foreman, infrastructure landscaping for Roads & Maritime" },
    { year: "1999", event: "Founded Profile Landscapes, Petersham" },
    { year: "2004", event: "Opened the Petersham nursery yard" },
    { year: "2011", event: "Expanded to commercial and healthcare sectors" },
    { year: "2018", event: "Launched the plant encyclopedia initiative — 318 entries" },
    { year: "2024", event: "Studio now spans contracting, nursery, design and education" },
  ];

  const defaultAwards: Award[] = [
    { year: "2023", title: "AILA NSW Award — Civic Landscape", body: "Northmead Civic Plaza" },
    { year: "2022", title: "Landscape Industries Association — Excellence in Horticulture" },
    { year: "2021", title: "AILA NSW Award — Residential Under $500K" },
    { year: "2019", title: "Master Landscapers — Project of the Year" },
    { year: "2018", title: "HIA Landscape Award — Commercial Project" },
    { year: "2016", title: "Master Landscapers — Horticulture Excellence" },
    { year: "2014", title: "AILA NSW Commendation — Healthcare Landscape" },
    { year: "2012", title: "Landscape NSW — Small Business of the Year" },
    { year: "2009", title: "AILA NSW Award — Public Realm" },
  ];

  const timeline = p.timeline ?? defaultTimeline;
  const awards = p.awards ?? defaultAwards;

  return (
    <>
      {/* Director 2-col */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            {/* Director portrait placeholder */}
            <div style={{ position: "sticky", top: 88 }}>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.imageAlt || p.name || "Director"}
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 4 }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "3/4",
                    background: "var(--bone)",
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="32" r="18" stroke="var(--ink-2)" strokeWidth="1.5" fill="none"/>
                    <path d="M8 72 C8 56 21 48 40 48 C59 48 72 56 72 72" stroke="var(--ink-2)" strokeWidth="1.5" fill="none"/>
                  </svg>
                  <span style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 18, color: "var(--ink-2)" }}>
                    {p.name || "Carlo Capogreco"}
                  </span>
                </div>
              )}
            </div>

            <div>
              {p.eyebrow && (
                <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>{p.eyebrow}</span>
              )}
              <h2
                className="display"
                style={{ margin: "0 0 8px", fontSize: "clamp(32px,4vw,52px)", fontWeight: 400, letterSpacing: "-0.02em" }}
              >
                {p.name || "Carlo Capogreco"}
              </h2>
              <p style={{ margin: "0 0 28px", fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                {p.title || "Founder & Director"}
              </p>
              {p.body ? (
                p.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: "0 0 18px", fontSize: 16.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
                    {para}
                  </p>
                ))
              ) : (
                <>
                  <p style={{ margin: "0 0 18px", fontSize: 16.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
                    Carlo Capogreco founded Profile Landscapes in 1999 after fifteen years working on public infrastructure and residential projects across metropolitan Sydney. He started as a horticulture apprentice in 1985 and worked his way through every role in the industry before striking out on his own.
                  </p>
                  <p style={{ margin: "0 0 18px", fontSize: 16.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
                    The practice he built is defined by a simple idea: that the people who design a landscape should be able to build it, and the people who build it should be able to grow the plants. Profile Landscapes is one of the few Sydney practices where all three happen under the same roof.
                  </p>
                  <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
                    Carlo remains hands-on — estimating, tendering and reviewing design work with the same attention to detail as he did in 1999. He holds a Certificate IV in Horticulture and is a member of the Australian Institute of Landscape Architects.
                  </p>
                </>
              )}

              {/* Career timeline */}
              <div style={{ marginTop: 48, borderTop: "1px solid var(--line-2)", paddingTop: 32 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 24 }}>
                  Career timeline
                </div>
                {timeline.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "52px 1fr",
                      gap: 20,
                      padding: "12px 0",
                      borderBottom: i < timeline.length - 1 ? "1px solid var(--line-2)" : "none",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "var(--accent)", fontWeight: 500, fontFamily: "var(--display)" }}>{item.year}</span>
                    <span style={{ color: "var(--ink)", lineHeight: 1.5 }}>{item.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Certifications */}
      <section style={{ padding: "80px 0" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>Recognition</span>
              <h3 className="display" style={{ margin: "0 0 36px", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 400, letterSpacing: "-0.02em" }}>
                Awards &amp; certifications.
              </h3>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--line-2)" }}>
                {awards.map((award, i) => (
                  <li
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "52px 1fr",
                      gap: 20,
                      padding: "16px 0",
                      borderBottom: "1px solid var(--line-2)",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "var(--accent)", fontFamily: "var(--display)", fontSize: 15 }}>{award.year}</span>
                    <div>
                      <div style={{ color: "var(--ink)", fontWeight: 500, lineHeight: 1.4 }}>{award.title}</div>
                      {award.body && (
                        <div style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 2 }}>{award.body}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certifications grid */}
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>Accreditation</span>
              <h3 className="display" style={{ margin: "0 0 36px", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 400, letterSpacing: "-0.02em" }}>
                Certified &amp; insured.
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--line-2)", border: "1px solid var(--line-2)" }}>
                {[
                  { icon: "🪪", title: "Contractor's Licence", detail: "NSW Fair Trading — Landscape Contracting" },
                  { icon: "🛡", title: "Public Liability", detail: "$20M cover — all sites and operations" },
                  { icon: "🌿", title: "AILA Member", detail: "Australian Institute of Landscape Architects" },
                  { icon: "⭐", title: "Master Landscapers", detail: "Industry association — accredited member" },
                ].map((cert, i) => (
                  <div key={i} style={{ background: "var(--paper)", padding: "28px 24px" }}>
                    <div style={{ fontSize: 28, marginBottom: 14 }}>{cert.icon}</div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
                      {cert.title}
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)" }}>{cert.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
