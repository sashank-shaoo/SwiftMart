import { z } from "zod";

export const SellerSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at least 50 characters")
    .optional(),
  image: z.url().optional(),
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(/[@$!%*?&]/, "Password must include at least one special character"),
  number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .optional(),
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
  role: z.enum(["user", "seller", "admin"]).default("seller").optional(),
  is_seller_verified: z.boolean().optional(),
  is_admin_verified: z.boolean().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type SellerInput = z.infer<typeof SellerSchema>;
