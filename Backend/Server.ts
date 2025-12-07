import dotenv from "dotenv";
dotenv.config();
import app from "./src/App";
import { otpCleanupService } from "./src/services/OtpCleanupService";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // Start OTP cleanup service (runs every 15 minutes)
  otpCleanupService.start(15);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  otpCleanupService.stop();
  process.exit(0);
});
