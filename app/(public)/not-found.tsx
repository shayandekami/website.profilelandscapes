export default function NotFound() {
  const quickLinks = [
    { href: "/projects", label: "Projects", description: "Recent & signature work" },
    { href: "/services", label: "Services", description: "Construction, maintenance, design" },
    { href: "/plants", label: "Nursery", description: "4,800+ plants in stock" },
    { href: "/encyclopedia", label: "Encyclopedia", description: "318 species documented" },
    { href: "/about", label: "About", description: "Our story and team" },
    { href: "/contact", label: "Contact", description: "Get in touch" },
  ];

  return (
    <section
      style={{
        minHeight: "80vh",
        background: "var(--ink)",
        color: "#e8e5db",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 0",
      }}
    >
      <style>{`.nf-quicklink:hover{background:rgba(255,255,255,0.06)!important}`}</style>
      <div className="wrap">
        <div style={{ marginBottom: 64 }}>
          <span
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(80px,14vw,160px)",
              fontWeight: 400,
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              color: "rgba(255,255,255,0.08)",
              display: "block",
              marginBottom: 24,
            }}
          >
            404
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--display)",
              fontSize: "clamp(36px,5vw,64px)",
              fontWeight: 400,
              letterSpacing: "-0.025em",
              lineHeight: 1.02,
              color: "#fff",
            }}
          >
            Not here.
            <br />
            <em style={{ fontStyle: "italic", color: "#e8dcb6" }}>Probably uprooted.</em>
          </h1>
          <p
            style={{
              margin: "22px 0 0",
              maxWidth: "48ch",
              fontSize: 17,
              lineHeight: 1.6,
              color: "#c8c2b0",
            }}
          >
            The page you&apos;re looking for has moved or never existed. Try one of the links below.
          </p>
        </div>

        {/* Quick links grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nf-quicklink"
              style={{
                display: "block",
                padding: "28px 24px",
                background: "rgba(255,255,255,0.02)",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 20,
                  fontWeight: 400,
                  color: "#fff",
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {link.label}
              </div>
              <div style={{ fontSize: 13.5, color: "#a39b85" }}>{link.description}</div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <a
            href="/"
            style={{
              fontSize: 14,
              color: "#c8c2b0",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              paddingBottom: 2,
              textDecoration: "none",
            }}
          >
            ← Back to home
          </a>
        </div>
      </div>
    </section>
  );
}
