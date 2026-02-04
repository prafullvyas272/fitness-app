import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Dynamically use email credentials from environment variables (.env)
export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: String(process.env.MAIL_SECURE).toLowerCase() === "true", // set to true for SSL/TLS, false for STARTTLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendOtpEmail = async (to, otp) => {
  const subject = "Your OTP Code";
  const text = `Your OTP code is: ${otp}`;
  const html = `<p>Your OTP code is: <b>${otp}</b></p>`;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

