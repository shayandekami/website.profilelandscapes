import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, orders } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { OrderLineItem, ShippingAddress } from "@/lib/db/schema";
import { updateOrderStatus } from "../actions";

type Params = { params: Promise<{ id: string }> };

const ALL_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

type OrderStatus = (typeof ALL_STATUSES)[number];

const STATUS_STYLE: Record<OrderStatus, { background: string; color: string }> = {
  pending: { background: "#fff8e1", color: "#b45309" },
  paid: { background: "#e8f5e9", color: "#1b7a3a" },
  processing: { background: "#e3f2fd", color: "#1565c0" },
  shipped: { background: "#ede7f6", color: "#5e35b1" },
  delivered: { background: "#e8f5e9", color: "#1b7a3a" },
  cancelled: { background: "#fce4e4", color: "#c0392b" },
  refunded: { background: "#f3e5f5", color: "#7b1fa2" },
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function OrderDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });
  if (!order) notFound();

  const updateWithId = updateOrderStatus.bind(null, orderId);

  const lineItems = (order.lineItems as OrderLineItem[]) ?? [];
  const shippingAddr = order.shippingAddress as ShippingAddress | null | undefined;
  const status = order.status as OrderStatus;
  const statusStyle = STATUS_STYLE[status] ?? { background: "#f0f0f0", color: "#333" };

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Order{" "}
            <span className="it" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              {order.orderNumber}
            </span>
          </h1>
          <div className="sub">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 7,
            fontSize: 14,
            fontWeight: 700,
            textTransform: "capitalize",
            ...statusStyle,
          }}
        >
          {order.status}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* Line items */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
              Line items
            </h3>
            {lineItems.length === 0 ? (
              <p className="muted" style={{ fontSize: 13 }}>No line items.</p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: "right" }}>Unit price</th>
                    <th style={{ textAlign: "right" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border)", flexShrink: 0 }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 500 }}>{item.name}</div>
                            <div className="sub" style={{ fontSize: 12, textTransform: "capitalize" }}>
                              {item.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {formatPrice(item.priceCents)}
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                        {formatPrice(item.priceCents * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Totals */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                marginTop: 16,
                paddingTop: 14,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--muted)" }}>
                <span>Subtotal</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatPrice(order.subtotalCents)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--muted)" }}>
                <span>Shipping</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 16,
                  fontWeight: 700,
                  borderTop: "1px solid var(--border)",
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span>Total</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatPrice(order.totalCents)}
                </span>
              </div>
            </div>
          </div>

          {/* Stripe info */}
          {(order.stripeSessionId || order.stripePaymentIntentId) && (
            <div className="panel" style={{ padding: "22px 24px" }}>
              <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>Stripe</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {order.stripeSessionId && (
                  <div>
                    <div className="sub" style={{ fontSize: 12, marginBottom: 4 }}>Session ID</div>
                    <code style={{ fontSize: 12, wordBreak: "break-all" }}>
                      {order.stripeSessionId}
                    </code>
                  </div>
                )}
                {order.stripePaymentIntentId && (
                  <div>
                    <div className="sub" style={{ fontSize: 12, marginBottom: 4 }}>Payment Intent ID</div>
                    <code style={{ fontSize: 12, wordBreak: "break-all" }}>
                      {order.stripePaymentIntentId}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* Customer */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>Customer</h3>
            <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
              <div>
                <div className="sub" style={{ fontSize: 12, marginBottom: 2 }}>Name</div>
                <div style={{ fontWeight: 500 }}>{order.customerName}</div>
              </div>
              <div>
                <div className="sub" style={{ fontSize: 12, marginBottom: 2 }}>Email</div>
                <a href={`mailto:${order.customerEmail}`} style={{ color: "var(--accent)" }}>
                  {order.customerEmail}
                </a>
              </div>
              {order.customerPhone && (
                <div>
                  <div className="sub" style={{ fontSize: 12, marginBottom: 2 }}>Phone</div>
                  <a href={`tel:${order.customerPhone}`} style={{ color: "var(--accent)" }}>
                    {order.customerPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping address */}
          {shippingAddr && (
            <div className="panel" style={{ padding: "22px 24px" }}>
              <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>
                Shipping address
              </h3>
              <address
                style={{
                  fontStyle: "normal",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--ink)",
                }}
              >
                {shippingAddr.line1}
                {shippingAddr.line2 && (
                  <>
                    <br />
                    {shippingAddr.line2}
                  </>
                )}
                <br />
                {shippingAddr.city} {shippingAddr.state} {shippingAddr.postcode}
                <br />
                {shippingAddr.country}
              </address>
            </div>
          )}

          {/* Status & notes update form */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>
              Update status
            </h3>
            <form action={updateWithId}>
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label className="field-label">Status</label>
                  <select className="field" name="status" defaultValue={order.status}>
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s} style={{ textTransform: "capitalize" }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Internal notes</label>
                  <textarea
                    className="field"
                    name="notes"
                    rows={4}
                    defaultValue={order.notes ?? ""}
                    placeholder="Private notes (not shown to customer)"
                    style={{ resize: "vertical" }}
                  />
                </div>
                <button type="submit" className="btn pri" style={{ width: "100%" }}>
                  Save
                </button>
              </div>
            </form>
          </div>

          <a href="/admin/orders" className="btn sec" style={{ textAlign: "center" }}>
            ← Back to orders
          </a>
        </div>
      </div>
    </main>
  );
}
