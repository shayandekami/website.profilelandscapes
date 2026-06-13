type CTA = { label: string; href: string };
type Props = {
  eyebrow?: string;
  title?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  imageLeft?: boolean;
  imagePosition?: "left" | "right";
  cta?: CTA;
};

function renderBody(text: string) {
  return text.split(/\n\n+/).map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} style={{ margin: "0 0 16px" }}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

export function TwoCol({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const imgLeft = p.imageLeft ?? p.imagePosition === "left";

  return (
    <section className="twocol fade-target">
      <div className="wrap">
        <div
          className="twocol-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "72px",
            alignItems: "center",
          }}
        >
          {imgLeft && p.image && (
            <div className="twocol-image" style={{ borderRadius: 4, overflow: "hidden", aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.imageAlt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div className="twocol-text" style={{ order: imgLeft ? 2 : 1 }}>
            {p.eyebrow && (
              <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>
                {p.eyebrow}
              </span>
            )}
            {p.title && (
              <h2 className="display" style={{ margin: "0 0 22px", fontSize: "clamp(32px,3.8vw,50px)", fontWeight: 400 }}>
                {p.title}
              </h2>
            )}
            {p.body && (
              <div style={{ color: "var(--ink-2)", fontSize: 16.5, lineHeight: 1.65 }}>
                {renderBody(p.body)}
              </div>
            )}
            {p.cta && (
              <a
                href={p.cta.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 24,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--ink)",
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: 2,
                  textDecoration: "none",
                }}
              >
                {p.cta.label}
              </a>
            )}
          </div>
          {!imgLeft && p.image && (
            <div className="twocol-image" style={{ borderRadius: 4, overflow: "hidden", aspectRatio: "4/3", order: 2 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.imageAlt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
