import nodemailer from "nodemailer";

/**
 * Creates a Nodemailer transporter from environment variables.
 *
 * Required .env variables:
 *   SMTP_HOST     – e.g. smtp.gmail.com
 *   SMTP_PORT     – e.g. 587
 *   SMTP_USER     – sender email address
 *   SMTP_PASS     – sender email password / app password
 *   SMTP_FROM     – "From" display address (defaults to SMTP_USER)
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true", // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends an OTP verification email to the given address.
 *
 * @param {string} toEmail   - Recipient email
 * @param {string} otp       - The 6-digit OTP code
 */
export async function sendOtpEmail(toEmail, otp) {
  const transporter = createTransporter();

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"PeerPrep" <${from}>`,
    to: toEmail,
    subject: "PeerPrep – Verify your email address",
    text: `Your PeerPrep verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#3b82f6;">Verify your PeerPrep email</h2>
        <p>Thanks for signing up! Use the code below to verify your email address:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;
                    padding:16px;background:#f3f4f6;border-radius:8px;margin:24px 0;">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color:#6b7280;font-size:12px;">If you did not create a PeerPrep account, you can safely ignore this email.</p>
      </div>
    `,
  });
}
