type Props = {
  eyebrow?: string;
  title?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
};

export function TwoCol({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  return (
    <section className="twocol fade-target">
      <div className="wrap">
        <div
          className="twocol-grid"
          data-image-pos={p.imagePosition || "right"}
        >
          <div className="twocol-text">
            {p.eyebrow && <span className="eyebrow">{p.eyebrow}</span>}
            {p.title && <h2 className="display">{p.title}</h2>}
            {p.body && <p>{p.body}</p>}
          </div>
          {p.image && (
            <div className="twocol-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.imageAlt || ""} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
