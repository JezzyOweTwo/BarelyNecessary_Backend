import nodemailer from "nodemailer";
const INTERNAL_EMAIL = process.env.GMAIL_EMAIL;

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

export async function sendEmail(recipientEmail:any,subject:any,text:any){
  transporter.sendMail({
    from: INTERNAL_EMAIL,
    to: recipientEmail,
    subject: subject,
    text: text,
  });
}