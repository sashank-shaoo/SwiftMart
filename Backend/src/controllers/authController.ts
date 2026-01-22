import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import { SellerProfileDao } from "../daos/SellerProfileDao";
import { AdminProfileDao } from "../daos/AdminProfileDao";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { NotificationDao } from "../daos/NotificationDao";
import { jwtCookieOptions } from "../utils/cookieParser";
import { EmailOtpDao } from "../daos/EmailOtpDao";
import { generateOtp } from "../utils/otpHelpers";
import { sendOtpEmail } from "../services/EmailService";

//--------Unified Authentication--------//

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
    });

    const token = sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );
    res.cookie("auth_token", token, jwtCookieOptions);

    const { password: pw, ...finalUser } = newUser;

    try {
      const otp = generateOtp();
      await EmailOtpDao.createOtp(email, otp, "user", "email_verification");
      await sendOtpEmail(email, otp, name, "verification");
      console.log(`📧 Verification OTP sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
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

export const registerSeller = async (req: Request, res: Response) => {
  try {
    const { name, email, password, store_name, gst_number, payout_details } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, password",
      });
    }

    const existing = await UserDao.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await hash(password, 10);

    // Create user with seller role
    const newUser = await UserDao.createUser({
      name,
      email,
      password: hashedPassword,
      role: "seller",
    });

    // Create seller profile
    const sellerProfile = await SellerProfileDao.createSellerProfile(
      newUser.id!,
      {
        store_name: store_name || name,
        gst_number,
        payout_details,
        verification_status: "pending",
      },
    );

    const token = sign(
      {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email,
        seller_profile_id: sellerProfile.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );
    res.cookie("auth_token", token, jwtCookieOptions);

    const { password: pw, ...finalUser } = newUser;

    try {
      const otp = generateOtp();
      await EmailOtpDao.createOtp(email, otp, "seller", "email_verification");
      await sendOtpEmail(email, otp, name, "verification");
      console.log(`📧 Verification OTP sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    // Create Admin Notifiction after seller registrations
    try {
      await NotificationDao.createNotification({
        type: "SELLER_REGISTRATION",
        message: `New seller registered: ${name} (${email})`,
        metadata: {
          user_id: newUser.id,
          seller_profile_id: sellerProfile.id,
          email: email,
          store_name: store_name || name,
        },
      });
      console.log(`🔔 Admin notification created for new seller: ${email}`);
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError);
    }

    return res.status(201).json({
      success: true,
      message:
        "Seller registration successful! Please check your email to verify your account.",
      user: {
        ...finalUser,
        seller_profile: sellerProfile,
      },
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
      message: "Failed to register seller",
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

    const { store_name, gst_number, payout_details } = req.body;

    const user = await UserDao.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    if (user.role === "seller") {
      return res.status(400).json({
        success: false,
        message: "You are already registered as a seller",
      });
    }

    // 3. Checking if seller profile already exists
    const existingProfile =
      await SellerProfileDao.findSellerProfileByUserId(userId);
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Seller profile already exists for this user",
      });
    }

    // 4. Updateing user role to seller for current user
    await UserDao.updateUserRole(userId, "seller");

    // 5. Createing  seller profile for user
    const sellerProfile = await SellerProfileDao.createSellerProfile(userId, {
      store_name: store_name || user.name,
      gst_number,
      payout_details,
      verification_status: "pending",
    });

    // 6. Createing  Admin Notification
    try {
      await NotificationDao.createNotification({
        type: "SELLER_MIGRATION",
        message: `User ${user.name} (${user.email}) applied to become a Seller`,
        metadata: {
          user_id: user.id,
          seller_profile_id: sellerProfile.id,
          email: user.email,
          store_name: store_name || user.name,
        },
      });
      console.log(
        `🔔 Admin notification created for seller migration: ${user.email}`,
      );
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError);
    }

    const token = sign(
      {
        id: user.id,
        role: "seller",
        email: user.email,
        seller_profile_id: sellerProfile.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );
    res.cookie("auth_token", token, jwtCookieOptions);

    return res.status(200).json({
      success: true,
      message:
        "Application submitted successfully! Wait for admin approval to start selling.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "seller",
      },
      seller_profile: sellerProfile,
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

export const login = async (req: Request, res: Response) => {
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

    // JWT payload for role-specific data
    const jwtPayload: any = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    // Fetch seller profile if user is a seller
    if (user.role === "seller") {
      const sellerProfile = await SellerProfileDao.findSellerProfileByUserId(
        user.id!,
      );
      if (sellerProfile) {
        jwtPayload.seller_profile_id = sellerProfile.id;
        jwtPayload.verification_status = sellerProfile.verification_status;
      }
    }

    // Fetch admin profile if user is an admin
    if (user.role === "admin") {
      const adminProfile = await AdminProfileDao.findAdminProfileByUserId(
        user.id!,
      );
      if (adminProfile) {
        jwtPayload.admin_profile_id = adminProfile.id;
        jwtPayload.permissions = adminProfile.permissions;
      }
    }

    const token = sign(jwtPayload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

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
      message: "Failed to login",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", jwtCookieOptions);
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, department, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, password",
      });
    }

    const existing = await UserDao.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await hash(password, 10);

    // Create user with admin role
    const newUser = await UserDao.createUser({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    // Create admin profile
    const adminProfile = await AdminProfileDao.createAdminProfile(newUser.id!, {
      department,
      permissions: permissions || {},
    });

    const token = sign(
      {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email,
        admin_profile_id: adminProfile.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );
    res.cookie("auth_token", token, jwtCookieOptions);

    const { password: pw, ...finalUser } = newUser;

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      user: {
        ...finalUser,
        admin_profile: adminProfile,
      },
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
      message: "Failed to register admin",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    const user = await UserDao.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      image,
      age,
      number,
      location,
      bio,
      store_name,
      gst_number,
      payout_details,
    } = req.body;

    // user updates
    const userUpdates: any = {};
    if (name !== undefined) userUpdates.name = name;
    if (image !== undefined) userUpdates.image = image;
    if (age !== undefined) userUpdates.age = age;
    if (number !== undefined) userUpdates.number = number;
    if (location !== undefined) userUpdates.location = location;
    if (bio !== undefined) userUpdates.bio = bio;

    // Update user table
    let updatedUser = user;
    if (Object.keys(userUpdates).length > 0) {
      const result = await UserDao.updateUser(userId, userUpdates);
      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Failed to update user profile",
        });
      }
      updatedUser = result;
    }

    // Update seller profile if user is a seller and seller fields are provid
    let updatedSellerProfile = null;
    if (user.role === "seller") {
      const sellerUpdates: any = {};
      if (store_name !== undefined) sellerUpdates.store_name = store_name;
      if (gst_number !== undefined) sellerUpdates.gst_number = gst_number;
      if (payout_details !== undefined)
        sellerUpdates.payout_details = payout_details;

      if (Object.keys(sellerUpdates).length > 0) {
        updatedSellerProfile = await SellerProfileDao.updateSellerProfile(
          userId,
          sellerUpdates,
        );
      }
    }

    const { password: pw, ...finalUser } = updatedUser;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: finalUser,
      ...(updatedSellerProfile && { seller_profile: updatedSellerProfile }),
    });
  } catch (error: any) {
    console.error("Update User Error:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error.message,
    });
  }
};

