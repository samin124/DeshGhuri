/**
 * Email Templates for DeshGhuri Platform
 *
 * This module contains HTML email templates for various notifications.
 * Templates use inline CSS for maximum email client compatibility.
 */

interface EmailData {
  userName: string;
  userEmail: string;
  [key: string]: any;
}

const emailStyles = {
  container: 'font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;',
  header: 'background-color: #1f2937; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;',
  body: 'background-color: white; padding: 30px 20px; border-radius: 0 0 8px 8px;',
  button: 'display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;',
  footer: 'text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;',
};

/**
 * Seller Verification Approved Email
 */
export function sellerVerificationApprovedTemplate(data: EmailData & {
  businessName: string;
  message: string;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const html = `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
      </div>
      <div style="${emailStyles.body}">
        <h2 style="color: #1f2937; margin-top: 0;">Your seller account has been approved!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Dear ${data.userName},
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          We're excited to inform you that your seller account for <strong>${data.businessName}</strong>
          has been successfully verified and approved!
        </p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #166534; font-weight: 600;">Admin Message:</p>
          <p style="margin: 10px 0 0 0; color: #166534;">${data.message}</p>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          You can now start listing your services and managing your business on DeshGhuri.
        </p>
        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" style="${emailStyles.button}">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
          If you have any questions, please don't hesitate to contact our support team.
        </p>
      </div>
      <div style="${emailStyles.footer}">
        <p>© ${new Date().getFullYear()} DeshGhuri. All rights reserved.</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  const text = `
Congratulations!

Your seller account has been approved!

Dear ${data.userName},

We're excited to inform you that your seller account for ${data.businessName} has been successfully verified and approved!

Admin Message: ${data.message}

You can now start listing your services and managing your business on DeshGhuri.

Go to Dashboard: ${data.dashboardUrl}

If you have any questions, please don't hesitate to contact our support team.

© ${new Date().getFullYear()} DeshGhuri. All rights reserved.
`;

  return {
    subject: '🎉 Your DeshGhuri Seller Account is Approved!',
    html,
    text,
  };
}

/**
 * Seller Verification Rejected Email
 */
export function sellerVerificationRejectedTemplate(data: EmailData & {
  businessName: string;
  message: string;
  reason?: string;
  reapplyUrl: string;
}): { subject: string; html: string; text: string } {
  const html = `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="margin: 0; font-size: 28px;">Seller Application Update</h1>
      </div>
      <div style="${emailStyles.body}">
        <h2 style="color: #1f2937; margin-top: 0;">Regarding Your Seller Application</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Dear ${data.userName},
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Thank you for your interest in becoming a seller on DeshGhuri. After reviewing your application
          for <strong>${data.businessName}</strong>, we regret to inform you that we cannot approve it at this time.
        </p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b; font-weight: 600;">Admin Message:</p>
          <p style="margin: 10px 0 0 0; color: #991b1b;">${data.message}</p>
          ${data.reason ? `<p style="margin: 10px 0 0 0; color: #991b1b;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          You're welcome to address these concerns and reapply. Please ensure all required information
          and documents meet our guidelines.
        </p>
        <div style="text-align: center;">
          <a href="${data.reapplyUrl}" style="${emailStyles.button}">
            Review Application
          </a>
        </div>
        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
          If you have any questions or need clarification, please contact our support team.
        </p>
      </div>
      <div style="${emailStyles.footer}">
        <p>© ${new Date().getFullYear()} DeshGhuri. All rights reserved.</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  const text = `
Seller Application Update

Regarding Your Seller Application

Dear ${data.userName},

Thank you for your interest in becoming a seller on DeshGhuri. After reviewing your application for ${data.businessName}, we regret to inform you that we cannot approve it at this time.

Admin Message: ${data.message}
${data.reason ? `Reason: ${data.reason}` : ''}

You're welcome to address these concerns and reapply. Please ensure all required information and documents meet our guidelines.

Review Application: ${data.reapplyUrl}

If you have any questions or need clarification, please contact our support team.

© ${new Date().getFullYear()} DeshGhuri. All rights reserved.
`;

  return {
    subject: 'DeshGhuri Seller Application Update',
    html,
    text,
  };
}

/**
 * Seller Application Incomplete - Request More Information
 */
export function sellerVerificationIncompleteTemplate(data: EmailData & {
  businessName: string;
  message: string;
  applicationUrl: string;
}): { subject: string; html: string; text: string } {
  const html = `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="margin: 0; font-size: 28px;">Action Required</h1>
      </div>
      <div style="${emailStyles.body}">
        <h2 style="color: #1f2937; margin-top: 0;">Additional Information Needed</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Dear ${data.userName},
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Thank you for your seller application for <strong>${data.businessName}</strong>.
          We need some additional information to proceed with your verification.
        </p>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">Required Actions:</p>
          <p style="margin: 10px 0 0 0; color: #92400e;">${data.message}</p>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          Please log in to your account and provide the requested information as soon as possible.
        </p>
        <div style="text-align: center;">
          <a href="${data.applicationUrl}" style="${emailStyles.button}">
            Complete Application
          </a>
        </div>
        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
      <div style="${emailStyles.footer}">
        <p>© ${new Date().getFullYear()} DeshGhuri. All rights reserved.</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  const text = `
Action Required

Additional Information Needed

Dear ${data.userName},

Thank you for your seller application for ${data.businessName}. We need some additional information to proceed with your verification.

Required Actions: ${data.message}

Please log in to your account and provide the requested information as soon as possible.

Complete Application: ${data.applicationUrl}

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} DeshGhuri. All rights reserved.
`;

  return {
    subject: 'Action Required: Additional Information Needed for Your Seller Application',
    html,
    text,
  };
}

/**
 * Seller Application In Review
 */
export function sellerVerificationInReviewTemplate(data: EmailData & {
  businessName: string;
  message: string;
}): { subject: string; html: string; text: string } {
  const html = `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="margin: 0; font-size: 28px;">Application Update</h1>
      </div>
      <div style="${emailStyles.body}">
        <h2 style="color: #1f2937; margin-top: 0;">Your Application is Being Reviewed</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Dear ${data.userName},
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Your seller application for <strong>${data.businessName}</strong> is now under review by our team.
        </p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">Admin Message:</p>
          <p style="margin: 10px 0 0 0; color: #1e40af;">${data.message}</p>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          We'll notify you once the review is complete. This typically takes 2-3 business days.
        </p>
        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
          Thank you for your patience!
        </p>
      </div>
      <div style="${emailStyles.footer}">
        <p>© ${new Date().getFullYear()} DeshGhuri. All rights reserved.</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  const text = `
Application Update

Your Application is Being Reviewed

Dear ${data.userName},

Your seller application for ${data.businessName} is now under review by our team.

Admin Message: ${data.message}

We'll notify you once the review is complete. This typically takes 2-3 business days.

Thank you for your patience!

© ${new Date().getFullYear()} DeshGhuri. All rights reserved.
`;

  return {
    subject: 'Your Seller Application is Being Reviewed',
    html,
    text,
  };
}

/**
 * Document Approved Email
 */
export function documentApprovedTemplate(data: EmailData & {
  documentType: string;
  businessName: string;
}): { subject: string; html: string; text: string } {
  const html = `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="margin: 0; font-size: 28px;">✓ Document Approved</h1>
      </div>
      <div style="${emailStyles.body}">
        <h2 style="color: #1f2937; margin-top: 0;">Document Verification Complete</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Dear ${data.userName},
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Good news! Your <strong>${data.documentType}</strong> for <strong>${data.businessName}</strong>
          has been reviewed and approved.
        </p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;">
            ✓ Document Status: <strong>Approved</strong>
          </p>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          This brings you one step closer to completing your seller verification.
        </p>
      </div>
      <div style="${emailStyles.footer}">
        <p>© ${new Date().getFullYear()} DeshGhuri. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
Document Approved

Document Verification Complete

Dear ${data.userName},

Good news! Your ${data.documentType} for ${data.businessName} has been reviewed and approved.

Document Status: Approved

This brings you one step closer to completing your seller verification.

© ${new Date().getFullYear()} DeshGhuri. All rights reserved.
`;

  return {
    subject: 'Document Approved - ' + data.documentType,
    html,
    text,
  };
}

/**
 * Document Rejected Email
 */
export function documentRejectedTemplate(data: EmailData & {
  documentType: string;
  businessName: string;
  rejectionReason: string;
  reuploadUrl: string;
}): { subject: string; html: string; text: string } {
  const html = `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1 style="margin: 0; font-size: 28px;">Document Review Update</h1>
      </div>
      <div style="${emailStyles.body}">
        <h2 style="color: #1f2937; margin-top: 0;">Document Requires Attention</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Dear ${data.userName},
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Your <strong>${data.documentType}</strong> for <strong>${data.businessName}</strong>
          could not be approved at this time.
        </p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b; font-weight: 600;">Reason for Rejection:</p>
          <p style="margin: 10px 0 0 0; color: #991b1b;">${data.rejectionReason}</p>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          Please upload a new document that addresses the issues mentioned above.
        </p>
        <div style="text-align: center;">
          <a href="${data.reuploadUrl}" style="${emailStyles.button}">
            Upload New Document
          </a>
        </div>
        <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
      <div style="${emailStyles.footer}">
        <p>© ${new Date().getFullYear()} DeshGhuri. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
Document Review Update

Document Requires Attention

Dear ${data.userName},

Your ${data.documentType} for ${data.businessName} could not be approved at this time.

Reason for Rejection: ${data.rejectionReason}

Please upload a new document that addresses the issues mentioned above.

Upload New Document: ${data.reuploadUrl}

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} DeshGhuri. All rights reserved.
`;

  return {
    subject: 'Document Review Required - ' + data.documentType,
    html,
    text,
  };
}
