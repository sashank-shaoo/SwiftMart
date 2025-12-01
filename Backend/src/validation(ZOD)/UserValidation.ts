import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid().optional(),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),

  image: z.url({ message: "Image must be a valid URL" }).optional(),

  age: z.number().min(10).max(120).optional(),

  number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .optional(),

  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z
        .array(
          z.number().refine((val) => val >= -180 && val <= 180, {
            message: "Coordinates must be valid longitude/latitude values",
          })
        )
        .length(2, "Coordinates must be [longitude, latitude]"),
    })
    .optional(),

  email: z.email({ message: "Invalid email format" }),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must include one uppercase letter")
    .regex(/[a-z]/, "Password must include one lowercase letter")
    .regex(/[0-9]/, "Password must include one number")
    .regex(/[@$!%*?&]/, "Password must include one special character"),

  bio: z.string().max(500,"Bio is too long").optional(),

  is_seller_verified: z.boolean().optional(),
  is_admin_verified: z.boolean().optional(),

  role: z.enum(["user", "seller", "admin"]).default("user").optional(),

  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});


export type UserInput = z.infer<typeof userSchema>;
