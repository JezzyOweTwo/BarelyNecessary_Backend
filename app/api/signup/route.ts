import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query_db, exists } from "@/lib/database_handler";
import { v4 as uuidv4 } from "uuid";
import {requireAdminAuth} from "@/lib/validators";
import {guardRoute} from "@/lib/guard_route"
import {sendValidationEmail} from "@/lib/email-sender"
import { PendingUser } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, username, password, phone, isAdmin } = body;
    const missingFields = [];

    if (!first_name) missingFields.push("first_name");
    if (!last_name) missingFields.push("last_name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required field(s): ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    let role: "admin" | "customer" = "customer"; 
    const userID = uuidv4();  // 36 digit UUID in the format: xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx

    // checks if the caller is an administrator or not.
    const validate = await guardRoute(req,true,requireAdminAuth);
    if (!validate) role="admin"; // guardRoute only returns a value if it FAILS, not succeeds.

    // checks if the email is already in the DB
    const emailExists:boolean = await exists("users", "email", email);

    if (emailExists) {
      return NextResponse.json(
        { message: "Email already exists." },
        { status: 409 }
      );
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user:PendingUser ={
        user_id: userID,
        first_name: first_name,
        last_name: last_name,
        email: email,
        username: username,
        password: hashedPassword,
        phone: phone,
        role: role,
        is_active: false
    }

    // sends validation email, and saves user in redis
    sendValidationEmail(user);

    return NextResponse.json(
        { message: "Good job bud. Go check your email to validate your account." },
        { status: 201 }
    );
  }

  catch (error) {
    console.error("Unknown error: Signup failed:", error);

    return NextResponse.json(
      { message: "Unknown error: Signup failed." },
      { status: 500 }
    );
  }
}
