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
    const pendingUser = await redisGetJSON<PendingUser|any>(`verify:${email}`);

    // bro may need to reconsider his life desisions
    if (!pendingUser) {
      return NextResponse.json(
        { data: "Verification expired or invalid." },
        { status: 400 }
      );
    }

    // normalize both values
    const storedCode = String(pendingUser.verification_code).trim().toLowerCase();
    const inputCode = String(code).trim().toLowerCase();

    // remove all invisible/whitespace characters just in case
    const cleanStoredCode = storedCode.replace(/\s+/g, '');
    const cleanInputCode = inputCode.replace(/\s+/g, '');

    // compare
    if (cleanStoredCode !== cleanInputCode) {
      return NextResponse.json(
        { data: "Invalid verification code." },
        { status: 401 }
      );
    }

    // create auth token
    const authToken = jwt.sign(
      { 
        userId: pendingUser.user_id, 
        role: pendingUser.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // insert user into database
    await query_db(
      `INSERT INTO users
      (user_id, first_name, last_name, email, username, password, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        pendingUser.user_id,
        pendingUser.first_name,
        pendingUser.last_name,
        pendingUser.email,
        pendingUser.username,
        pendingUser.password,
        pendingUser.phone,
        pendingUser.role
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
    console.error(err);
    return NextResponse.json(
      { data:  "Internal server error" },
      { status: 500 }
    );
  }
}