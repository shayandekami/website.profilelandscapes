/**
 * Stripe client — lazily instantiated so the server only loads it when needed.
 * Set STRIPE_SECRET_KEY in .env.local.
 * Set STRIPE_WEBHOOK_SECRET for webhook signature verification.
 */

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local to enable checkout."
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return _stripe;
}

/** Verify an incoming Stripe webhook signature. Returns the event or throws. */
export function constructWebhookEvent(
  payload: string | Buffer,
  sig: string,
  secret: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(payload, sig, secret);
}
