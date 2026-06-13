"use client";

import { useState, useEffect } from "react";

const CART_KEY = "pl_cart";
const SHIPPING_THRESHOLD_CENTS = 20000; // $200.00
const SHIPPING_CENTS = 1000; // $10.00

type CartItem = {
  type: "product" | "plant";
  id: number;
  name: string;
  image?: string;
  priceCents: number;
  quantity: number;
};

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

type CheckoutStep = "cart" | "details" | "processing";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  function updateQty(item: CartItem, delta: number) {
    const newCart = cart
      .map((c) =>
        c.type === item.type && c.id === item.id
          ? { ...c, quantity: Math.max(0, c.quantity + delta) }
          : c
      )
      .filter((c) => c.quantity > 0);
    setCart(newCart);
    saveCart(newCart);
  }

  function removeItem(item: CartItem) {
    const newCart = cart.filter(
      (c) => !(c.type === item.type && c.id === item.id)
    );
    setCart(newCart);
    saveCart(newCart);
  }

  const subtotalCents = cart.reduce(
    (sum, c) => sum + c.priceCents * c.quantity,
    0
  );
  const shippingCents =
    subtotalCents >= SHIPPING_THRESHOLD_CENTS ? 0 : subtotalCents > 0 ? SHIPPING_CENTS : 0;
  const totalCents = subtotalCents + shippingCents;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutError("");
    setStep("processing");

    try {
      // Validate cart server-side
      const validateRes = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      if (!validateRes.ok) {
        const err = await validateRes.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Cart validation failed");
      }

      // Create checkout session
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
        }),
      });
      if (!checkoutRes.ok) {
        const err = await checkoutRes.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Checkout failed");
      }

      const { url } = (await checkoutRes.json()) as { url: string };
      if (!url) throw new Error("No checkout URL returned");

      // Redirect to Stripe
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong");
      setStep("details");
    }
  }

  if (!mounted) {
    return (
      <section style={{ padding: "80px 0", textAlign: "center", color: "var(--text-muted, #6b7280)" }}>
        <div className="wrap">Loading cart…</div>
      </section>
    );
  }

  return (
    <>
      {/* Page header */}
      <section
        style={{
          background: "var(--bone, #f4efe4)",
          padding: "40px 0 28px",
          borderBottom: "1px solid var(--line-2, #e5e7eb)",
        }}
      >
        <div className="wrap">
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)", marginBottom: 10 }}>
            <a href="/">Home</a> &nbsp;&middot;&nbsp; Cart
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: "clamp(36px,4vw,52px)", fontWeight: 300, letterSpacing: "-0.02em" }}>
            {step === "details" ? "Checkout" : "Your cart"}
          </h1>
        </div>
      </section>

      <section style={{ padding: "48px 0 80px" }}>
        <div className="wrap">
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "var(--text-muted, #6b7280)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 26, letterSpacing: "-0.01em", marginBottom: 12 }}>Your cart is empty</h2>
              <p style={{ marginBottom: 24 }}>
                Browse our shop and nursery to find something you love.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <a
                  href="/shop"
                  style={{
                    padding: "10px 24px",
                    background: "var(--ink, #133024)",
                    color: "#fff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Browse Shop
                </a>
                <a
                  href="/plants"
                  style={{
                    padding: "10px 24px",
                    background: "var(--accent, #1f5a3d)",
                    color: "#fff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Browse Nursery
                </a>
              </div>
            </div>
          ) : (
            <div
              className="cart-layout"
              style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "start" }}
            >
              {/* Items */}
              <div>
                {step === "cart" && (
                  <>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--line-2, #e5e7eb)" }}>
                          <th style={{ textAlign: "left", padding: "0 0 12px", fontSize: 12, fontWeight: 600, color: "var(--text-muted, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Item
                          </th>
                          <th style={{ textAlign: "center", padding: "0 0 12px", fontSize: 12, fontWeight: 600, color: "var(--text-muted, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Qty
                          </th>
                          <th style={{ textAlign: "right", padding: "0 0 12px", fontSize: 12, fontWeight: 600, color: "var(--text-muted, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Price
                          </th>
                          <th style={{ width: 40 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr
                            key={`${item.type}-${item.id}`}
                            style={{ borderBottom: "1px solid var(--line-2, #e5e7eb)" }}
                          >
                            <td style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 14 }}>
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  style={{
                                    width: 64,
                                    height: 64,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    border: "1px solid var(--line-2, #e5e7eb)",
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 64,
                                    height: 64,
                                    background: "#f3f4f6",
                                    borderRadius: 8,
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 20,
                                  }}
                                >
                                  {item.type === "plant" ? "🌿" : "📦"}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)", marginTop: 2, textTransform: "capitalize" }}>
                                  {item.type}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "16px 0", textAlign: "center" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--line-2, #e5e7eb)", borderRadius: 8, padding: "4px 8px" }}>
                                <button
                                  onClick={() => updateQty(item, -1)}
                                  style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16, width: 24, color: "var(--text-base, #374151)" }}
                                >
                                  −
                                </button>
                                <span style={{ minWidth: 20, textAlign: "center", fontSize: 14, fontWeight: 600 }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQty(item, 1)}
                                  style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16, width: 24, color: "var(--text-base, #374151)" }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: "16px 0", textAlign: "right", fontWeight: 600, fontSize: 15 }}>
                              {centsToDisplay(item.priceCents * item.quantity)}
                            </td>
                            <td style={{ padding: "16px 0 16px 16px" }}>
                              <button
                                onClick={() => removeItem(item)}
                                style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18 }}
                                title="Remove"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                      <a href="/shop" style={{ color: "var(--ink, #133024)", fontSize: 14, textDecoration: "none" }}>
                        ← Continue shopping
                      </a>
                    </div>
                  </>
                )}

                {step === "details" && (
                  <form onSubmit={handleCheckout}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Your details</h2>

                    {checkoutError && (
                      <div
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#dc2626",
                          padding: "12px 16px",
                          borderRadius: 8,
                          fontSize: 14,
                          marginBottom: 20,
                        }}
                      >
                        {checkoutError}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                          Full name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your full name"
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            border: "1px solid var(--line-2, #d1d5db)",
                            borderRadius: 8,
                            fontSize: 15,
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                          Email address *
                        </label>
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="you@example.com"
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            border: "1px solid var(--line-2, #d1d5db)",
                            borderRadius: 8,
                            fontSize: 15,
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setStep("cart")}
                        style={{
                          padding: "12px 20px",
                          border: "1px solid var(--line-2, #d1d5db)",
                          background: "#fff",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        ← Back to cart
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: "12px 28px",
                          background: "var(--ink, #133024)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 15,
                          fontWeight: 600,
                        }}
                      >
                        Pay with card →
                      </button>
                    </div>
                  </form>
                )}

                {step === "processing" && (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted, #6b7280)" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                    <p>Processing your order…</p>
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div
                style={{
                  border: "1px solid var(--line-2, #e5e7eb)",
                  borderRadius: 12,
                  padding: 24,
                  background: "var(--bone, #f4efe4)",
                  position: "sticky",
                  top: 80,
                }}
              >
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em", margin: "0 0 20px" }}>Order summary</h2>

                {/* Line items summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {cart.map((item) => (
                    <div key={`${item.type}-${item.id}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--text-muted, #6b7280)", flex: 1, marginRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name} × {item.quantity}
                      </span>
                      <span style={{ fontWeight: 500, flexShrink: 0 }}>
                        {centsToDisplay(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--line-2, #e5e7eb)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--text-muted, #6b7280)" }}>Subtotal</span>
                    <span>{centsToDisplay(subtotalCents)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--text-muted, #6b7280)" }}>Shipping</span>
                    <span>
                      {shippingCents === 0 && subtotalCents >= SHIPPING_THRESHOLD_CENTS
                        ? <span style={{ color: "var(--accent, #1f5a3d)", fontWeight: 500 }}>Free</span>
                        : shippingCents === 0
                        ? "—"
                        : centsToDisplay(shippingCents)}
                    </span>
                  </div>
                  {subtotalCents > 0 && subtotalCents < SHIPPING_THRESHOLD_CENTS && (
                    <div style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)" }}>
                      Add {centsToDisplay(SHIPPING_THRESHOLD_CENTS - subtotalCents)} more for free shipping
                    </div>
                  )}
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
                    <span>Total</span>
                    <span>{centsToDisplay(totalCents)}</span>
                  </div>
                </div>

                {step === "cart" && (
                  <button
                    onClick={() => setStep("details")}
                    style={{
                      marginTop: 20,
                      width: "100%",
                      padding: "13px",
                      background: "var(--ink, #133024)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Proceed to checkout →
                  </button>
                )}

                <p style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)", textAlign: "center", margin: "12px 0 0" }}>
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
