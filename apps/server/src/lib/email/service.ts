/**
 * Email Service for DeshGhuri Platform
 *
 * This service handles sending transactional emails using Resend.
 * Falls back to console logging in development if RESEND_API_KEY is not set.
 */

import {
  sellerVerificationApprovedTemplate,
  sellerVerificationRejectedTemplate,
  sellerVerificationIncompleteTemplate,
  sellerVerificationInReviewTemplate,
  documentApprovedTemplate,
  documentRejectedTemplate,
} from './templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private resendApiKey: string | undefined;
  private fromEmail: string;
  private isDevelopment: boolean;

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@deshghuri.com';
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Send an email using Resend API or log to console in development
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    // In development without Resend API key, just log the email
    if (this.isDevelopment && !this.resendApiKey) {
      console.log('\n📧 ========== EMAIL (Development Mode) ==========');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('---');
      console.log(options.text);
      console.log('================================================\n');
      return;
    }

    // Send email using Resend
    if (this.resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.resendApiKey}`,
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Resend API error:', error);
          throw new Error('Failed to send email');
        }

        console.log('✓ Email sent to:', options.to);
      } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
      }
    } else {
      console.warn('No email service configured. Email not sent:', options.subject);
    }
  }

  /**
   * Send seller verification approved email
   */
  async sendSellerVerificationApproved(data: {
    to: string;
    userName: string;
    businessName: string;
    message: string;
    dashboardUrl: string;
  }): Promise<void> {
    const template = sellerVerificationApprovedTemplate({
      userName: data.userName,
      userEmail: data.to,
      businessName: data.businessName,
      message: data.message,
      dashboardUrl: data.dashboardUrl,
    });

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send seller verification rejected email
   */
  async sendSellerVerificationRejected(data: {
    to: string;
    userName: string;
    businessName: string;
    message: string;
    reason?: string;
    reapplyUrl: string;
  }): Promise<void> {
    const template = sellerVerificationRejectedTemplate({
      userName: data.userName,
      userEmail: data.to,
      businessName: data.businessName,
      message: data.message,
      reason: data.reason,
      reapplyUrl: data.reapplyUrl,
    });

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send seller verification incomplete email
   */
  async sendSellerVerificationIncomplete(data: {
    to: string;
    userName: string;
    businessName: string;
    message: string;
    applicationUrl: string;
  }): Promise<void> {
    const template = sellerVerificationIncompleteTemplate({
      userName: data.userName,
      userEmail: data.to,
      businessName: data.businessName,
      message: data.message,
      applicationUrl: data.applicationUrl,
    });

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send seller verification in review email
   */
  async sendSellerVerificationInReview(data: {
    to: string;
    userName: string;
    businessName: string;
    message: string;
  }): Promise<void> {
    const template = sellerVerificationInReviewTemplate({
      userName: data.userName,
      userEmail: data.to,
      businessName: data.businessName,
      message: data.message,
    });

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send document approved email
   */
  async sendDocumentApproved(data: {
    to: string;
    userName: string;
    documentType: string;
    businessName: string;
  }): Promise<void> {
    const template = documentApprovedTemplate({
      userName: data.userName,
      userEmail: data.to,
      documentType: data.documentType,
      businessName: data.businessName,
    });

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send document rejected email
   */
  async sendDocumentRejected(data: {
    to: string;
    userName: string;
    documentType: string;
    businessName: string;
    rejectionReason: string;
    reuploadUrl: string;
  }): Promise<void> {
    const template = documentRejectedTemplate({
      userName: data.userName,
      userEmail: data.to,
      documentType: data.documentType,
      businessName: data.businessName,
      rejectionReason: data.rejectionReason,
      reuploadUrl: data.reuploadUrl,
    });

    await this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
