import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query_db } from "@/lib/database_handler";
import { redisGetJSON, redisDelete } from "@/lib/redis_handler";
import { PendingUser } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { data: "Missing email or verification code." },
        { status: 400 }
      );
    }

    // retrieve pending user from redis
    const pendingUser = await redisGetJSON<PendingUser>(`verify:${email}`);

    if (!pendingUser) {
      return NextResponse.json(
        { data: "Verification expired or invalid." },
        { status: 400 }
      );
    }

    // verify code
    if (pendingUser.verification_code !== code) {
      return NextResponse.json(
        { data: "Invalid verification code." },
        { status: 401 }
      );
    }

    const {
      user_id,
      first_name,
      last_name,
      username,
      password,
      phone,
      role
    } = pendingUser;

    // create auth token
    const authToken = jwt.sign(
      { userId: user_id, role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // insert user into database
    await query_db(
      `INSERT INTO users
      (user_id, first_name, last_name, email, username, password, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        user_id,
        first_name,
        last_name,
        email,
        username,
        password,
        phone,
        role
      ]
    );

    // delete redis entry
    await redisDelete(`verify:${email}`);

    return NextResponse.json({
      data: {
        message: "User created successfully.",
        authorization: `Bearer ${authToken}`
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { data: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}