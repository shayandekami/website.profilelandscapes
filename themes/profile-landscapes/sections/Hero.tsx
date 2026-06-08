type CTA = { label: string; href: string };
type Props = {
  eyebrow?: string;
  title?: string;
  titleItalic?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;
  badge?: { value: string; label: string };
};

export function Hero({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  return (
    <section className="hero" style={{ padding: 0 }}>
      {p.image && (
        <div className="hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={p.imageAlt || ""} />
        </div>
      )}
      <div className="hero-inner">
        <div className="wrap">
          {p.eyebrow && (
            <div className="eyebrow" style={{ color: "#e8dcb6" }}>
              {p.eyebrow}
            </div>
          )}
          <h1 className="display" style={{ marginTop: 22 }}>
            {p.title}
            {p.titleItalic && (
              <>
                <br />
                <span className="it">{p.titleItalic}</span>
              </>
            )}
          </h1>
          {p.body && <p className="sub">{p.body}</p>}
          <div className="hero-cta">
            {p.ctaPrimary && (
              <a href={p.ctaPrimary.href} className="btn-primary">
                {p.ctaPrimary.label}
              </a>
            )}
            {p.ctaSecondary && (
              <a href={p.ctaSecondary.href} className="btn-ghost">
                {p.ctaSecondary.label}
              </a>
            )}
          </div>
        </div>
      </div>
      {p.badge && (
        <div className="hero-badge">
          <strong>{p.badge.value}</strong>
          {p.badge.label}
        </div>
      )}
    </section>
  );
}
