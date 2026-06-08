import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, plants, orders } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { calcShipping, generateOrderNumber } from "@/lib/commerce";
import type { OrderLineItem } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface IncomingItem {
  type: "product" | "plant";
  id: number;
  quantity: number;
}

export async function POST(req: Request) {
  let body: {
    items?: IncomingItem[];
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items = [], customerName, customerEmail, customerPhone } = body;

  if (!customerName || !customerEmail) {
    return NextResponse.json(
      { error: "customerName and customerEmail are required" },
      { status: 400 }
    );
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  // Re-validate and re-fetch prices from DB — never trust client prices
  const lineItems: OrderLineItem[] = [];

  for (const item of items) {
    if (item.type === "product") {
      const [row] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, item.id), eq(products.status, "live")))
        .limit(1);

      if (!row || row.stockQty < item.quantity) {
        return NextResponse.json(
          { error: `Product ID ${item.id} is unavailable or out of stock` },
          { status: 422 }
        );
      }
      lineItems.push({
        type: "product",
        id: row.id,
        name: row.name,
        image: (row.images as Array<{ url: string }>)[0]?.url,
        priceCents: row.priceCents,
        quantity: item.quantity,
      });
    } else if (item.type === "plant") {
      const [row] = await db
        .select()
        .from(plants)
        .where(and(eq(plants.id, item.id), eq(plants.status, "live")))
        .limit(1);

      if (!row || row.stockQty < item.quantity) {
        return NextResponse.json(
          { error: `Plant ID ${item.id} is unavailable or out of stock` },
          { status: 422 }
        );
      }
      lineItems.push({
        type: "plant",
        id: row.id,
        name: row.commonName ?? row.latinName,
        image: (row.images as Array<{ url: string }>)[0]?.url,
        priceCents: row.priceCents,
        quantity: item.quantity,
      });
    } else {
      return NextResponse.json(
        { error: `Unknown item type: ${(item as IncomingItem).type}` },
        { status: 400 }
      );
    }
  }

  const subtotalCents = lineItems.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );
  const shippingCents = calcShipping(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  // Dev mode: no Stripe key set
  if (!process.env.STRIPE_SECRET_KEY) {
    const devOrderNumber = "ORD-DEV-0001";
    await db.insert(orders).values({
      orderNumber: devOrderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone ?? null,
      lineItems,
      subtotalCents,
      shippingCents,
      totalCents,
      stripeSessionId: "dev",
      status: "pending",
    });
    return NextResponse.json({
      sessionId: "dev",
      url: `/checkout/success?session_id=dev&order=${devOrderNumber}`,
    });
  }

  try {
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((li) => ({
        price_data: {
          currency: "aud",
          product_data: {
            name: li.name,
            ...(li.image ? { images: [li.image] } : {}),
          },
          unit_amount: li.priceCents,
        },
        quantity: li.quantity,
      })),
      shipping_address_collection: { allowed_countries: ["AU"] },
      ...(shippingCents > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: shippingCents, currency: "aud" },
                  display_name: "Standard shipping",
                },
              },
            ],
          }
        : {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: 0, currency: "aud" },
                  display_name: "Free shipping",
                },
              },
            ],
          }),
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
      metadata: {
        customerName,
        customerEmail,
        customerPhone: customerPhone ?? "",
      },
    });

    // Generate order number from current order count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    const orderNumber = generateOrderNumber(Number(count) + 1);

    await db.insert(orders).values({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone ?? null,
      lineItems,
      subtotalCents,
      shippingCents,
      totalCents,
      stripeSessionId: session.id,
      status: "pending",
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("[POST /api/checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
