import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { exists } from "@/lib/database_handler";
import {redisSetJSON, testRedis} from "@/lib/redis_handler"
import { v4 as uuidv4 } from "uuid";
import {requireAuth} from "@/lib/validators";
import {guardRoute} from "@/lib/guard_route"
import otpGenerator from "otp-generator";
import { PendingUser,Mail } from "@/lib/types";
import { sendEmail } from "@/lib/email-sender";

const VERIFICATION_CODE_LENGTH = 5;
const CODE_EXPIRATION_TIME=1800; //in seconds, aka 30 minutes
const VERIFICATION_CODE_CONFIG = {
  upperCaseAlphabets:false,
  lowerCaseAlphabets:false,
  specialChars:false
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, username, password, phone_number, isAdmin } = body;
    const missingFields = [];

    if (!first_name) missingFields.push("first_name");
    if (!last_name) missingFields.push("last_name");
    if (!email) missingFields.push("email");
    if (!username) missingFields.push("username");
    if (!password) missingFields.push("password");
    if (!phone_number) missingFields.push("phone_number");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required field(s): ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    let role: "admin" | "customer" = "customer"; 
    const userID = uuidv4();    // 36 digit UUID in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    // console.log(`Generated userID: ${userID}`);
    // checks if the caller is an administrator or not.
    const validate = await guardRoute(requireAuth,true);
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
        phone: phone_number,
        role: role,
        is_active: false
    }

    // sends validation email, and saves user in redis
    await sendValidationEmail(user);

    return NextResponse.json(
        { message: "Good job bud. Go check your email to validate your account." },
        { status: 201 }
    );
  }

  catch (error) {
    console.error("Unknown error: Signup failed:\n", error);

    return NextResponse.json(
      { message: "Unknown error: Signup failed." },
      { status: 500 }
    );
  }
}

  async function sendValidationEmail(user:PendingUser){

    try{
      const code = otpGenerator.generate(VERIFICATION_CODE_LENGTH,VERIFICATION_CODE_CONFIG );
      user.verification_code = code;

      await redisSetJSON(`verify:${user.email}`, user, CODE_EXPIRATION_TIME);
      const mail:Mail = {
        to: user.email,
        subject: "Barely Necessary Account Signup",
        text: `Hello and welcome to our app! Please verify your account with the following code: ${code}`
      };
      await sendEmail(mail);
    } 
    
    catch (err){
      throw err;
    }
  }
