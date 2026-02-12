import nodemailer from 'nodemailer';
import { env } from '@DeshGhuri/env/server';

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465, // true for 465, false for other ports (587 uses STARTTLS)
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certs in development
    rejectUnauthorized: env.NODE_ENV === 'production',
  },
});

/**
 * Send email verification link
 */
export async function sendVerificationEmail({
  to,
  userName,
  verificationUrl,
}: {
  to: string;
  userName: string | null;
  verificationUrl: string;
}) {
  console.log('\n=== SENDING VERIFICATION EMAIL ===');
  console.log('📧 To:', to);
  console.log('👤 Name:', userName);
  console.log('🔗 Verification URL:', verificationUrl);
  console.log('🏠 Email Host:', env.EMAIL_HOST);
  console.log('🔌 Email Port:', env.EMAIL_PORT);
  console.log('👨‍💼 Email User:', env.EMAIL_USER);
  console.log('==================================\n');

  try {
    const info = await transporter.sendMail({
      from: `"DeshGhuri" <${env.EMAIL_FROM}>`,
      to,
      subject: 'Verify your email address - DeshGhuri',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4F46E5; margin: 0;">DeshGhuri</h1>
                <p style="color: #6B7280; margin-top: 5px;">Multi-Vendor Travel Marketplace</p>
              </div>

              <h2 style="color: #1F2937; margin-bottom: 20px;">Welcome, ${userName || 'there'}!</h2>

              <p style="color: #4B5563; line-height: 1.6; margin-bottom: 25px;">
                Thank you for registering with DeshGhuri. To complete your registration and start booking amazing travel experiences, please verify your email address by clicking the button below:
              </p>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationUrl}"
                   style="background-color: #4F46E5; color: white; padding: 14px 32px;
                          text-decoration: none; border-radius: 8px; display: inline-block;
                          font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>

              <p style="color: #6B7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <strong>Important:</strong> This verification link will expire in 24 hours.
              </p>

              <p style="color: #6B7280; font-size: 14px; margin-top: 15px;">
                If you didn't create an account with DeshGhuri, you can safely ignore this email.
              </p>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">
                  © 2026 DeshGhuri. All rights reserved.
                </p>
                <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">
                  Multi-Vendor Travel Marketplace
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('\n✅ Verification email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📝 Response:', info.response);
    console.log('✉️ Envelope:', JSON.stringify(info.envelope));
    console.log('==================================\n');
    return info;
  } catch (error) {
    console.error('\n❌ ERROR SENDING VERIFICATION EMAIL');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error('==================================\n');
    throw error;
  }
}

/**
 * Send password reset link
 */
export async function sendResetPasswordEmail({
  to,
  userName,
  resetUrl,
}: {
  to: string;
  userName: string | null;
  resetUrl: string;
}) {
  console.log('\n=== SENDING PASSWORD RESET EMAIL ===');
  console.log('📧 To:', to);
  console.log('👤 Name:', userName);
  console.log('🔗 Reset URL:', resetUrl);
  console.log('🏠 Email Host:', env.EMAIL_HOST);
  console.log('🔌 Email Port:', env.EMAIL_PORT);
  console.log('👨‍💼 Email User:', env.EMAIL_USER);
  console.log('====================================\n');

  try {
    const info = await transporter.sendMail({
      from: `"DeshGhuri" <${env.EMAIL_FROM}>`,
      to,
      subject: 'Reset your password - DeshGhuri',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4F46E5; margin: 0;">DeshGhuri</h1>
                <p style="color: #6B7280; margin-top: 5px;">Multi-Vendor Travel Marketplace</p>
              </div>

              <h2 style="color: #1F2937; margin-bottom: 20px;">Password Reset Request</h2>

              <p style="color: #4B5563; line-height: 1.6; margin-bottom: 10px;">
                Hi ${userName || 'there'},
              </p>

              <p style="color: #4B5563; line-height: 1.6; margin-bottom: 25px;">
                We received a request to reset the password for your DeshGhuri account. Click the button below to create a new password:
              </p>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}"
                   style="background-color: #4F46E5; color: white; padding: 14px 32px;
                          text-decoration: none; border-radius: 8px; display: inline-block;
                          font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>

              <p style="color: #6B7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <strong>Important:</strong> This password reset link will expire in 1 hour.
              </p>

              <p style="color: #6B7280; font-size: 14px; margin-top: 15px;">
                If you didn't request a password reset, please ignore this email. Your password will not be changed.
              </p>

              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin-top: 25px; border-radius: 4px;">
                <p style="color: #92400E; font-size: 13px; margin: 0;">
                  <strong>Security Tip:</strong> Never share your password with anyone. DeshGhuri will never ask for your password via email.
                </p>
              </div>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">
                  © 2026 DeshGhuri. All rights reserved.
                </p>
                <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">
                  Multi-Vendor Travel Marketplace
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('\n✅ Password reset email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📝 Response:', info.response);
    console.log('✉️ Envelope:', JSON.stringify(info.envelope));
    console.log('====================================\n');
    return info;
  } catch (error) {
    console.error('\n❌ ERROR SENDING PASSWORD RESET EMAIL');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error('====================================\n');
    throw error;
  }
}

// Test email configuration on startup
console.log('\n=== INITIALIZING EMAIL CONFIGURATION ===');
console.log('🏠 Host:', env.EMAIL_HOST);
console.log('🔌 Port:', env.EMAIL_PORT);
console.log('👨‍💼 User:', env.EMAIL_USER);
console.log('📤 From:', env.EMAIL_FROM);
console.log('=========================================\n');

transporter.verify((error) => {
  if (error) {
    console.error('\n❌ EMAIL CONFIGURATION ERROR');
    console.error('Error:', error);
    console.error('===============================\n');
  } else {
    console.log('\n✅ EMAIL SERVER IS READY');
    console.log('📧 Using:', env.EMAIL_USER);
    console.log('========================\n');
  }
});
