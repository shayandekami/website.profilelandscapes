"use client";

export default function CheckoutCancelPage() {
  return (
    <section style={{ padding: "80px 0 100px" }}>
      <div className="wrap" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#fef9c3",
            fontSize: 32,
            marginBottom: 20,
          }}
        >
          ⚠️
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>
          Checkout cancelled
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted, #6b7280)", margin: "0 0 32px", lineHeight: 1.6 }}>
          No payment was taken. Your cart is still saved — you can go back and complete your purchase when you&apos;re ready.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/cart"
            style={{
              padding: "12px 28px",
              background: "var(--color-accent, #2563eb)",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Return to cart
          </a>
          <a
            href="/shop"
            style={{
              padding: "12px 24px",
              background: "#fff",
              color: "var(--text-base, #374151)",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid var(--line-2, #e5e7eb)",
            }}
          >
            Continue browsing
          </a>
        </div>
      </div>
    </section>
  );
}
