import { z } from "zod";

export const CreateAdminProfileSchema = z.object({
  permissions: z.record(z.string(), z.boolean()).optional(),
  department: z.string().max(100).optional(),
});

export const UpdateAdminProfileSchema = z.object({
  permissions: z.record(z.string(), z.boolean()).optional(),
  department: z.string().max(100).optional(),
});

export type CreateAdminProfileInput = z.infer<typeof CreateAdminProfileSchema>;
export type UpdateAdminProfileInput = z.infer<typeof UpdateAdminProfileSchema>;
