import { Request, Response } from "express";
import { UserDao } from "../daos/UserDao";
import { SellerDao } from "../daos/SellerDao";
import { AdminDao } from "../daos/AdminDao";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { jwtCookieOptions } from "../utils/cookieParser";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await UserDao.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
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

    return res.status(201).json({ user: finalUser });
  } catch (error: any) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    return res.status(500).json({ error: "Failed to register user" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await UserDao.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // JWT token
    const token = sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, jwtCookieOptions);
    const { password: pw, ...finalUser } = user;

    return res.json({ user: finalUser });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to login user" });
  }
};

export const logOutUser = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", jwtCookieOptions);
  return res.json({ message: "User logged out successfully" });
};

export const registerSeller = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await SellerDao.findSellerByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Seller already exists" });
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
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("auth_token", token, jwtCookieOptions);
    const { password: pw, ...finalSeller } = newSeller;
    
    res.status(201).json({ seller: finalSeller });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Seller already exists" });
    }
    return res.status(500).json({ error: "Failed to register seller" });
  }
};

export const loginSeller = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const seller = await SellerDao.findSellerByEmail(email);
    if (!seller) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
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

    return res.json({ seller: finalSeller });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Seller login failed" });
  }
};

export const logOutSeller = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", jwtCookieOptions);
  return res.json({ message: "Seller logged out successfully" });
};

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await AdminDao.findAdminByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Admin already exists" });
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

    return res.status(201).json({ admin: finalAdmin });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Admin already exists" });
    }
    res.status(500).json({ error: "Failed to register admin" });
  }
};
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }
    const admin = await AdminDao.findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isValid = await compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
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
    
    return res.json({ admin: finalAdmin });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to login admin" });
  }
};

export const logOutAdmin = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", jwtCookieOptions);
  return res.json({ message: "Admin logged out successfully" });
};
