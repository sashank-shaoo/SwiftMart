/**
 * Email template for OTP verification
 */
export function getOtpEmailTemplate(
  otp: string,
  name?: string,
  purpose: "verification" | "password_reset" | "email_change" = "verification"
): string {
  const titles = {
    verification: "Verify Your Email",
    password_reset: "Reset Your Password",
    email_change: "Confirm Email Change",
  };

  const messages = {
    verification: "Welcome to SwiftMart! Please verify your email address.",
    password_reset: "You requested to reset your password.",
    email_change: "You requested to change your email address.",
  };

  const title = titles[purpose];
  const message = messages[purpose];

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                      SwiftMart
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    ${
                      name
                        ? `<p style="color: #333; font-size: 18px; margin: 0 0 20px 0;">Hello ${name},</p>`
                        : ""
                    }
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      ${message}
                    </p>

                    <p style="color: #666; font-size: 14px; margin: 0 0 15px 0; font-weight: 500;">
                      Your verification code is:
                    </p>

                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%); border: 3px dashed #667eea; border-radius: 12px; padding: 25px; display: inline-block;">
                            <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; color: #667eea; font-family: 'Courier New', monospace;">
                              ${otp}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
                      This code will expire in <strong style="color: #667eea;">5 minutes</strong>
                    </p>
                  </td>
                </tr>

                <!-- Security Notice -->
                <tr>
                  <td style="background-color: #fff9e6; padding: 20px 30px; border-top: 1px solid #f0f0f0;">
                    <p style="color: #856404; font-size: 13px; margin: 0; line-height: 1.6;">
                      🔒 <strong>Security Notice:</strong> Never share this code with anyone. SwiftMart staff will never ask for your verification code.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; text-align: center; background-color: #fafafa; border-top: 1px solid #f0f0f0;">
                    <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
                      If you didn't request this code, please ignore this email.
                    </p>
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} SwiftMart. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Plain text version of OTP email (fallback)
 */
export function getOtpEmailPlainText(
  otp: string,
  name?: string,
  purpose: "verification" | "password_reset" | "email_change" = "verification"
): string {
  const messages = {
    verification: "Use the verification code below to verify your email address.",
    password_reset: "You requested to reset your password.",
    email_change: "You requested to change your email address.",
  };

  return `
${name ? `Hello ${name},` : "Hello,"}

${messages[purpose]}

Your verification code is: ${otp}

This code will expire in 5 minutes.

Security Notice: Never share this code with anyone. SwiftMart staff will never ask for your verification code.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} SwiftMart. All rights reserved.
  `.trim();
}
