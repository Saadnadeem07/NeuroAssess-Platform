import nodemailer, { type Transporter } from "nodemailer";
import { appUrl } from "./env";

/**
 * Transactional email via Nodemailer.
 *
 * If SMTP isn't configured (no EMAIL_USER), we fall back to logging the message
 * to the server console — so OTP / reset flows work in development with zero
 * email setup. Configure EMAIL_* in production.
 */

let cached: Transporter | null = null;

function transporter(): Transporter | null {
  if (!process.env.EMAIL_USER) return null;
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return cached;
}

type SendResult = { success: boolean; error?: unknown };

async function send(to: string, subject: string, html: string, devLine: string): Promise<SendResult> {
  const tx = transporter();
  if (!tx) {
    // eslint-disable-next-line no-console
    console.log(`\n📧 [email:dev] To: ${to}\n   Subject: ${subject}\n   ${devLine}\n`);
    return { success: true };
  }
  try {
    await tx.sendMail({ from: `"NeuroAssess Support" <${process.env.EMAIL_USER}>`, to, subject, html });
    return { success: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[email] send error:", error);
    return { success: false, error };
  }
}

const shell = (inner: string) =>
  `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color:#0f172a;">${inner}<p style="margin-top:24px;">Best regards,<br/>The NeuroAssess Team</p></div>`;

export function sendOTPEmail(email: string, otp: string, subject = "Verify Your Email - NeuroAssess") {
  return send(
    email,
    subject,
    shell(`
      <h2>Welcome to NeuroAssess!</h2>
      <p>Use the following verification code to complete your action. It expires in 15 minutes.</p>
      <div style="background:#f1f5f9; padding:16px; text-align:center; margin:20px 0; border-radius:8px;">
        <h1 style="color:#4f46e5; margin:0; letter-spacing:6px;">${otp}</h1>
      </div>
      <p>If you didn't request this, you can ignore this email.</p>`),
    `OTP code: ${otp}`
  );
}

export function sendResetPasswordEmail(email: string, resetUrl: string) {
  return send(
    email,
    "Reset Your Password - NeuroAssess",
    shell(`
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <div style="text-align:center; margin:28px 0;">
        <a href="${resetUrl}" style="background:#4f46e5; color:#fff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Reset Password</a>
      </div>
      <p>If you didn't request this, ignore this email.</p>`),
    `Reset URL: ${resetUrl}`
  );
}

export function sendApprovalEmail(email: string, name: string) {
  return send(
    email,
    "Your Psychiatrist Account Has Been Approved - NeuroAssess",
    shell(`
      <h2>Account Approved!</h2>
      <p>Congratulations, ${name}! Your psychiatrist account has been approved. You can now log in and use all professional features.</p>
      <div style="text-align:center; margin:28px 0;">
        <a href="${appUrl()}/login" style="background:#4f46e5; color:#fff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Log In Now</a>
      </div>`),
    `Account approved. Login: ${appUrl()}/login`
  );
}

export function sendRejectionEmail(email: string, name: string, reason: string) {
  return send(
    email,
    "Update on Your Psychiatrist Application - NeuroAssess",
    shell(`
      <h2>Application Update</h2>
      <p>Dear ${name},</p>
      <p>After careful review, we're unable to approve your psychiatrist account at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>You may still use the platform as a patient, or reapply with updated information.</p>`),
    `Application rejected. Reason: ${reason}`
  );
}

export function sendAppointmentEmails(appt: {
  patientName: string;
  psychiatristName: string;
  patientEmail: string;
  psychiatristEmail: string;
  date: Date;
  timeSlot: string;
}) {
  const formattedDate = new Date(appt.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return Promise.allSettled([
    send(
      appt.patientEmail,
      "Your Appointment Confirmation",
      shell(`<h2>Appointment Confirmation</h2><p>Dear ${appt.patientName}, your appointment with Dr. ${appt.psychiatristName} is scheduled for <strong>${formattedDate}</strong> at <strong>${appt.timeSlot}</strong>.</p>`),
      `Appointment confirmed: ${formattedDate} ${appt.timeSlot}`
    ),
    send(
      appt.psychiatristEmail,
      "New Appointment Scheduled",
      shell(`<h2>New Appointment</h2><p>Dear Dr. ${appt.psychiatristName}, a new appointment with ${appt.patientName} is scheduled for <strong>${formattedDate}</strong> at <strong>${appt.timeSlot}</strong>.</p>`),
      `New appointment: ${formattedDate} ${appt.timeSlot}`
    ),
  ]);
}

export function sendCancellationEmails(
  appt: {
    patientName: string;
    psychiatristName: string;
    patientEmail: string;
    psychiatristEmail: string;
    date: Date;
    timeSlot: string;
  },
  cancelledBy: "patient" | "psychiatrist"
) {
  const formattedDate = new Date(appt.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return Promise.allSettled([
    send(
      appt.patientEmail,
      "Appointment Cancellation Notice",
      shell(`<h2>Appointment Cancelled</h2><p>Dear ${appt.patientName}, your appointment with Dr. ${appt.psychiatristName} on <strong>${formattedDate}</strong> at <strong>${appt.timeSlot}</strong> has been cancelled ${cancelledBy === "psychiatrist" ? "by the psychiatrist" : "at your request"}.</p>`),
      `Appointment cancelled: ${formattedDate} ${appt.timeSlot}`
    ),
    send(
      appt.psychiatristEmail,
      "Appointment Cancellation Notice",
      shell(`<h2>Appointment Cancelled</h2><p>Dear Dr. ${appt.psychiatristName}, the appointment with ${appt.patientName} on <strong>${formattedDate}</strong> at <strong>${appt.timeSlot}</strong> has been cancelled ${cancelledBy === "patient" ? "by the patient" : "at your request"}.</p>`),
      `Appointment cancelled: ${formattedDate} ${appt.timeSlot}`
    ),
  ]);
}
