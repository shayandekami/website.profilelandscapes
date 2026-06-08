type Item = {
  number?: string;
  title: string;
  body: string;
  cta?: string;
  href?: string;
};
type Props = {
  eyebrow?: string;
  title?: string;
  titleItalic?: string;
  items: Item[];
};

export function Pillars({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  return (
    <section className="pillars">
      <div className="wrap">
        {(p.eyebrow || p.title) && (
          <div className="pillars-head">
            {p.eyebrow && <span className="eyebrow">{p.eyebrow}</span>}
            {p.title && (
              <h2 className="display">
                {p.title}
                {p.titleItalic && (
                  <>
                    <br />
                    <span className="italic">{p.titleItalic}</span>
                  </>
                )}
              </h2>
            )}
          </div>
        )}
        <div className="pillars-grid">
          {p.items?.map((it, i) => {
            const Tag: "a" | "div" = it.href ? "a" : "div";
            return (
              <Tag
                key={i}
                {...(it.href ? { href: it.href } : {})}
                className="pillar fade-target"
              >
                {it.number && <div className="pn">{it.number}</div>}
                <h3>{it.title}</h3>
                <p>{it.body}</p>
                {it.cta && <span className="arrow">{it.cta}</span>}
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
}
