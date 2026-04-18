import { MailDataRequired } from "@sendgrid/helpers/classes/mail";
import { Mail } from "@/lib/types";
import sgMail from "@sendgrid/mail";

let isSendGrid:boolean = false;
const INTERNAL_EMAIL = process.env.GMAIL_EMAIL;
let emailCount=1; // just for testing, lol

// bro please don't spam this one. 
export async function sendTestEmail(){
  try{

    if (!INTERNAL_EMAIL) 
      throw new Error("INTERNAL_EMAIL is not defined. Please set the GMAIL_EMAIL environment variable.");

    const recipientEmail = INTERNAL_EMAIL;
    const subject = `Email Test #${emailCount}`;
    const text = "Hello world! I'm sending emails to myself because I'm cool.";
    const email:Mail = {to: recipientEmail, subject:subject, text:text}
    await sendEmail(email);
    emailCount++;  
  } 
  catch(err) {
    console.error("Failed to send test email:", err);
    throw err;
  }
}

export async function sendEmail(email:Mail){
  try{
    if (!INTERNAL_EMAIL) 
      throw new Error("INTERNAL_EMAIL is not defined. Please set the GMAIL_EMAIL environment variable.");

    const maildata:MailDataRequired = {to: email.to, subject: email.subject, text: email.text,from: INTERNAL_EMAIL};

    if (!isSendGrid)
      await initalizeSendGrid();

    await sgMail.send(maildata);
  } 
  
  catch(err) {
    throw err;
  }
}

async function initalizeSendGrid(){
  try {
    sgMail.setApiKey(process.env.SENDGRIND_API_KEY || "");
    isSendGrid = true;  
  } 
  
  catch (err) {
    console.error("Failed to set SendGrid API key:", err);
    throw err;
  }
}
