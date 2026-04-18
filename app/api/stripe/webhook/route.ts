export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfillPaidCheckoutSession } from "@/lib/fulfill_stripe_checkout";
import { getStripe } from "@/lib/stripe_server";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  const buf = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(buf, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid payload";
    console.error("Stripe webhook signature error:", msg);
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await fulfillPaidCheckoutSession(session);
    } catch (err) {
      console.error("Order fulfillment failed:", err);
      return new NextResponse("Fulfillment failed", { status: 500 });
    }
  }

  return new NextResponse("ok", { status: 200 });
}
