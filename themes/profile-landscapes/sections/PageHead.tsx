type Crumb = { label: string; href?: string };
type Props = {
  crumbs?: Crumb[];
  title?: string;
  titleItalic?: string;
  lede?: string;
};

export function PageHead({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  return (
    <section className="page-head">
      <div className="wrap">
        {p.crumbs && (
          <div className="crumbs">
            {p.crumbs.map((c, i) => (
              <span key={i}>
                {c.href ? <a href={c.href}>{c.label}</a> : c.label}
                {i < (p.crumbs?.length ?? 0) - 1 && (
                  <>&nbsp;&middot;&nbsp;</>
                )}
              </span>
            ))}
          </div>
        )}
        {p.title && (
          <h1>
            {p.title}
            {p.titleItalic && (
              <>
                <br />
                <span className="it">{p.titleItalic}</span>
              </>
            )}
          </h1>
        )}
        {p.lede && <p className="lede">{p.lede}</p>}
      </div>
    </section>
  );
}
