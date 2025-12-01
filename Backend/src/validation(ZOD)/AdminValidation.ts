import {z} from "zod";

export const adminSchema = z.object({
  id: z.uuid().optional(),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .optional(),

  email: z.email({ message: "Invalid email format" }),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must include one uppercase letter")
    .regex(/[a-z]/, "Password must include one lowercase letter")
    .regex(/[0-9]/, "Password must include one number")
    .regex(/[@$!%*?&]/, "Password must include one special character"),

  number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .optional(),

  role: z.enum(["admin"]).default("admin").optional(),

  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type AdminInput = z.infer<typeof adminSchema>;
