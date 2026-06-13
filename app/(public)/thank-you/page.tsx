import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank you — Profile Landscapes",
  robots: "noindex",
};

export default function ThankYou({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; name?: string }>;
}) {
  return (
    <section
      style={{
        minHeight: "85vh",
        background: "var(--ink)",
        color: "#e8e5db",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 0",
      }}
    >
      <div className="wrap">
        <div style={{ maxWidth: 640 }}>
          {/* Label */}
          <span
            style={{
              display: "block",
              fontFamily: "var(--sans)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#a39b85",
              marginBottom: 24,
            }}
          >
            Submission received
          </span>

          {/* Heading */}
          <h1
            style={{
              margin: "0 0 28px",
              fontFamily: "var(--display)",
              fontSize: "clamp(44px,6vw,80px)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              color: "#fff",
            }}
          >
            Thank
            <br />
            <em style={{ fontStyle: "italic", color: "#e8dcb6" }}>you.</em>
          </h1>

          <p
            style={{
              margin: "0 0 48px",
              fontSize: 17,
              lineHeight: 1.65,
              color: "#c8c2b0",
              maxWidth: "44ch",
            }}
          >
            We have received your enquiry and will be in touch within two business days. 
            If you have an urgent requirement, call us directly on (02) 9560 3888.
          </p>

          {/* Reference card */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6,
              padding: "24px 28px",
              marginBottom: 48,
              display: "inline-block",
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#a39b85",
                marginBottom: 10,
              }}
            >
              Your reference
            </div>
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: "#e8dcb6",
              }}
            >
              PL-{new Date().getFullYear()}-
              {String(Math.floor(Math.random() * 9000) + 1000)}
            </div>
            <div style={{ fontSize: 13, color: "#8a8070", marginTop: 6 }}>
              Quote this reference when following up
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a
              href="/projects"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "13px 24px",
                borderRadius: 999,
                background: "#e8dcb6",
                color: "#0a1e15",
                fontWeight: 500,
                fontSize: 14.5,
                textDecoration: "none",
              }}
            >
              Browse our projects
            </a>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "13px 24px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#c8c2b0",
                fontWeight: 500,
                fontSize: 14.5,
                textDecoration: "none",
              }}
            >
              Return home
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
