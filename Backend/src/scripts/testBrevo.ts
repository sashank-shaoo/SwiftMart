import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from the Backend root BEFORE importing other modules
dotenv.config({ path: path.join(__dirname, "../../.env") });

import { sendOtpEmail } from "../services/EmailService";

async function testBrevo() {
  console.log("🚀 Starting Brevo Test...");

  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error("❌ Please provide a test email address as an argument.");
    console.log(
      "Example: npx ts-node src/scripts/testBrevo.ts your-email@example.com"
    );
    process.exit(1);
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("❌ BREVO_API_KEY is not set in .env");
    process.exit(1);
  }

  console.log(`📡 Sending test email to: ${testEmail}`);

  try {
    const success = await sendOtpEmail(
      testEmail,
      "123456",
      "Test User",
      "verification"
    );
    if (success) {
      console.log("✅ Test email sent successfully!");
    } else {
      console.log("❌ Test email failed to send.");
    }
  } catch (error) {
    console.error("💥 An error occurred during the test:", error);
  }
}

testBrevo();
