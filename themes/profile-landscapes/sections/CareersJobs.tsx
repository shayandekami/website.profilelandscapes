type Job = {
  id: number;
  title: string;
  team: string;
  location: string;
  employmentType: string;
  summary: string;
  requirements: string[];
};

export function CareersJobs({ jobs }: { jobs: Job[] }) {
  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--line-2)" }}>
      <div className="wrap">
        <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20 }}>
          <div>
            <span className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Open roles</span>
            <h2 className="display" style={{ margin: 0, fontSize: "clamp(32px,4vw,48px)", fontWeight: 400 }}>
              Current <em style={{ color: "var(--accent)" }}>opportunities.</em>
            </h2>
            <p style={{ maxWidth: 680, color: "var(--ink-2)", lineHeight: 1.6 }}>
              These openings are managed directly by our hiring team. Review the current responsibilities and requirements before applying.
            </p>
          </div>
          <a href="/careers/apply" style={{ fontSize: 13.5, color: "var(--ink)", whiteSpace: "nowrap" }}>General application →</a>
        </div>
        {jobs.length === 0 ? (
          <div style={{ padding: "34px 0", borderTop: "1px solid var(--line-2)", borderBottom: "1px solid var(--line-2)", color: "var(--ink-2)" }}>
            There are no published vacancies right now, but we still welcome expressions of interest.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--line-2)" }}>
            {jobs.map((job) => (
              <li key={job.id} style={{ borderBottom: "1px solid var(--line-2)" }}>
                <a href={`/careers/apply?job=${job.id}`} className="role-link careers-role-grid" style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) minmax(260px,1.4fr) auto", gap: 24, alignItems: "center", padding: "24px 4px", textDecoration: "none", color: "var(--ink)" }}>
                  <div><span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 10.5, textTransform: "uppercase", background: "#e8f4f0", color: "#1f5a3d", marginBottom: 8 }}>{job.employmentType}</span><div style={{ fontFamily: "var(--display)", fontSize: 21 }}>{job.title}</div><div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 5 }}>{job.team} · {job.location}</div></div>
                  <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)" }}>{job.summary}{job.requirements[0] && <div style={{ marginTop: 7, fontSize: 12.5 }}><strong>Key requirement:</strong> {job.requirements[0]}</div>}</div>
                  <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>View & apply →</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
