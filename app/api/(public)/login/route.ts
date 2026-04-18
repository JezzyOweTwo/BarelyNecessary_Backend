import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query_db } from "@/lib/database_handler";
import { User } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    const missingFields = [];
    if (!identifier) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required field(s): ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const users = await query_db(
      `SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1`,
      [identifier, identifier]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "No account found with that email or username." },
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

    const authToken = jwt.sign(
      {
        userId: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      {
        message: "Login successful.",
        data: {
          id: user.user_id,
          email: user.email,
          role: user.role,
          authorization: `Bearer ${authToken}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      { message: "Login failed." },
      { status: 500 }
    );
  }
}