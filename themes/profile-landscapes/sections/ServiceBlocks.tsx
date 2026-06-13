type ServiceBlock = {
  number: string;
  title: string;
  body: string;
  activities?: string[];
  team?: string;
  cta?: { label: string; href: string };
};

type Props = {
  services?: ServiceBlock[];
};

export function ServiceBlocks({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;

  const defaultServices: ServiceBlock[] = [
    {
      number: "01",
      title: "Cost Planning & Estimating",
      body: "In-house estimating through Buildsoft and Cubit. We prepare competitive BOQs for tendered and negotiated contracts, and provide cost planning advice from concept stage.",
      activities: ["BOQ preparation", "Cubit / Buildsoft estimating", "Variation management", "Preliminary cost plans", "Trade pricing"],
      team: "Studio · Petersham",
    },
    {
      number: "02",
      title: "Construction Management",
      body: "Hard and soft works delivery across residential, commercial, civic and healthcare sectors. We self-perform all landscape works — no subcontracting the core scope.",
      activities: ["Site clearing & bulk earthworks", "Hard paving & structure", "Soft landscaping & planting", "Irrigation & drainage systems", "Maintenance & defects"],
      team: "Site · Sydney Metro",
      cta: { label: "View projects →", href: "/projects" },
    },
    {
      number: "03",
      title: "Landscape Design",
      body: "Concept design, master planning, planting plans and 3D visualisation. Drawn by the same team that builds the work — which means every detail is constructable.",
      activities: ["Concept design & options", "Master planting plans", "3D visualisation", "Construction documentation", "Specification writing"],
      team: "Studio · Petersham",
      cta: { label: "Design studio →", href: "/landscape-design" },
    },
    {
      number: "04",
      title: "Horticulture & Nursery",
      body: "4,800+ plants grown at our Petersham yard. Retail and trade sales. Species sourced from our own nursery whenever possible — guaranteed availability and quality.",
      activities: ["Retail plant sales", "Trade supply & delivery", "Custom growing programmes", "Plant procurement", "Species sourcing advice"],
      team: "Nursery · Petersham",
      cta: { label: "Browse nursery →", href: "/plants" },
    },
    {
      number: "05",
      title: "Maintenance",
      body: "Scheduled maintenance programmes for completed projects and managed landscapes. We maintain what we build — continuity of knowledge, continuity of standard.",
      activities: ["Scheduled site maintenance", "Irrigation management", "Seasonal replanting", "Pruning & mulching", "Defect liability management"],
      team: "Site · Sydney Metro",
    },
  ];

  const services = p.services ?? defaultServices;

  return (
    <section style={{ borderTop: "1px solid var(--line-2)" }}>
      <div className="wrap">
        {services.map((service, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr 1fr",
              gap: "0 60px",
              padding: "64px 0",
              borderBottom: "1px solid var(--line-2)",
              alignItems: "start",
            }}
          >
            {/* Number */}
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: 48,
                fontWeight: 400,
                color: "rgba(19,48,36,0.15)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {service.number}
            </div>

            {/* Left: title + body + team */}
            <div>
              <h3
                className="display"
                style={{
                  margin: "0 0 16px",
                  fontSize: "clamp(24px,2.8vw,36px)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {service.title}
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.65, color: "var(--ink-2)", maxWidth: "46ch" }}>
                {service.body}
              </p>
              {service.team && (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    border: "1px solid rgba(31,90,61,0.25)",
                    padding: "4px 10px",
                    borderRadius: 3,
                  }}
                >
                  {service.team}
                </span>
              )}
              {service.cta && (
                <div style={{ marginTop: 24 }}>
                  <a
                    href={service.cta.href}
                    style={{
                      fontSize: 14,
                      color: "var(--ink)",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: 2,
                      textDecoration: "none",
                    }}
                  >
                    {service.cta.label}
                  </a>
                </div>
              )}
            </div>

            {/* Right: activities */}
            {service.activities && service.activities.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--ink-2)",
                    marginBottom: 16,
                  }}
                >
                  Key activities
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {service.activities.map((activity, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "10px 0",
                        borderTop: j === 0 ? "1px solid var(--line-2)" : "none",
                        borderBottom: "1px solid var(--line-2)",
                        fontSize: 14.5,
                        color: "var(--ink)",
                      }}
                    >
                      <span style={{ color: "var(--accent)", fontSize: 16, marginTop: 1, flexShrink: 0 }}>→</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
