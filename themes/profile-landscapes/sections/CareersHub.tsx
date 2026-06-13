type Role = {
  title: string;
  type: "apprentice" | "labourer" | "foreman" | "office" | "trade";
  team: string;
  href?: string;
};

type Benefit = {
  icon: string;
  label: string;
  detail: string;
};

type PathStage = {
  number: string;
  title: string;
  time: string;
  description: string;
};

type Props = {
  eyebrow?: string;
  title?: string;
  titleItalic?: string;
  body?: string;
  roles?: Role[];
  benefits?: Benefit[];
  pathway?: PathStage[];
};

const roleColors: Record<string, { bg: string; fg: string }> = {
  apprentice: { bg: "#e8f4f0", fg: "#1f5a3d" },
  labourer: { bg: "#f0f0e8", fg: "#4a4a1a" },
  foreman: { bg: "#133024", fg: "#e8dcb6" },
  office: { bg: "#f4efe4", fg: "#133024" },
  trade: { bg: "#e8e8f4", fg: "#1a1a4a" },
};

export function CareersHub({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;

  const defaultRoles: Role[] = [
    { title: "Landscape Foreman", type: "foreman", team: "Site · Western Sydney" },
    { title: "Horticulturist", type: "trade", team: "Nursery · Petersham" },
    { title: "Landscape Estimator", type: "office", team: "Office · Petersham" },
    { title: "Apprentice Landscaper", type: "apprentice", team: "Site · Various" },
    { title: "Project Manager", type: "office", team: "Site/Office · Sydney" },
    { title: "Leading Hand", type: "labourer", team: "Site · Sydney Metro" },
    { title: "Landscape Labourer", type: "labourer", team: "Site · Various" },
  ];

  const defaultPathway: PathStage[] = [
    { number: "01", title: "Apprentice / Labourer", time: "Year 1–3", description: "On-site fundamentals. Plant identification, installation, tools, OH&S, site safety culture." },
    { number: "02", title: "Trade Landscaper", time: "Year 3–5", description: "Autonomous delivery. Reading plans, managing sub-contractors, quality control, client interface." },
    { number: "03", title: "Leading Hand", time: "Year 5–8", description: "Small crew leadership. Programme management, procurement liaison, defects resolution." },
    { number: "04", title: "Foreman", time: "Year 8–12", description: "Full project ownership. BOQ sign-off, variation management, site safety accountability." },
    { number: "05", title: "Project Manager", time: "Year 12+", description: "Portfolio delivery. Estimating, client relationship management, team development." },
  ];

  const defaultBenefits: Benefit[] = [
    { icon: "📈", label: "Clear pathway", detail: "Five-stage career progression, documented and reviewed annually." },
    { icon: "🌿", label: "In-house nursery", detail: "Staff plant allowance and nursery access at trade prices." },
    { icon: "🧰", label: "Tools supplied", detail: "All site tools and safety equipment provided from day one." },
    { icon: "📚", label: "Training support", detail: "TAFE fees and time supported for Cert III/IV in Horticulture." },
    { icon: "🏥", label: "Health cover", detail: "Private health contribution for permanent employees." },
    { icon: "🚐", label: "Transport", detail: "Company vehicle or travel allowance for site crew." },
    { icon: "☀️", label: "RDOs", detail: "Rostered days off accrued in line with the Award." },
    { icon: "🏆", label: "Profit share", detail: "Annual bonus pool for foremen and PMs tied to project performance." },
  ];

  const roles = p.roles ?? defaultRoles;
  const pathway = p.pathway ?? defaultPathway;
  const benefits = p.benefits ?? defaultBenefits;

  return (
    <>
      {/* Hero intro */}
      <section style={{ padding: "72px 0 56px", borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end" }}>
            <div>
              {p.eyebrow && <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>{p.eyebrow}</span>}
              <h2 className="display" style={{ margin: 0, fontSize: "clamp(40px,5vw,64px)", fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.02 }}>
                {p.title ?? "Build a career"}
                {(p.titleItalic ?? "that grows with you.") && (
                  <>
                    <br />
                    <em style={{ fontStyle: "italic", color: "var(--accent)" }}>{p.titleItalic ?? "that grows with you."}</em>
                  </>
                )}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: "var(--ink-2)" }}>
              {p.body ?? "Profile Landscapes is a growing Sydney practice. We promote from within, support apprenticeships and invest in the people who make our projects possible. Open roles across site, nursery and office."}
            </p>
          </div>
        </div>
      </section>

      {/* Growth pathway */}
      <section style={{ padding: "80px 0", background: "var(--bone)", borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap">
          <div style={{ marginBottom: 44 }}>
            <span className="eyebrow" style={{ display: "block", marginBottom: 10 }}>Career pathway</span>
            <h3 className="display" style={{ margin: 0, fontSize: "clamp(28px,3vw,40px)", fontWeight: 400, letterSpacing: "-0.02em" }}>
              Five stages. One practice.
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, position: "relative" }}>
            {/* Connecting line */}
            <div style={{ position: "absolute", top: 28, left: "10%", right: "10%", height: 1, background: "var(--line)", zIndex: 0 }} />
            {pathway.map((stage, i) => (
              <div key={i} style={{ position: "relative", zIndex: 1, paddingRight: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: i === 4 ? "var(--ink)" : "var(--bone)", border: "2px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 18, fontWeight: 400, color: i === 4 ? "#fff" : "var(--ink)", marginBottom: 20 }}>
                  {stage.number}
                </div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>{stage.time}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 400, color: "var(--ink)", marginBottom: 10 }}>{stage.title}</div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-2)" }}>{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap">
          <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Open roles</span>
              <h3 className="display" style={{ margin: 0, fontSize: "clamp(28px,3vw,40px)", fontWeight: 400, letterSpacing: "-0.02em" }}>
                {roles.length} positions available
              </h3>
            </div>
            <a href="/contact" style={{ fontSize: 13.5, color: "var(--ink)", borderBottom: "1px solid var(--line)", paddingBottom: 2, textDecoration: "none" }}>
              Apply directly →
            </a>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--line-2)" }}>
            {roles.map((role, i) => {
              const colors = roleColors[role.type] ?? roleColors.office;
              return (
                <li key={i} style={{ borderBottom: "1px solid var(--line-2)" }}>
                  <a
                    href={role.href ?? "/contact"}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "22px 4px",
                      textDecoration: "none",
                      color: "var(--ink)",
                      transition: "padding 0.2s",
                      gap: 20,
                    }}
                    className="role-link"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11.5, letterSpacing: "0.05em", textTransform: "uppercase", background: colors.bg, color: colors.fg, fontWeight: 500, flexShrink: 0 }}>
                        {role.type}
                      </span>
                      <span style={{ fontFamily: "var(--display)", fontSize: 20, letterSpacing: "-0.005em" }}>{role.title}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--ink-2)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{role.team} →</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Benefits grid */}
      <section style={{ padding: "80px 0" }}>
        <div className="wrap">
          <div style={{ marginBottom: 44 }}>
            <span className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Why Profile Landscapes</span>
            <h3 className="display" style={{ margin: 0, fontSize: "clamp(28px,3vw,40px)", fontWeight: 400, letterSpacing: "-0.02em" }}>
              What we offer.
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--line-2)", border: "1px solid var(--line-2)" }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ background: "var(--paper)", padding: "32px 28px" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{b.icon}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 400, color: "var(--ink)", marginBottom: 10 }}>{b.label}</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>{b.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
