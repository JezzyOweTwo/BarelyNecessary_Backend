import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database_handler";
import { User } from "@/lib/types";
import { guardRoute } from "@/lib/guard_route";
import { requireAuth } from "@/lib/validators";
const TABLE = "users";

// gets all users in the DB
export async function GET(req: NextRequest) {
  // ensures the user is authenticated before proceeding.
  const validation = await guardRoute(requireAuth,true);
  if (validation) return validation;
  const users = await db.getAll<User>(TABLE);

  // Remove passwords before sending
  const safeUsers = users.map(({ password, ...rest }) => rest);

  return NextResponse.json({ data: safeUsers });
}

// deletes all users
export async function DELETE(req: NextRequest) {
  // ensures the user is authenticated before proceeding.
  const validation = await guardRoute(requireAuth,true);
  if (validation) return validation;
  await db.query_db(`DELETE FROM \`${TABLE}\``);
  return NextResponse.json({ data: "All users have been deleted 💀" });
}