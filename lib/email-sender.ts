import { PendingUser} from "./types";

import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import {redisSetJSON} from "@/lib/redis_handler"

const INTERNAL_EMAIL = process.env.GMAIL_EMAIL;
const VERIFICATION_CODE_LENGTH = 5;
const CODE_EXPIRATION_TIME=1800; //in seconds, aka 30 minutes
const VERIFICATION_CODE_CONFIG = {
  upperCaseAlphabets:false,
  lowerCaseAlphabets:false,
  specialChars:false
}

var emailCount=1; // just for testing, lol
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_SMTP, 
  },
});

// bro please don't spam this one. 
export async function sendTestEmail(){
  transporter.sendMail({
    from: INTERNAL_EMAIL,
    to: INTERNAL_EMAIL,
    subject: `Email Test #${emailCount}`,
    text: "Hello world! I'm sending emails to myself because I'm cool.",
  });
  emailCount++;
}

export async function sendValidationEmail(user:PendingUser){
  const verificationCode = generateVerificationCode();
  user.verification_code = verificationCode;

  await redisSetJSON(`verify:${user.email}`, user, CODE_EXPIRATION_TIME);

  transporter.sendMail({
    from: INTERNAL_EMAIL,
    to: user.email,
    subject: `Barely Neccesary Account Signup`,
    text: `Hello and welcome to our app! Please verify your account with the following code: ${verificationCode}`
  });
}

export async function sendEmail(recipientEmail:any,subject:any,text:any){
  transporter.sendMail({
    from: INTERNAL_EMAIL,
    to: recipientEmail,
    subject: subject,
    text: text,
  });
}

function generateVerificationCode():string{
  const code = otpGenerator.generate(VERIFICATION_CODE_LENGTH,VERIFICATION_CODE_CONFIG );
  return code;
}