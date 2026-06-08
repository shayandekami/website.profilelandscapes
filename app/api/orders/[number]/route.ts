import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Query param ?email= is required" },
      { status: 400 }
    );
  }

  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, number))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.customerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email address does not match this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        lineItems: order.lineItems,
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        totalCents: order.totalCents,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("[GET /api/orders/[number]]", err);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
