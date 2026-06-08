export default function NotFound() {
  return (
    <section className="page-head">
      <div className="wrap">
        <div className="crumbs">404</div>
        <h1>
          Not here.<br />
          <span className="it">Probably uprooted.</span>
        </h1>
        <p className="lede">
          The page you&apos;re looking for has moved or never existed.
        </p>
        <p style={{ marginTop: 22 }}>
          <a href="/" className="btn-primary" style={{ background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" }}>
            Back home →
          </a>
        </p>
      </div>
    </section>
  );
}
