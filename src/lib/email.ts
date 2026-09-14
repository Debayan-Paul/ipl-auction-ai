import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Global debug store for development testing
export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  timestamp: string;
  link?: string;
  code?: string;
}

const recentEmails: SentEmailLog[] = [];

export function getRecentEmails(): SentEmailLog[] {
  return [...recentEmails].reverse();
}

/**
 * Creates SMTP transporter if configured
 */
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    return null;
  }

  // If using Gmail, Nodemailer's built-in service: 'gmail' is fastest and handles SSL automatically
  if (host === 'smtp.gmail.com' || (!host && user.endsWith('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  if (!host) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Dispatches an email using the best available configured method
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<{ success: boolean; method: string; error?: string }> {
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'IPL Auction Arena <noreply@iplauctionarena.com>';

  // 1. Try Nodemailer / Custom SMTP
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' '),
      });
      console.log(`[EMAIL] Sent via SMTP to ${to} (Subject: "${subject}")`);
      return { success: true, method: 'smtp' };
    } catch (err: any) {
      console.error('[EMAIL] SMTP error:', err.message);
    }
  }

  // 2. Try Resend if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey !== 're_mock') {
    try {
      const resend = new Resend(resendApiKey);
      const resendFrom = process.env.RESEND_FROM || 'IPL Auction Arena <onboarding@resend.dev>';
      const res = await resend.emails.send({
        from: resendFrom,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' '),
      });

      if (res.error) {
        console.error('[EMAIL] Resend returned error:', res.error);
        const isSandboxRestricted = res.error.statusCode === 403 || res.error.message?.includes('testing emails');
        return {
          success: false,
          method: 'resend',
          error: res.error.message,
          sandboxRestricted: isSandboxRestricted,
        } as any;
      } else {
        console.log(`[EMAIL] Delivered via Resend to ${to} (Message ID: ${res.data?.id})`);
        return { success: true, method: 'resend' };
      }
    } catch (err: any) {
      console.error('[EMAIL] Resend exception:', err.message);
    }
  }

  // 3. Fallback / Dev Mode
  console.log('\n=============================================================');
  console.log(`📧 [CUSTOM MAIL SENDER - DEV/SIMULATION MODE]`);
  console.log(`To: ${to}`);
  console.log(`From: ${from}`);
  console.log(`Subject: ${subject}`);
  console.log('=============================================================\n');

  return { success: true, method: 'simulated' };
}

/**
 * Sends a password reset email with both a direct link and a 6-digit OTP code
 */
export async function sendPasswordResetEmail(
  email: string,
  { resetUrl, code, fullName }: { resetUrl: string; code?: string; fullName?: string }
) {
  const name = fullName || 'Manager';
  recentEmails.push({
    id: Math.random().toString(36).substring(7),
    to: email,
    subject: 'Reset your IPL Auction Arena Password',
    timestamp: new Date().toISOString(),
    link: resetUrl,
    code,
  });

  const otpSection = code
    ? `
      <p style="margin-bottom: 8px;"><strong>Your 6-digit Password Reset Code:</strong></p>
      <div style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffd700; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 215, 0, 0.3); padding: 18px; border-radius: 10px; text-align: center; margin: 20px 0;">
        ${code}
      </div>
      <p>Or click the button below to reset immediately:</p>
    `
    : `<p>Click the button below to choose a new password:</p>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset your password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0f17; color: #ffffff; margin: 0; padding: 24px; }
        .container { max-width: 560px; margin: 0 auto; background: #151a26; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 36px; }
        .logo { font-size: 32px; margin-bottom: 20px; }
        h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 0; }
        p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
        .btn { display: inline-block; background: linear-gradient(135deg, #e5a93b 0%, #ff8c00 100%); color: #000000 !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; margin-top: 28px; font-size: 12px; color: #64748b; }
        .url-box { word-break: break-all; font-family: monospace; font-size: 12px; color: #e5a93b; background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏏 IPL Auction Arena</div>
        <h1>Password Reset Request</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password for your IPL Auction Arena account.</p>
        ${otpSection}
        <a href="${resetUrl}" class="btn">Reset My Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <div class="url-box">${resetUrl}</div>
        <p style="margin-top: 24px; font-size: 13px; color: #f59e0b;">⏳ This code and link expire in <strong>1 hour</strong>.</p>
        <div class="footer">
          <p>If you did not request this password reset, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} IPL Auction Arena. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: code ? `${code} is your IPL Auction Arena password reset code` : 'Reset your IPL Auction Arena Password',
    html,
  });
}

/**
 * Sends a custom email verification message
 */
export async function sendVerificationEmail(
  email: string,
  { verifyUrl, code, fullName }: { verifyUrl: string; code: string; fullName?: string }
) {
  const name = fullName || 'Manager';
  recentEmails.push({
    id: Math.random().toString(36).substring(7),
    to: email,
    subject: 'Verify your IPL Auction Arena Account',
    timestamp: new Date().toISOString(),
    link: verifyUrl,
    code,
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your email</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0f17; color: #ffffff; margin: 0; padding: 24px; }
        .container { max-width: 560px; margin: 0 auto; background: #151a26; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 36px; }
        .logo { font-size: 32px; margin-bottom: 20px; }
        h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 0; }
        p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
        .otp-box { font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffd700; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 215, 0, 0.3); padding: 18px; border-radius: 10px; text-align: center; margin: 24px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0055a4 0%, #0099ff 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; margin: 16px 0; text-align: center; }
        .footer { border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; margin-top: 28px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏏 IPL Auction Arena</div>
        <h1>Welcome to IPL Auction Arena!</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for signing up! Please verify your email address to activate your account and start building your championship squad.</p>
        
        <p style="margin-bottom: 8px;"><strong>Your 6-digit verification code:</strong></p>
        <div class="otp-box">${code}</div>
        
        <p>Or verify directly with a single click:</p>
        <a href="${verifyUrl}" class="btn">Verify My Email</a>
        
        <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">This code and link will expire in <strong>24 hours</strong>.</p>
        <div class="footer">
          <p>If you did not sign up for an IPL Auction Arena account, please disregard this email.</p>
          <p>&copy; ${new Date().getFullYear()} IPL Auction Arena. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${code} is your IPL Auction Arena verification code`,
    html,
  });
}