export const requestEmailUpdate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    const { new_email } = req.body;

    if (!new_email) {
      return res.status(400).json({
        success: false,
        message: "New email is required",
      });
    }

    const user = await UserDao.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (new_email === user.email) {
      return res.status(400).json({
        success: false,
        message: "New email is the same as current email",
      });
    }

    const existingUser = await UserDao.findUserByEmail(new_email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use by another account",
      });
    }

    const otp = generateOtp();
    await EmailOtpDao.createOtp(new_email, otp, user.role, "email_change");
    await sendOtpEmail(new_email, otp, user.name || "User", "verification");

    console.log(`📧 Email change OTP sent to ${new_email}`);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to new email address",
      new_email: new_email,
    });
  } catch (error: any) {
    console.error("Request Email Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code",
      error: error.message,
    });
  }
};

export const verifyEmailUpdate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    const { new_email, otp } = req.body;

    if (!new_email || !otp) {
      return res.status(400).json({
        success: false,
        message: "New email and OTP are required",
      });
    }

    const user = await UserDao.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify OTP
    const otpRecord = await EmailOtpDao.findLatestOtp(
      new_email,
      "email_change",
    );

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No verification request found for this email",
      });
    }

    if (otpRecord.is_used) {
      return res.status(400).json({
        success: false,
        message: "This verification code has already been used",
      });
    }

    // Verify OTP using bcrypt for security
    const { compare } = await import("bcrypt");
    const isValidOtp = await compare(otp, otpRecord.otp_hash);

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    const otpAge = Date.now() - new Date(otpRecord.created_at!).getTime();
    if (otpAge > 10 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    // Check if new email is still available
    const existingUser = await UserDao.findUserByEmail(new_email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use by another account",
      });
    }

    // Update email and set verified to true after checking all conditions
    const updatedUser = await UserDao.updateUser(userId, {
      email: new_email,
      is_verified_email: true,
    });

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update email",
      });
    }
    await EmailOtpDao.markOtpAsUsed(new_email, otp);

    console.log(`✅ Email updated successfully for user ${userId}`);

    const { password: pw, ...finalUser } = updatedUser;

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      user: finalUser,
    });
  } catch (error: any) {
    console.error("Verify Email Update Error:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update email",
      error: error.message,
    });
  }
};


export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await UserDao.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isValidPassword = await compare(current_password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (current_password === new_password) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await hash(new_password, 10);
    const updatedUser = await UserDao.updateUser(userId, {
      password: hashedPassword,
    });

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update password",
      });
    }

    console.log(`🔐 Password changed successfully for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token (decode it)
    const { verify } = await import("jsonwebtoken");
    let decoded: any;

    try {
      decoded = verify(
        refresh_token,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const userId = decoded.id;
    const user = await UserDao.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.refresh_token_hash || !user.refresh_token_expires_at) {
      return res.status(401).json({
        success: false,
        message: "No active refresh token found",
      });
    }

    const isValidRefreshToken = await compare(
      refresh_token,
      user.refresh_token_hash,
    );

    if (!isValidRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (new Date() > new Date(user.refresh_token_expires_at)) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
      });
    }

    // Generate new access token
    const jwtPayload: any = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    if (user.role === "seller") {
      const sellerProfile = await SellerProfileDao.findSellerProfileByUserId(
        user.id!,
      );
      if (sellerProfile) {
        jwtPayload.seller_profile_id = sellerProfile.id;
        jwtPayload.verification_status = sellerProfile.verification_status;
      }
    }

    if (user.role === "admin") {
      const adminProfile = await AdminProfileDao.findAdminProfileByUserId(
        user.id!,
      );
      if (adminProfile) {
        jwtPayload.admin_profile_id = adminProfile.id;
        jwtPayload.permissions = adminProfile.permissions;
      }
    }

    const newAccessToken = sign(jwtPayload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.cookie("auth_token", newAccessToken, jwtCookieOptions);

    console.log(`🔄 Access token refreshed for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      access_token: newAccessToken,
    });
  } catch (error: any) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};
