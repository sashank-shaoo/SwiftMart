import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import { SellerDao } from "../daos/SellerDao";
import { AdminDao } from "../daos/AdminDao";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { NotificationDao } from "../daos/NotificationDao";
import { jwtCookieOptions } from "../utils/cookieParser";
import { EmailOtpDao } from "../daos/EmailOtpDao";
import { generateOtp } from "../utils/otpHelpers";
import { sendOtpEmail } from "../services/EmailService";


//--------User Credentials--------//

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existing = await UserDao.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await UserDao.createUser({
      name,
      email,
      password: hashedPassword,
      role: "user",
      is_seller_verified: false,
      is_admin_verified: false,
    });

    const token = sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    res.cookie("auth_token", token, jwtCookieOptions);

    const { password: pw, ...finalUser } = newUser;

    // Auto-send verification OTP
    try {
      const otp = generateOtp();
      await EmailOtpDao.createOtp(email, otp, "user", "email_verification");
      await sendOtpEmail(email, otp, name, "verification");
      console.log(`📧 Verification OTP sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      user: finalUser,
      verification_sent: true,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

export const becomeSeller = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    // 1. Get user details
    const user = await UserDao.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // 2. Check if already a seller
    const existingSeller = await SellerDao.findSellerByEmail(user.email);
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "You are already registered as a seller",
      });
    }

    // 3. Create Seller from User credentials
    const newSeller = await SellerDao.createSeller({
      name: user.name,
      email: user.email,
      password: user.password, // Existing hashed password
      location: user.location,
      number: user.number,
      role: "seller",
      is_seller_verified: false,
      is_admin_verified: false,
      is_verified_email: user.is_verified_email,
    });

    // 4. Create Admin Notification
    try {
      await NotificationDao.createNotification({
        type: "SELLER_MIGRATION",
        message: `User ${user.name} (${user.email}) applied to become a Seller`,
        metadata: {
          seller_id: newSeller.id,
          user_id: user.id,
          email: user.email,
        },
      });
      console.log(
        `🔔 Admin notification created for seller migration: ${user.email}`
      );
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError);
    }

    return res.status(201).json({
      success: true,
      message:
        "Application submitted! Wait for further instructions.",
      seller: {
        id: newSeller.id,
        name: newSeller.name,
        email: newSeller.email,
      },
    });
  } catch (error: any) {
    console.error("Seller Migration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process seller migration application",
      error: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing email or password",
      });
    }

    const user = await UserDao.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // JWT token
    const token = sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, jwtCookieOptions);
    const { password: pw, ...finalUser } = user;

    return res.json({
      success: true,
      message: "Login successful",
      user: finalUser,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login user",
    });
  }
};

export const logOutUser = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", jwtCookieOptions);
  return res.json({
    success: true,
    message: "User logged out successfully",
  });
};


//--------Seller Credentials--------//
export const registerSeller = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existing = await SellerDao.findSellerByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Seller already exists",
      });
    }

    const hashedPassword = await hash(password, 10);

    const newSeller = await SellerDao.createSeller({
      name,
      email,
      password: hashedPassword,
      is_seller_verified: false,
      is_admin_verified: false,
      role: "seller",
    });

    const token = sign(
      { id: newSeller.id, role: newSeller.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    res.cookie("auth_token", token, jwtCookieOptions);

    const { password: pw, ...finalSeller } = newSeller;

    // Auto-send verification OTP
    try {
      const otp = generateOtp();
      await EmailOtpDao.createOtp(email, otp, "seller", "email_verification");
      await sendOtpEmail(email, otp, name, "verification");
      console.log(`📧 Verification OTP sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    // Create Admin Notification
    try {
      await NotificationDao.createNotification({
        type: "SELLER_REGISTRATION",
        message: `New seller registered: ${name} (${email})`,
        metadata: { seller_id: newSeller.id, email: email, name: name },
      });
      console.log(`🔔 Admin notification created for new seller: ${email}`);
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError);
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      seller: finalSeller,
      verification_sent: true,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Seller already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register seller",
    });
  }
};

export const loginSeller = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing email or password",
      });
    }

    const seller = await SellerDao.findSellerByEmail(email);
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isMatch = await compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = sign(
      { id: seller.id, role: seller.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("auth_token", token, jwtCookieOptions);
    const { password: pw, ...finalSeller } = seller;

    return res.json({
      success: true,
      message: "Login successful",
      seller: finalSeller,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Seller login failed",
    });
  }
};

export const logOutSeller = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", jwtCookieOptions);
  return res.json({
    success: true,
    message: "Seller logged out successfully",
  });
};

//--------Admin Credentials--------//
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existing = await AdminDao.findAdminByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await hash(password, 10);
    const admin = await AdminDao.createAdmin({
      name,
      email,
      role: "admin",
      password: hashedPassword,
    });
    const token = sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("auth_token", token, jwtCookieOptions);
    const { password: pw, ...finalAdmin } = admin;

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: finalAdmin,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to register admin",
    });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing email or password",
      });
    }
    const admin = await AdminDao.findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isValid = await compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const token = sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("auth_token", token, jwtCookieOptions);
    const { password: pw, ...finalAdmin } = admin;

    return res.json({
      success: true,
      message: "Login successful",
      admin: finalAdmin,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to login admin",
    });
  }
};

export const logOutAdmin = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", jwtCookieOptions);
  return res.json({
    success: true,
    message: "Admin logged out successfully",
  });
};


