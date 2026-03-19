import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query } from "@/lib/database_handler";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email, password } = body;

    const users = await query(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const user = users[0] as User;

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Incorrect password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      { message: "Login failed." },
      { status: 500 }
    );
  }
}