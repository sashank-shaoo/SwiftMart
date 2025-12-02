import nodemailer from "nodemailer";

const transporter: nodemailer.Transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true, // SSL
  port: 465,
  auth: {
    user: process.env.MAIL_USER as string,
    pass: process.env.MAIL_PASS as string,
  },
  tls: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"SWIfT.com" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);

    try {
      await new Promise((res) => setTimeout(res, 500));

      const info = await transporter.sendMail({
        from: `"SWIfT.com" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log("Email sent on retry:", info.messageId);
      return true;
    } catch (error) {
      console.error("Email failed again:", error);
      return false;
    }
  }
}

export default sendEmail;
