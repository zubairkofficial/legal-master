import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,

  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
});

transporter.verify()
  .then(() => {
    console.log("✅ SMTP Verified");
    return transporter.sendMail({
      from: `"Legal Master AI" <${process.env.MAIL_USERNAME}>`, 
      to: "your_test_email@gmail.com",
      subject: "Test Email",
      text: "This is a test email from Legal Master",
    });

  })
  .then(() => console.log("✅ Email sent"))
  .catch(err => console.error("❌ Send failed:", err));
