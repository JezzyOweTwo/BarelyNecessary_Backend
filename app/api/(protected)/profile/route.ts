export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query_db } from "@/lib/database_handler";
import { guardRoute } from "@/lib/guard_route";
import { getAuthClaims, requireAuth } from "@/lib/validators";

type UserRow = {
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  phone: string | null;
  role: string;
  is_active: boolean | number | null;
};

export async function GET() {
  const validation = await guardRoute(requireAuth, false);
  if (validation) return validation;

  const claims = await getAuthClaims();
  if (!claims) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await query_db<UserRow>(
      `SELECT first_name, last_name, email, username, phone, role, is_active
       FROM users WHERE user_id = ? LIMIT 1`,
      [claims.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const u = rows[0];
    return NextResponse.json({
      data: {
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        username: u.username ?? undefined,
        phone: u.phone ?? undefined,
        role: u.role,
        is_active: Boolean(u.is_active),
      },
    });
  } catch (e) {
    console.error("GET /api/profile:", e);
    return NextResponse.json({ message: "Could not load profile." }, { status: 500 });
  }
}
