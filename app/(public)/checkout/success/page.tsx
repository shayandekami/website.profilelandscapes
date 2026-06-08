import type { Metadata } from "next";
import { db, orders } from "@/lib/db";
import { eq, or } from "drizzle-orm";
import { ClearCart } from "./ClearCart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been placed successfully.",
};

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string; order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { session_id: sessionId, order: orderNumber } = await searchParams;

  // Try to find the order by Stripe session ID or order number
  let order = null;
  if (sessionId || orderNumber) {
    const conditions = [];
    if (sessionId) conditions.push(eq(orders.stripeSessionId, sessionId));
    if (orderNumber) conditions.push(eq(orders.orderNumber, orderNumber));

    order = await db
      .select()
      .from(orders)
      .where(or(...conditions))
      .limit(1)
      .then((r) => r[0] || null);
  }

  return (
    <>
      {/* Clear cart on success */}
      <ClearCart />

      <section style={{ padding: "80px 0 100px" }}>
        <div className="wrap" style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Success icon */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#dcfce7",
                fontSize: 32,
                marginBottom: 20,
              }}
            >
              ✅
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 12px" }}>
              Order Confirmed!
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-muted, #6b7280)", margin: 0 }}>
              Thank you for your purchase. We&apos;ve received your order and will get it ready for you.
            </p>
          </div>

          {order ? (
            <>
              {/* Order summary box */}
              <div
                style={{
                  border: "1px solid var(--line-2, #e5e7eb)",
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: 32,
                }}
              >
                {/* Order header */}
                <div
                  style={{
                    background: "var(--color-surface, #f8f8f6)",
                    padding: "20px 24px",
                    borderBottom: "1px solid var(--line-2, #e5e7eb)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Order number
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{order.orderNumber}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Date
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {order.createdAt.toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                {/* Line items */}
                <div style={{ padding: "0 24px" }}>
                  {order.lineItems.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 0",
                        borderBottom: i < order.lineItems.length - 1 ? "1px solid var(--line-2, #e5e7eb)" : "none",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)", marginTop: 2 }}>
                          Qty {item.quantity} × {centsToDisplay(item.priceCents)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, flexShrink: 0 }}>
                        {centsToDisplay(item.priceCents * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div
                  style={{
                    background: "var(--color-surface, #f8f8f6)",
                    padding: "16px 24px",
                    borderTop: "1px solid var(--line-2, #e5e7eb)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--text-muted, #6b7280)" }}>Subtotal</span>
                    <span>{centsToDisplay(order.subtotalCents)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--text-muted, #6b7280)" }}>Shipping</span>
                    <span>
                      {order.shippingCents === 0 ? (
                        <span style={{ color: "#16a34a" }}>Free</span>
                      ) : (
                        centsToDisplay(order.shippingCents)
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 17,
                      fontWeight: 700,
                      borderTop: "1px solid var(--line-2, #e5e7eb)",
                      paddingTop: 12,
                      marginTop: 4,
                    }}
                  >
                    <span>Total paid</span>
                    <span>{centsToDisplay(order.totalCents)}</span>
                  </div>
                </div>
              </div>

              {/* Email + shipping notice */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                  padding: "16px 20px",
                  fontSize: 14,
                  color: "#1d4ed8",
                  marginBottom: 32,
                }}
              >
                📧 A confirmation has been sent to <strong>{order.customerEmail}</strong>.
                We&apos;ll email you again when your order ships.
              </div>
            </>
          ) : (
            /* No DB order found (e.g. payment just processed, not yet written) */
            <div
              style={{
                border: "1px solid var(--line-2, #e5e7eb)",
                borderRadius: 12,
                padding: "28px 24px",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              <p style={{ fontSize: 15, color: "var(--text-muted, #6b7280)", margin: 0 }}>
                Your payment was received. You&apos;ll get a confirmation email shortly once your order is processed.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/shop"
              style={{
                padding: "10px 24px",
                background: "var(--color-accent, #2563eb)",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Continue shopping
            </a>
            <a
              href="/"
              style={{
                padding: "10px 24px",
                background: "#fff",
                color: "var(--text-base, #374151)",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                border: "1px solid var(--line-2, #e5e7eb)",
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
