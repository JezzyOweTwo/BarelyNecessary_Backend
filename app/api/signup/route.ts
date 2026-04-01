import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query_db, exists } from "@/lib/database_handler";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"
import {requireAdminAuth} from "@/lib/auth";

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

    // you're tryna create an admin account. Only admins can create new admins.
    try {
      const response = await requireAdminAuth(req);   // will return a status based on if it works or nah
      if (!response.ok) 
        throw new Error(JSON.stringify((response.body as any).data));

      role="admin";
    } 

    // admin token validation unsucessful
    catch (err:any){
      return NextResponse.json(
        { message: err?.message},
        { status: 403 }
      );
    }

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

    // create auth token
    const authToken = jwt.sign(
      { userId: userID, role }, // payload
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // shove that shit in the database 
    await query_db(
      `INSERT INTO users
      (user_id,first_name, last_name, email, username, password, phone, role, is_active)
      VALUES (?,?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [userID,first_name, last_name, email, username, hashedPassword, phone, role]
    );

    return NextResponse.json({ 
      data: {
        message: "User created successfully.",
        authorization:` Bearer ${authToken}`
      }
    });
  } 
  
  catch (error) {
    console.error("Unknown error: Signup failed:", error);

    return NextResponse.json(
      { message: "Unknown error: Signup failed." },
      { status: 500 }
    );
  }
}