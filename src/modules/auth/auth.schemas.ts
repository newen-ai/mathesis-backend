import { z } from "zod";

const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

const employmentHistoryItemSchema = z
  .object({
    company: z.string().min(1).max(120),
    jobTitle: z.string().min(1).max(120),
    startYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format"),
    endYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional()
  })
  .refine(
    (item) => !item.endYearMonth || item.endYearMonth >= item.startYearMonth,
    {
      message: "endYearMonth must be greater than or equal to startYearMonth",
      path: ["endYearMonth"]
    }
  );

const profileSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  dateOfBirth: z.coerce.date().optional(),
  nationality: z.string().min(2).max(80).optional(),
  currentJobTitle: z.string().min(1).max(120).optional(),
  currentCompany: z.string().min(1).max(120).optional(),
  employmentHistory: z.array(employmentHistoryItemSchema).default([])
});

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

export const updateMyProfileSchema = z.object({
  body: profileSchema.partial().extend({
    employmentHistory: z.array(employmentHistoryItemSchema).optional()
  })
});

export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type LoginBody = z.infer<typeof loginSchema>["body"];
export type UpdateMyProfileBody = z.infer<typeof updateMyProfileSchema>["body"];
