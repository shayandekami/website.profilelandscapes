type Props = {
  eyebrow?: string;
  headline?: string;
  body?: string;
  button?: { label: string; href: string };
};

export function Cta({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  return (
    <section className="cta-block">
      <div className="wrap">
        <div className="cta-inner">
          {p.eyebrow && <span className="eyebrow">{p.eyebrow}</span>}
          {p.headline && <h2 className="display">{p.headline}</h2>}
          {p.body && <p className="sub">{p.body}</p>}
          {p.button && (
            <a href={p.button.href} className="btn-primary">
              {p.button.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
