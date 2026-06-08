import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { constructWebhookEvent } from "@/lib/stripe";

// Stripe requires the raw Node.js request body — do not use Edge runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: ReturnType<typeof constructWebhookEvent>;
  try {
    const body = await req.text();
    event = constructWebhookEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        id: string;
        payment_intent?: string;
        payment_status?: string;
      };

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.stripeSessionId, session.id))
        .limit(1);

      if (order) {
        await db
          .update(orders)
          .set({
            status: "paid",
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));
      } else {
        console.warn(
          `[stripe webhook] No order found for session ${session.id}`
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
