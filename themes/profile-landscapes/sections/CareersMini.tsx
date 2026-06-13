type Role = {
  title: string;
  type: string;
  href?: string;
};

type Props = {
  eyebrow?: string;
  title?: string;
  titleItalic?: string;
  body?: string;
  cta?: { label: string; href: string };
  roles?: Role[];
};

export function CareersMini({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;

  const defaultRoles: Role[] = [
    { title: "Landscape Foreman", type: "Full-time · Site", href: "/careers" },
    { title: "Horticulturist", type: "Full-time · Nursery", href: "/careers" },
    { title: "Landscape Estimator", type: "Full-time · Office", href: "/careers" },
    { title: "Apprentice Landscaper", type: "Apprenticeship", href: "/careers" },
    { title: "Project Manager", type: "Full-time · Site/Office", href: "/careers" },
  ];

  const roles = p.roles ?? defaultRoles;

  return (
    <section className="careers-mini">
      <div className="wrap">
        <div className="cm-grid">
          {/* Left column */}
          <div>
            {p.eyebrow && <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>{p.eyebrow}</span>}
            <h2 className="display">
              {p.title ?? "Build something"}
              {p.titleItalic && (
                <>
                  <br />
                  <em style={{ fontStyle: "italic" }}>{p.titleItalic}</em>
                </>
              )}
            </h2>
            <p>
              {p.body ??
                "We are always looking for skilled landscapers, horticulturists and estimators. A career at Profile Landscapes means real projects, real craft, and genuine career progression."}
            </p>
            {p.cta && (
              <a href={p.cta.href} className="btn-primary">
                {p.cta.label}
              </a>
            )}
          </div>

          {/* Right column — role list */}
          <div>
            <ul className="role-list">
              {roles.map((role, i) => (
                <li key={i}>
                  <a href={role.href ?? "/careers"}>
                    <span className="rl">{role.title}</span>
                    <span className="rr">{role.type}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
