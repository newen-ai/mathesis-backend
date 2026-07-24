import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must have at least 8 characters")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

export const confirmEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Confirmation token is required")
  })
});

export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type LoginBody = z.infer<typeof loginSchema>["body"];
export type ConfirmEmailBody = z.infer<typeof confirmEmailSchema>["body"];
