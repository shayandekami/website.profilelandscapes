type PlantCard = {
  latinName: string;
  commonName: string;
  price: string;
  image?: string;
};

type StatItem = { value: string; label: string };

type Props = {
  eyebrow?: string;
  title?: string;
  titleItalic?: string;
  body?: string;
  stats?: StatItem[];
  plants?: PlantCard[];
  cta?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export function NurserySpotlight({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;

  const defaultPlants: PlantCard[] = [
    { latinName: "Allocasuarina torulosa", commonName: "Rose she-oak", price: "From $18" },
    { latinName: "Angophora costata", commonName: "Sydney red gum", price: "From $24" },
    { latinName: "Westringia fruticosa", commonName: "Coastal rosemary", price: "From $12" },
  ];

  const plants = p.plants ?? defaultPlants;

  const defaultStats: StatItem[] = [
    { value: "4,800+", label: "Plants in stock" },
    { value: "180+", label: "Species grown" },
    { value: "Mon–Sat", label: "Open Petersham yard" },
  ];

  const stats = p.stats ?? defaultStats;

  return (
    <section className="nursery-spot">
      <div className="wrap">
        <div className="ns-grid">
          {/* Left column — copy */}
          <div className="ns-copy">
            {p.eyebrow && (
              <span className="eyebrow" style={{ color: "#a39b85", display: "block", marginBottom: 12 }}>
                {p.eyebrow}
              </span>
            )}
            <h2>
              {p.title ?? "Grown at Petersham."}
              {p.titleItalic && (
                <>
                  <br />
                  <em style={{ fontStyle: "italic" }}>{p.titleItalic}</em>
                </>
              )}
            </h2>
            <p>
              {p.body ??
                "4,800 plants grown at our Petersham nursery yard — retail and trade sales across metropolitan Sydney. Every species we stock is one we specify and install."}
            </p>

            <div className="ns-stats">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="n">{s.value}</div>
                  <div className="l">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="ns-ctas">
              {p.cta && (
                <a href={p.cta.href} className="btn-primary on-dark">
                  {p.cta.label}
                </a>
              )}
              {p.ctaSecondary && (
                <a
                  href={p.ctaSecondary.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    color: "#c8c2b0",
                    borderBottom: "1px solid rgba(255,255,255,0.25)",
                    paddingBottom: 2,
                    textDecoration: "none",
                  }}
                >
                  {p.ctaSecondary.label}
                </a>
              )}
            </div>
          </div>

          {/* Right column — plant cards */}
          <div className="ns-visual">
            {plants.slice(0, 3).map((plant, i) => (
              <div key={i} className={`ns-card ns-card-${i + 1}`}>
                <div className="ns-img" style={{ background: "#1f3a28", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {plant.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={plant.image} alt={plant.latinName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 56 C24 56 24 32 24 24" stroke="#4a7c5a" strokeWidth="1.5"/>
                      <ellipse cx="24" cy="20" rx="12" ry="16" fill="#2d5c3f" opacity="0.6"/>
                      <ellipse cx="16" cy="28" rx="8" ry="11" fill="#1f5a3d" opacity="0.5"/>
                      <ellipse cx="32" cy="26" rx="9" ry="12" fill="#2d5c3f" opacity="0.5"/>
                    </svg>
                  )}
                </div>
                <div className="ns-label">
                  <div className="lat">{plant.latinName}</div>
                  <div className="com">{plant.commonName}</div>
                  <div className="price">{plant.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
