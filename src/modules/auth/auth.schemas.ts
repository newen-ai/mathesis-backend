import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must have at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character");

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema
  })
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

export const confirmPasswordResetSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: passwordSchema
  })
});

export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type LoginBody = z.infer<typeof loginSchema>["body"];
export type RequestPasswordResetBody = z.infer<typeof requestPasswordResetSchema>["body"];
export type ConfirmPasswordResetBody = z.infer<typeof confirmPasswordResetSchema>["body"];
