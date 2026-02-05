import { z } from "zod";

export const CreateSellerProfileSchema = z.object({
  store_name: z.string().min(2).max(255).optional(),
  gst_number: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  payout_details: z
    .object({
      account_holder_name: z.string().optional(),
      bank_name: z
        .string()
        .optional()
        .or(z.literal("").transform(() => undefined)),
      account_number: z
        .string()
        .optional()
        .or(z.literal("").transform(() => undefined)),
      ifsc_code: z
        .string()
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/)
        .optional()
        .or(z.literal("").transform(() => undefined)),
      upi_id: z
        .string()
        .email()
        .or(z.string().regex(/@/))
        .optional()
        .or(z.literal("").transform(() => undefined)),
    })
    .optional(),
  commission_rate: z.number().min(0).max(100).optional(),
});

export const UpdateSellerProfileSchema = z.object({
  store_name: z.string().min(2).max(255).optional(),
  gst_number: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional(),
  verification_status: z.enum(["pending", "verified", "rejected"]).optional(),
  payout_details: z
    .object({
      account_holder_name: z.string().optional(),
      bank_name: z.string().optional(),
      account_number: z.string().optional(),
      ifsc_code: z
        .string()
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/)
        .optional(),
      upi_id: z.string().email().or(z.string().regex(/@/)).optional(),
    })
    .optional(),
  commission_rate: z.number().min(0).max(100).optional(),
});

export type CreateSellerProfileInput = z.infer<
  typeof CreateSellerProfileSchema
>;
export type UpdateSellerProfileInput = z.infer<
  typeof UpdateSellerProfileSchema
>;

// Register Seller Schema - combines user registration + seller profile
export const RegisterSellerSchema = z.object({
  // User registration fields
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must include one uppercase letter")
    .regex(/[a-z]/, "Password must include one lowercase letter")
    .regex(/[0-9]/, "Password must include one number")
    .regex(/[@$!%*?&]/, "Password must include one special character"),

  // Seller profile fields
  store_name: z.string().min(2).max(255).optional(),
  gst_number: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  payout_details: z
    .object({
      account_holder_name: z.string().optional(),
      bank_name: z
        .string()
        .optional()
        .or(z.literal("").transform(() => undefined)),
      account_number: z
        .string()
        .optional()
        .or(z.literal("").transform(() => undefined)),
      ifsc_code: z
        .string()
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/)
        .optional()
        .or(z.literal("").transform(() => undefined)),
      upi_id: z
        .string()
        .email()
        .or(z.string().regex(/@/))
        .optional()
        .or(z.literal("").transform(() => undefined)),
    })
    .optional(),
  commission_rate: z.number().min(0).max(100).optional(),
});

export type RegisterSellerInput = z.infer<typeof RegisterSellerSchema>;
