import { z } from "zod";

const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
const iso8601DateRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;

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

const addWorkExperienceOperationSchema = z
  .object({
    action: z.literal("ADD"),
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

const editWorkExperienceOperationSchema = z
  .object({
    action: z.literal("EDIT"),
    id: z.string().min(1),
    company: z.string().min(1).max(120).optional(),
    jobTitle: z.string().min(1).max(120).optional(),
    startYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional(),
    endYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional()
  })
  .refine(
    (item) =>
      item.company !== undefined ||
      item.jobTitle !== undefined ||
      item.startYearMonth !== undefined ||
      item.endYearMonth !== undefined,
    {
      message: "At least one field is required for EDIT",
      path: ["action"]
    }
  )
  .refine(
    (item) =>
      !item.startYearMonth || !item.endYearMonth || item.endYearMonth >= item.startYearMonth,
    {
      message: "endYearMonth must be greater than or equal to startYearMonth",
      path: ["endYearMonth"]
    }
  );

const removeWorkExperienceOperationSchema = z.object({
  action: z.literal("REMOVE"),
  id: z.string().min(1)
});

const workExperienceOperationSchema = z.discriminatedUnion("action", [
  addWorkExperienceOperationSchema,
  editWorkExperienceOperationSchema,
  removeWorkExperienceOperationSchema
]);

export const updateMyProfileSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(1).max(80),
      lastName: z.string().min(1).max(80),
      dateOfBirth: z
        .string()
        .regex(iso8601DateRegex, "Use ISO-8601 format")
        .transform((value) => new Date(value))
        .optional(),
      nationality: z.string().min(2).max(80).optional(),
      currentJobTitle: z.string().min(1).max(120).optional(),
      currentCompany: z.string().min(1).max(120).optional(),
      employmentHistory: z.array(employmentHistoryItemSchema).optional()
    })
    .partial()
});

export const updateMyWorkExperiencesSchema = z.object({
  body: z.object({
    operations: z.array(workExperienceOperationSchema).min(1)
  })
});

export type UpdateMyProfileBody = z.infer<typeof updateMyProfileSchema>["body"];
export type UpdateMyWorkExperiencesBody = z.infer<typeof updateMyWorkExperiencesSchema>["body"];
