export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { fulfillPaidCheckoutSession } from "@/lib/fulfill_stripe_checkout";
import { guardRoute } from "@/lib/guard_route";
import { getAuthClaims, requireAuth } from "@/lib/validators";
import { getStripe } from "@/lib/stripe_server";

/**
 * Idempotent: creates DB order if Stripe session is paid and not yet fulfilled.
 * Used from the checkout success page when webhooks are not available (e.g. local dev without stripe listen).
 */
export async function POST(req: NextRequest) {
  const validation = await guardRoute(requireAuth, false);
  if (validation) return validation;

  const claims = await getAuthClaims();
  if (!claims) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId =
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).session_id === "string"
      ? String((body as Record<string, unknown>).session_id).trim()
      : "";

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json(
      { success: false, message: "A valid Stripe session_id (cs_…) is required." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const metaUid = String(session.metadata?.user_id ?? "").trim();
    const refUid = String(session.client_reference_id ?? "").trim();
    if (metaUid !== claims.userId && refUid !== claims.userId) {
      return NextResponse.json(
        { success: false, message: "This checkout does not belong to your account." },
        { status: 403 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          message: `Payment status is "${session.payment_status}". Try again in a moment if you just completed checkout.`,
        },
        { status: 409 }
      );
    }

    const result = await fulfillPaidCheckoutSession(session, {
      trustedUserId: claims.userId,
    });
    return NextResponse.json({
      success: true,
      data: { order_id: result.orderId, duplicate: result.duplicate },
    });
  } catch (e) {
    console.error("POST /api/stripe/fulfill-session:", e);
    return NextResponse.json(
      {
        success: false,
        message: e instanceof Error ? e.message : "Could not record your order.",
      },
      { status: 500 }
    );
  }
}
