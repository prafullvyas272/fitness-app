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
  const subject = "Forgot Password Request";
  const text = `
    Dear user,

    You requested a password reset for your account.

    Please use the following OTP code to proceed with resetting your password:

    OTP Code: ${otp}

    If you did not request this, please ignore this email.

    Thank you,
    The Support Team
  `;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #222;">
      <h2>Forgot Password Request</h2>
      <p>Dear user,</p>
      <p>You (or someone else) requested a password reset for your account.</p>
      <p>Please use the following OTP code to proceed with resetting your password:</p>
      <p style="font-size: 1.5em; font-weight: bold; color: #1976d2; letter-spacing: 4px;">
        ${otp}
      </p>
      <p>If you did not request this, please ignore this email.</p>
      <br />
      <p>Thank you,<br/>The Support Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

export const sendForgotPasswordEmail = async (to, resetToken) => {
  const subject = "Password Reset Request";
  const text = `You requested to reset your password. Use this token to proceed: ${resetToken}`;
  const html = `<p>You requested to reset your password.</p>
  <p>Use the following token to proceed with resetting your password:</p>
  <p><b>${resetToken}</b></p>`;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });
};


