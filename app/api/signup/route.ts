import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query_db, exists } from "@/lib/database_handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { first_name, last_name, email, username, password, phone } = body;

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const emailExists = await exists("users", "email", email);

    if (emailExists) {
      return NextResponse.json(
        { message: "Email already exists." },
        { status: 409 }
      );
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    await query_db(
      `INSERT INTO users
      (first_name, last_name, email, username, password, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 'customer', TRUE)`,
      [first_name, last_name, email, username, hashedPassword, phone]
    );

    return NextResponse.json({ data: "User created successfully." });
  } catch (error) {
    console.error("Signup failed:", error);

    return NextResponse.json(
      { message: "Signup failed." },
      { status: 500 }
    );
  }
}