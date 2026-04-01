import { NextResponse } from "next/server";
import { getAll } from "@/lib/database_handler";

export async function GET() {
  try {
    const users = await getAll("users");
    return NextResponse.json(users); 
  } catch (error) {
    console.error("Users get failed:", error);
    return NextResponse.json(
      { message: "Failed to get users." },
      { status: 500 }
    );
  }
}