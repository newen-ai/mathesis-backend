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

export const updateMyProfileSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(1).max(80),
      lastName: z.string().min(1).max(80),
      dateOfBirth: z.coerce.date().optional(),
      nationality: z.string().min(2).max(80).optional(),
      currentJobTitle: z.string().min(1).max(120).optional(),
      currentCompany: z.string().min(1).max(120).optional(),
      employmentHistory: z.array(employmentHistoryItemSchema).optional()
    })
    .partial()
});

export type UpdateMyProfileBody = z.infer<typeof updateMyProfileSchema>["body"];
