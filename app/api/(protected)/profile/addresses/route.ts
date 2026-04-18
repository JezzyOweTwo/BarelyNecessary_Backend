export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { guardRoute } from "@/lib/guard_route";
import { getAuthClaims, requireAuth } from "@/lib/validators";

type AddressRow = {
  address_id: number;
  address_type: "shipping" | "billing";
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
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
    const rows = await query_db<AddressRow>(
      `
      SELECT address_id, address_type, street, city, province, postal_code, country, is_default
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, address_id DESC
      `,
      [claims.userId]
    );

    return NextResponse.json({
      data: rows.map((a) => ({
        ...a,
        is_default: Boolean(a.is_default),
      })),
    });
  } catch (e) {
    console.error("GET /api/profile/addresses:", e);
    return NextResponse.json({ message: "Could not load addresses." }, { status: 500 });
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
      address_type,
      street,
      city,
      province,
      postal_code,
      country,
      is_default = false,
    } = body;

    if (!address_type || !street || !city || !province || !postal_code || !country) {
      return NextResponse.json({ message: "Missing required address fields." }, { status: 400 });
    }

    if (is_default) {
      await query_db(
        `UPDATE addresses SET is_default = 0 WHERE user_id = ? AND address_type = ?`,
        [claims.userId, address_type]
      );
    }

    const result = await query_db(
      `
      INSERT INTO addresses (user_id, address_type, street, city, province, postal_code, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [claims.userId, address_type, street, city, province, postal_code, country, is_default ? 1 : 0]
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (e) {
    console.error("POST /api/profile/addresses:", e);
    return NextResponse.json({ message: "Could not save address." }, { status: 500 });
  }
}