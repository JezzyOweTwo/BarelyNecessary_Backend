export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { guardRoute } from "@/lib/guard_route";
import { getAuthClaims, requireAuth } from "@/lib/validators";
import { getStripe } from "@/lib/stripe_server";

const MAX_PURCHASE_LINES = 40;

type PurchaseLine = { product_id: number; quantity: number };

type ShippingPayload = {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
};

type ProductRow = {
  product_id: number;
  name: string;
  price: string | number;
  stock_quantity: number;
  is_active: number | boolean;
};

function num(v: string | number | undefined | null): number {
  if (v === undefined || v === null) return 0;
  return typeof v === "number" ? v : Number.parseFloat(String(v)) || 0;
}

function mergeQuantities(lines: PurchaseLine[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const line of lines) {
    const pid = Number(line.product_id);
    const qty = Number(line.quantity);
    if (!Number.isFinite(pid) || pid <= 0 || !Number.isFinite(qty) || qty <= 0) {
      throw new Error("INVALID_LINE");
    }
    map.set(pid, (map.get(pid) ?? 0) + qty);
  }
  return map;
}

function parsePurchaseBody(body: unknown): { lines: PurchaseLine[]; shipping: ShippingPayload } {
  if (typeof body !== "object" || body === null) throw new Error("INVALID_BODY");
  const o = body as Record<string, unknown>;
  const items = o.items;
  const shipping = o.shipping;
  if (!Array.isArray(items) || items.length === 0) throw new Error("EMPTY_CART");
  if (items.length > MAX_PURCHASE_LINES) throw new Error("TOO_MANY_LINES");
  const lines: PurchaseLine[] = [];
  for (const raw of items) {
    if (typeof raw !== "object" || raw === null) throw new Error("INVALID_LINE");
    const row = raw as Record<string, unknown>;
    lines.push({
      product_id: Number(row.product_id),
      quantity: Number(row.quantity),
    });
  }
  if (typeof shipping !== "object" || shipping === null) throw new Error("INVALID_SHIPPING");
  const s = shipping as Record<string, unknown>;
  const street = String(s.street ?? "").trim();
  const city = String(s.city ?? "").trim();
  const province = String(s.province ?? "").trim();
  const postal_code = String(s.postal_code ?? "").trim();
  const country = String(s.country ?? "Canada").trim() || "Canada";
  if (!street || !city || !province || !postal_code) throw new Error("INCOMPLETE_SHIPPING");
  return {
    lines,
    shipping: { street, city, province, postal_code, country },
  };
}

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

  let merged: Map<number, number>;
  let shipping: ShippingPayload;
  try {
    const parsed = parsePurchaseBody(body);
    merged = mergeQuantities(parsed.lines);
    shipping = parsed.shipping;
  } catch (e) {
    const code = e instanceof Error ? e.message : "BAD_REQUEST";
    const messages: Record<string, string> = {
      INVALID_BODY: "Request body must include items and shipping.",
      EMPTY_CART: "Cart is empty.",
      TOO_MANY_LINES: `Too many line items (max ${MAX_PURCHASE_LINES}).`,
      INVALID_LINE: "Each item needs a positive product_id and quantity.",
      INCOMPLETE_SHIPPING: "Shipping street, city, province, and postal code are required.",
    };
    return NextResponse.json(
      { success: false, message: messages[code] ?? "Invalid request." },
      { status: 400 }
    );
  }

  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (!origin) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Set NEXT_PUBLIC_APP_URL (e.g. http://localhost:3000) so Stripe can redirect back after payment.",
      },
      { status: 500 }
    );
  }

  try {
    const sortedIds = [...merged.keys()].sort((a, b) => a - b);
    const ph = sortedIds.map(() => "?").join(",");
    const products = (await query_db(
      `SELECT product_id, name, price, stock_quantity, is_active
       FROM products
       WHERE product_id IN (${ph})`,
      sortedIds
    )) as ProductRow[];

    if (products.length !== sortedIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more products were not found." },
        { status: 400 }
      );
    }

    const byId = new Map(products.map((p) => [p.product_id, p]));
    const stripeLineItems: {
      quantity: number;
      price_data: {
        currency: "cad";
        unit_amount: number;
        product_data: { name: string; metadata: { product_id: string } };
      };
    }[] = [];

    for (const pid of sortedIds) {
      const p = byId.get(pid);
      if (!p) continue;
      const qty = merged.get(pid);
      if (qty === undefined) continue;
      if (!p.is_active || p.is_active === 0) {
        return NextResponse.json(
          { success: false, message: "A product in your cart is no longer available." },
          { status: 400 }
        );
      }
      const stock = Number(p.stock_quantity);
      if (!Number.isFinite(stock) || stock < qty) {
        return NextResponse.json(
          { success: false, message: "Not enough stock for one or more items." },
          { status: 409 }
        );
      }
      const unit = num(p.price);
      const cents = Math.round(unit * 100);
      if (cents < 50) {
        return NextResponse.json(
          { success: false, message: "A product price is too low for card checkout (Stripe minimums)." },
          { status: 400 }
        );
      }
      stripeLineItems.push({
        quantity: qty,
        price_data: {
          currency: "cad",
          unit_amount: cents,
          product_data: {
            name: p.name,
            metadata: { product_id: String(p.product_id) },
          },
        },
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems,
      success_url: `${origin.replace(/\/$/, "")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin.replace(/\/$/, "")}/checkout?canceled=1`,
      client_reference_id: claims.userId,
      metadata: {
        user_id: claims.userId,
        ship_street: shipping.street.slice(0, 500),
        ship_city: shipping.city.slice(0, 500),
        ship_province: shipping.province.slice(0, 500),
        ship_postal: shipping.postal_code.slice(0, 500),
        ship_country: shipping.country.slice(0, 500),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { success: false, message: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { url: session.url, session_id: session.id },
    });
  } catch (e) {
    console.error("Stripe checkout session error:", e);
    return NextResponse.json(
      {
        success: false,
        message: e instanceof Error ? e.message : "Could not start Stripe checkout.",
      },
      { status: 500 }
    );
  }
}
