type ClientLogo = {
  name: string;
  logo?: string;
};

type Props = {
  eyebrow?: string;
  title?: string;
  clients?: ClientLogo[];
};

function LogoPlaceholder({ name }: { name: string }) {
  return (
    <div
      style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--display)",
        fontStyle: "italic",
        fontSize: 16,
        color: "var(--ink-2)",
        letterSpacing: "0.01em",
        opacity: 0.55,
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </div>
  );
}

export function Clients({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;

  const defaultClients: ClientLogo[] = [
    { name: "Lendlease" },
    { name: "CPB Contractors" },
    { name: "Richard Crookes" },
    { name: "BESIX Watpac" },
    { name: "Taylor Construction" },
    { name: "Billbergia" },
  ];

  const clients = p.clients ?? defaultClients;

  return (
    <section style={{ padding: "56px 0", borderTop: "1px solid var(--line-2)" }}>
      <div className="wrap">
        {(p.eyebrow || p.title) && (
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            {p.eyebrow && <span className="eyebrow">{p.eyebrow}</span>}
            {p.title && (
              <p style={{ margin: "8px 0 0", fontSize: 15, color: "var(--ink-2)" }}>{p.title}</p>
            )}
          </div>
        )}
        <div className="clients-row">
          {clients.map((c, i) => (
            <div key={i}>
              {c.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo} alt={c.name} />
              ) : (
                <LogoPlaceholder name={c.name} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
