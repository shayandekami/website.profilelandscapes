import Link from "next/link";
import { db, orders } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { OrderLineItem } from "@/lib/db/schema";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "draft",
  paid: "paid",
  processing: "paid",
  shipped: "paid",
  delivered: "paid",
  cancelled: "draft",
  refunded: "draft",
};

const STATUS_STYLE: Record<
  OrderStatus,
  { background: string; color: string }
> = {
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

function StatusBadge({ status }: { status: string }) {
  const s = status as OrderStatus;
  const style = STATUS_STYLE[s] ?? { background: "#f0f0f0", color: "#333" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 5,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
        ...style,
      }}
    >
      {status}
    </span>
  );
}

export default async function OrdersListPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { status: filterStatus } = await searchParams;
  const validStatus =
    filterStatus && ALL_STATUSES.includes(filterStatus as OrderStatus)
      ? (filterStatus as OrderStatus)
      : null;

  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const filtered = validStatus
    ? rows.filter((o) => o.status === validStatus)
    : rows;

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Customer <span className="it">orders.</span>
          </h1>
          <div className="sub">
            {rows.length} total order{rows.length !== 1 ? "s" : ""}.
            {validStatus && ` Showing: ${validStatus}.`}
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/admin/orders"
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            background: !validStatus ? "var(--accent)" : "var(--surface2, #f0f0f0)",
            color: !validStatus ? "#fff" : "var(--ink)",
            textDecoration: "none",
          }}
        >
          All ({rows.length})
        </Link>
        {ALL_STATUSES.map((s) => {
          const count = rows.filter((o) => o.status === s).length;
          return (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                textTransform: "capitalize",
                background: validStatus === s ? "var(--accent)" : "var(--surface2, #f0f0f0)",
                color: validStatus === s ? "#fff" : "var(--ink)",
                textDecoration: "none",
              }}
            >
              {s} ({count})
            </Link>
          );
        })}
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "var(--muted)" }}>
            No orders{validStatus ? ` with status "${validStatus}"` : ""}.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      style={{ fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-mono, monospace)" }}
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.customerName}</div>
                    <div className="sub" style={{ fontSize: 12.5 }}>
                      <a href={`mailto:${o.customerEmail}`} style={{ color: "var(--accent)" }}>
                        {o.customerEmail}
                      </a>
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                    {((o.lineItems as OrderLineItem[]) ?? []).length} item
                    {((o.lineItems as OrderLineItem[]) ?? []).length !== 1 ? "s" : ""}
                  </td>
                  <td style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {formatPrice(o.totalCents)}
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="mono muted">
                    {new Date(o.createdAt).toLocaleString("en-AU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
