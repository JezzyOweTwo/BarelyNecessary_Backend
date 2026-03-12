import { NextResponse } from "next/server";
import { getAll } from "@/lib/database_handler";

export async function GET() {
  try {
    const users = await getAll("users");
    return NextResponse.json(users);
  } catch (error) {
    console.error("Users fetch failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch users." },
      { status: 500 }
    );
  }
}