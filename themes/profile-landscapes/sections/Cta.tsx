type MetaItem = { key: string; value: string };
type CTA = { label: string; href: string };
type Props = {
  eyebrow?: string;
  title?: string;
  titleItalic?: string;
  headline?: string;
  body?: string;
  cta?: CTA;
  button?: CTA;
  metaItems?: MetaItem[];
};

export function Cta({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const heading = p.title || p.headline;
  const link = p.cta || p.button;

  return (
    <section className="cta-band" style={{ padding: "96px 0", background: "var(--ink)", color: "#e8e5db" }}>
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: p.metaItems ? "1fr 1fr" : "1fr",
            gap: "72px",
            alignItems: "start",
          }}
        >
          {/* Left: headline + body + CTA */}
          <div>
            {p.eyebrow && (
              <span
                className="eyebrow"
                style={{ display: "block", marginBottom: 16, color: "var(--cream, #e8dcb6)" }}
              >
                {p.eyebrow}
              </span>
            )}
            {heading && (
              <h2
                className="display"
                style={{ margin: 0, fontSize: "clamp(40px,5vw,68px)", color: "#fff", lineHeight: 1.02 }}
              >
                {heading}
                {p.titleItalic && (
                  <>
                    <br />
                    <span style={{ fontStyle: "italic", color: "#e8dcb6" }}>{p.titleItalic}</span>
                  </>
                )}
              </h2>
            )}
            {p.body && (
              <p style={{ marginTop: 22, maxWidth: "46ch", fontSize: 17, color: "#c8c2b0", lineHeight: 1.6 }}>
                {p.body}
              </p>
            )}
            {link && (
              <a
                href={link.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginTop: 32,
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "#fff",
                  color: "var(--ink)",
                  fontWeight: 500,
                  fontSize: 14.5,
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
              >
                {link.label}
              </a>
            )}
          </div>

          {/* Right: meta table */}
          {p.metaItems && p.metaItems.length > 0 && (
            <div style={{ marginTop: "auto", paddingTop: 8 }}>
              {p.metaItems.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    gap: 16,
                    padding: "14px 0",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a39b85", paddingTop: 3 }}>
                    {item.key}
                  </span>
                  <span style={{ color: "#c8c2b0" }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
