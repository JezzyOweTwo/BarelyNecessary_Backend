export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { guardRoute } from "@/lib/guard_route";
import { getAuthClaims, requireAuth } from "@/lib/validators";

type PaymentRow = {
  payment_id: number;
  cardholder_name: string;
  card_last4: string;
  card_brand: string | null;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean | number;
};

export async function GET() {
  const validation = await guardRoute(requireAuth, false);
  if (validation) return validation;

  const claims = await getAuthClaims();
  if (!claims) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await query_db<PaymentRow>(
      `
      SELECT payment_id, cardholder_name, card_last4, card_brand, expiry_month, expiry_year, is_default
      FROM payment_methods
      WHERE user_id = ?
      ORDER BY is_default DESC, payment_id DESC
      `,
      [claims.userId]
    );

    return NextResponse.json({
      data: rows.map((p) => ({
        ...p,
        is_default: Boolean(p.is_default),
      })),
    });
  } catch (e) {
    console.error("GET /api/profile/payments:", e);
    return NextResponse.json({ message: "Could not load payment methods." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const validation = await guardRoute(requireAuth, false);
  if (validation) return validation;

  const claims = await getAuthClaims();
  if (!claims) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      cardholder_name,
      card_number,
      card_brand,
      expiry_month,
      expiry_year,
      is_default = false,
    } = body;

    if (!cardholder_name || !card_number || !expiry_month || !expiry_year) {
      return NextResponse.json({ message: "Missing required payment fields." }, { status: 400 });
    }

    const last4 = String(card_number).replace(/\D/g, "").slice(-4);

    if (!last4 || last4.length !== 4) {
      return NextResponse.json({ message: "Invalid card number." }, { status: 400 });
    }

    if (is_default) {
      await query_db(
        `UPDATE payment_methods SET is_default = 0 WHERE user_id = ?`,
        [claims.userId]
      );
    }

    const result = await query_db(
      `
      INSERT INTO payment_methods
      (user_id, cardholder_name, card_last4, card_brand, expiry_month, expiry_year, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [claims.userId, cardholder_name, last4, card_brand ?? null, expiry_month, expiry_year, is_default ? 1 : 0]
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (e) {
    console.error("POST /api/profile/payments:", e);
    return NextResponse.json({ message: "Could not save payment method." }, { status: 500 });
  }
}