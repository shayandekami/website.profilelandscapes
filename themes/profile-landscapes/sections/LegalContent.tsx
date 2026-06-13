type LegalSection = {
  heading: string;
  /** Paragraphs of body text. Lines starting with "- " render as a bullet list. */
  body: string[];
};

type Props = {
  sections?: LegalSection[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function LegalContent({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const sections = p.sections ?? [];
  if (sections.length === 0) return null;

  return (
    <section style={{ padding: "70px 0 100px" }}>
      <div
        className="wrap"
        style={{
          maxWidth: 1080,
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 70,
          alignItems: "start",
        }}
      >
        {/* TOC sidebar */}
        <nav
          style={{
            position: "sticky",
            top: 100,
            alignSelf: "start",
            borderLeft: "1px solid var(--line, rgba(19,48,36,0.15))",
            paddingLeft: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--ink-2)",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Contents
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sections.map((s, i) => (
              <li key={i} style={{ padding: "7px 0", fontSize: 13.5 }}>
                <a
                  href={`#${slugify(s.heading)}`}
                  style={{ color: "var(--ink-2)", textDecoration: "none" }}
                >
                  <span style={{ color: "var(--accent)", marginRight: 10, letterSpacing: "0.1em", fontSize: 11 }}>
                    {pad(i + 1)}
                  </span>
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Body */}
        <div style={{ maxWidth: "68ch" }}>
          {sections.map((s, i) => (
            <div key={i}>
              <h2
                id={slugify(s.heading)}
                className="display"
                style={{
                  fontWeight: 400,
                  fontSize: 28,
                  margin: i === 0 ? "0 0 14px" : "54px 0 14px",
                  letterSpacing: "-0.01em",
                  scrollMarginTop: 90,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--accent)", letterSpacing: "0.14em", marginRight: 14, fontWeight: 500 }}>
                  {pad(i + 1)}
                </span>
                {s.heading}
              </h2>
              {s.body.map((para, j) => {
                // Bullet block: consecutive lines starting with "- "
                if (para.startsWith("- ")) {
                  const items = para.split("\n").map((l) => l.replace(/^-\s*/, ""));
                  return (
                    <ul key={j} style={{ margin: "0 0 16px", paddingLeft: 20, color: "var(--ink-2)", fontSize: 15.5, lineHeight: 1.7 }}>
                      {items.map((it, k) => (
                        <li key={k} style={{ marginBottom: 6 }}>{it}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={j} style={{ margin: "0 0 16px", color: "var(--ink-2)", fontSize: 15.5, lineHeight: 1.7 }}>
                    {para}
                  </p>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
