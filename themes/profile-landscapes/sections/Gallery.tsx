type Image = { url: string; alt?: string; caption?: string };
type Props = { images?: Image[] };

export function Gallery({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  if (!p.images?.length) return null;
  return (
    <section className="gallery-section">
      <div className="wrap">
        <div className="gallery-grid">
          {p.images.map((img, i) => (
            <figure key={i} className="gallery-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || ""} />
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
