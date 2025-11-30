import { z } from "zod";

export const userSchema = z.object({
  id: z.number().optional(),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),

  image: z.url().optional(),

  age: z
    .number()
    .min(10, "You must be at least 10 years old")
    .max(120, "Age cannot exceed 120")
    .optional(),

  number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .optional(),

  // GeoJSON-style location
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z
        .array(
          z
            .number()
            .refine(
              (val) => val >= -180 && val <= 180,
              "Coordinates must be valid latitude/longitude"
            )
        )
        .length(2, "Coordinates must be [longitude, latitude]"),
    })
    .optional(),

  email: z.email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must include at least one special character"
    ),

  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),

  is_seller_verified: z.boolean().optional(),
  is_admin_verified: z.boolean().optional(),

  role: z.enum(["user", "seller", "admin"]).default("user").optional(),

  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type UserInput = z.infer<typeof userSchema>;
