/**
 * Email Service
 * 
 * Handles sending emails for password reset and other notifications
 * Supports both production (nodemailer) and mock implementations
 */

import nodemailer from 'nodemailer';
import logger from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  message: string;
}

// Determine if we're using mock mode (for development/testing)
const USE_MOCK_EMAIL = process.env.USE_MOCK_EMAIL !== 'false' && process.env.NODE_ENV !== 'production';

// Create transporter based on environment
let transporter: nodemailer.Transporter | null = null;

if (!USE_MOCK_EMAIL) {
  // Production email configuration
  const emailConfig = {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  transporter = nodemailer.createTransport(emailConfig);
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    if (USE_MOCK_EMAIL) {
      // Mock mode: just log the email
      logger.info(`[MOCK EMAIL] To: ${options.to}, Subject: ${options.subject}`);
      logger.info(`[MOCK EMAIL] Body: ${options.text}`);
      return {
        success: true,
        message: 'Email would be sent in production',
      };
    }

    if (!transporter) {
      throw new Error('Email transporter not configured');
    }

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@artipanel.local',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`Email sent successfully: ${result.messageId}`);
    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error: any) {
    logger.error('Failed to send email', error);
    return {
      success: false,
      message: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string,
  resetUrl: string
): Promise<EmailResult> {
  const subject = 'ArtiPanel Password Reset Request';
  const text = `
Hello ${username},

You requested a password reset for your ArtiPanel account.

To reset your password, visit the following link:
${resetUrl}?token=${resetToken}

This link will expire in 15 minutes.

If you did not request this, please ignore this email.

---
ArtiPanel Team
  `.trim();

  const html = `
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f7fafc; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h1 style="color: #1a202c; margin-top: 0;">Password Reset Request</h1>
      <p style="color: #4a5568;">Hello <strong>${username}</strong>,</p>
      <p style="color: #4a5568;">You requested a password reset for your ArtiPanel account.</p>
      
      <p style="color: #4a5568;">To reset your password, click the button below:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}?token=${resetToken}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #718096; font-size: 12px;">This link will expire in 15 minutes.</p>
      <p style="color: #718096; font-size: 12px;">If you did not request this, you can safely ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">© 2025 ArtiPanel - Server Management Panel</p>
    </div>
  </body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}

/**
 * Verify email transporter (for testing/logging)
 */
export async function verifyEmailTransporter(): Promise<boolean> {
  if (USE_MOCK_EMAIL) {
    logger.info('Using mock email mode');
    return true;
  }

  if (!transporter) {
    logger.warn('Email transporter not configured');
    return false;
  }

  try {
    await transporter.verify();
    logger.info('Email transporter verified successfully');
    return true;
  } catch (error: any) {
    logger.error('Failed to verify email transporter', error);
    return false;
  }
}
