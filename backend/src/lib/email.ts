import sgMail from "@sendgrid/mail";
import { z } from "zod";

// Email configuration validation
const emailConfigSchema = z.object({
  apiKey: z.string(),
  fromEmail: z.string().email(),
  fromName: z.string(),
});

// Email template types
export interface InstitutionCredentials {
  institutionName: string;
  institutionSlug: string;
  adminEmail: string;
  adminPassword: string;
  loginUrl: string;
  supportEmail: string;
}

export interface SubscriptionNotification {
  institutionName: string;
  institutionSlug: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionEnd: Date;
  renewalUrl: string;
  supportEmail: string;
  adminEmail: string;
}

export interface PaymentNotification {
  institutionName: string;
  institutionSlug: string;
  amount: number;
  platformFee: number;
  institutionAmount: number;
  transactionId: string;
  paymentDate: Date;
  supportEmail: string;
  adminEmail: string;
}

class EmailService {
  private isConfigured = false;
  private fromEmail: string = "";
  private fromName: string = "";

  constructor() {
    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      this.fromEmail =
        process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || "";
      this.fromName = process.env.SENDGRID_FROM_NAME || "LEAD101 Platform";

    

      if (apiKey && this.fromEmail) {
        sgMail.setApiKey(apiKey);
        this.isConfigured = true;
        
      } else {
        console.warn(
          "Email service not configured - SendGrid API key or from email missing"
        );
        
      }
    } catch (error) {
     
      this.isConfigured = false;
    }
  }

  private async sendEmailInternal(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn("Email service not configured, skipping email send");
      return false;
    }

    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      };

      

      const response = await sgMail.send(msg);

      return true;
    } catch (error) {
     
      return false;
    }
  }

  /**
   * Send institution credentials to admin
   */
  async sendInstitutionCredentials(
    data: InstitutionCredentials
  ): Promise<boolean> {
    const subject = `Welcome to LEAD101 - Your Institution Account is Ready`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to LEAD101</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .credentials { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LEAD101</h1>
            <p>Your institution account is ready!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.institutionName} Team!</h2>
            
            <p>Your LEAD101 account has been successfully created. You can now start managing your leads and converting them into enrolled students.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Institution:</strong> ${data.institutionName}</p>
              <p><strong>Admin Email:</strong> ${data.adminEmail}</p>
              <p><strong>Password:</strong> ${data.adminPassword}</p>
              <p><strong>Login URL:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
            </div>
            
            <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            
            <div style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Login to Your Account</a>
            </div>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Login to your account using the credentials above</li>
              <li>Complete your institution profile</li>
              <li>Invite your team members</li>
              <li>Set up your lead capture forms</li>
              <li>Start managing your leads!</li>
            </ul>
            
            <h3>Need Help?</h3>
            <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
          </div>
          
          <div class="footer">
            <p>This email was sent by LEAD101 - Your Education CRM Platform</p>
            <p>© 2025 LEAD101. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to LEAD101 - Your Institution Account is Ready
      
      Hello ${data.institutionName} Team!
      
      Your LEAD101 account has been successfully created. You can now start managing your leads and converting them into enrolled students.
      
      Your Login Credentials:
      Institution: ${data.institutionName}
      Admin Email: ${data.adminEmail}
      Password: ${data.adminPassword}
      Login URL: ${data.loginUrl}
      
      Important: Please change your password after your first login for security purposes.
      
      What's Next?
      - Login to your account using the credentials above
      - Complete your institution profile
      - Invite your team members
      - Set up your lead capture forms
      - Start managing your leads!
      
      Need Help?
      If you have any questions or need assistance, please contact our support team at ${data.supportEmail}
      
      This email was sent by LEAD101 - Your Education CRM Platform
      © 2025 LEAD101. All rights reserved.
    `;

    return await this.sendEmailInternal(data.adminEmail, subject, html, text);
  }

  /**
   * Send subscription notification
   */
  async sendSubscriptionNotification(
    data: SubscriptionNotification
  ): Promise<boolean> {
    const subject = `LEAD101 Subscription Update - ${data.subscriptionTier} Plan`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
          .status.active { background: #d1fae5; color: #065f46; }
          .status.suspended { background: #fee2e2; color: #991b1b; }
          .status.expired { background: #fef3c7; color: #92400e; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Update</h1>
            <p>Your LEAD101 subscription has been updated</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.institutionName} Team!</h2>
            
            <p>Your LEAD101 subscription has been updated with the following details:</p>
            
            <div class="status ${data.subscriptionStatus.toLowerCase()}">
              <h3>Subscription Status: ${data.subscriptionStatus}</h3>
              <p><strong>Plan:</strong> ${data.subscriptionTier}</p>
              <p><strong>End Date:</strong> ${data.subscriptionEnd.toLocaleDateString()}</p>
            </div>
            
            ${
              data.subscriptionStatus === "ACTIVE"
                ? `
              <p>Your subscription is active and you can continue using all features of your ${data.subscriptionTier} plan.</p>
            `
                : data.subscriptionStatus === "SUSPENDED"
                ? `
              <p>Your subscription has been suspended. Please contact support to reactivate your account.</p>
            `
                : data.subscriptionStatus === "EXPIRED"
                ? `
              <p>Your subscription has expired. Please renew to continue using LEAD101.</p>
              <div style="text-align: center;">
                <a href="${data.renewalUrl}" class="button">Renew Subscription</a>
              </div>
            `
                : ""
            }
            
            <h3>Need Help?</h3>
            <p>If you have any questions about your subscription, please contact our support team at <a href="mailto:${
              data.supportEmail
            }">${data.supportEmail}</a></p>
          </div>
          
          <div class="footer">
            <p>This email was sent by LEAD101 - Your Education CRM Platform</p>
            <p>© 2025 LEAD101. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmailInternal(
      data.adminEmail || "admin@example.com",
      subject,
      html
    );
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(data: PaymentNotification): Promise<boolean> {
    const subject = `LEAD101 Payment Processed - ₹${data.amount}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Processed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .payment-details { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Processed</h1>
            <p>Your payment has been successfully processed</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.institutionName} Team!</h2>
            
            <p>Your payment has been successfully processed. Here are the details:</p>
            
            <div class="payment-details">
              <h3>Payment Details:</h3>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Payment Date:</strong> ${data.paymentDate.toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${data.amount}</p>
              <p><strong>Platform Fee:</strong> ₹${data.platformFee}</p>
              <p><strong>Institution Amount:</strong> ₹${
                data.institutionAmount
              }</p>
            </div>
            
            <p>Thank you for using LEAD101. Your payment has been processed and your account is up to date.</p>
            
            <h3>Need Help?</h3>
            <p>If you have any questions about this payment, please contact our support team at <a href="mailto:${
              data.supportEmail
            }">${data.supportEmail}</a></p>
          </div>
          
          <div class="footer">
            <p>This email was sent by LEAD101 - Your Education CRM Platform</p>
            <p>© 2025 LEAD101. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmailInternal(
      data.adminEmail || "admin@example.com",
      subject,
      html
    );
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const testEmail = this.fromEmail;
      if (!testEmail) {
        return false;
      }

      const msg = {
        to: testEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: "LEAD101 Email Service Test",
        html: "<p>This is a test email from LEAD101 email service.</p>",
        text: "This is a test email from LEAD101 email service.",
      };

      const response = await sgMail.send(msg);
      
      return true;
    } catch (error) {
      console.error("Failed to send test email:", error);
      return false;
    }
  }

  /**
   * Send generic email (public method)
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    return await this.sendEmailInternal(to, subject, html, text);
  }

  /**
   * Get email service status
   */
  getStatus(): { configured: boolean; ready: boolean } {
    return {
      configured: this.isConfigured,
      ready: this.isConfigured,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
