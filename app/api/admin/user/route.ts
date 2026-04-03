import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database_handler";
import { User } from "@/lib/types";

const TABLE = "users";

// gets all users in the DB
export async function GET(req: NextRequest) {
  const users = await db.getAll<User>(TABLE);

  // Remove passwords before sending
  const safeUsers = users.map(({ password, ...rest }) => rest);

  return NextResponse.json({ data: safeUsers });
}

// deletes all users, lmfao
export async function DELETE(req: NextRequest) {
  await db.query_db(`DELETE FROM \`${TABLE}\``);
  return NextResponse.json({ data: "All users have been deleted 💀" });
}