import "dotenv/config";
import {
  getOtpEmailTemplate,
  getOtpEmailPlainText,
} from "../utils/emailTemplates";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Brevo Email Service using HTTP API (Fetch)
 * Integration based on user-provided logic.
 */
class BrevoEmailService {
  private apiUrl = "https://api.brevo.com/v3/smtp/email";

  private get config() {
    return {
      apiKey: process.env.BREVO_API_KEY,
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.EMAIL_FROM_NAME,
    };
  }

  /**
   * Send email using Brevo HTTP API
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { apiKey, fromEmail, fromName } = this.config;

    if (!apiKey) {
      console.error("BREVO_API_KEY not configured");
      return false;
    }

    const payload = {
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.text || "",
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as any;
        console.error(
          `❌ Brevo API Error (HTTP ${response.status}):`,
          JSON.stringify(errorData, null, 2),
        );
        return false;
      }

      console.log(`✅ Email sent successfully to ${options.to} via Brevo API`);
      return true;
    } catch (error: any) {
      console.error(`❌ Brevo API Connection Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Send OTP verification email (SwiftMart Implementation)
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    name?: string,
    purpose:
      | "verification"
      | "password_reset"
      | "email_change" = "verification",
  ): Promise<boolean> {
    const subjects = {
      verification: "Verify Your Email - SwiftMart",
      password_reset: "Reset Your Password - SwiftMart",
      email_change: "Confirm Email Change - SwiftMart",
    };

    const html = getOtpEmailTemplate(otp, name, purpose);
    const text = getOtpEmailPlainText(otp, name, purpose);

    console.log(`📧 Sending ${purpose} email to ${email}...`);

    return this.sendEmail({
      to: email,
      subject: subjects[purpose],
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    otp: string,
    name?: string,
  ): Promise<boolean> {
    return this.sendOtpEmail(email, otp, name, "password_reset");
  }

  /**
   * Send email change confirmation email
   */
  async sendEmailChangeEmail(
    email: string,
    otp: string,
    name?: string,
  ): Promise<boolean> {
    return this.sendOtpEmail(email, otp, name, "email_change");
  }
}

const serviceInstance = new BrevoEmailService();

export const sendOtpEmail = serviceInstance.sendOtpEmail.bind(serviceInstance);
export const sendPasswordResetEmail =
  serviceInstance.sendPasswordResetEmail.bind(serviceInstance);
export const sendEmailChangeEmail =
  serviceInstance.sendEmailChangeEmail.bind(serviceInstance);

// Default export for general uses
const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  return serviceInstance.sendEmail({ to, subject, html });
};
export default sendEmail;
