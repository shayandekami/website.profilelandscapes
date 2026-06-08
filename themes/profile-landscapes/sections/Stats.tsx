type Item = { value: string; label: string };
type Props = { eyebrow?: string; items: Item[] };

export function Stats({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  return (
    <section className="stats">
      <div className="wrap">
        {p.eyebrow && <span className="eyebrow">{p.eyebrow}</span>}
        <div className="stats-row">
          {p.items?.map((it, i) => (
            <div key={i} className="cell">
              <div className="big">{it.value}</div>
              <div className="lbl">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
