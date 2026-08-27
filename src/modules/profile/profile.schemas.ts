import { z } from "zod";

const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
const iso8601DateRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;
const interestSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .transform((value) => value.replace(/\s+/g, " ").toLocaleLowerCase());
const imageUrlOrDataUrlSchema = z
  .string()
  .max(10_000_000)
  .refine(
    (value) =>
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value),
    {
      message: "Use a valid image URL (http/https) or a base64 data:image URL"
    }
  );

const employmentHistoryItemSchema = z
  .object({
    company: z.string().min(1).max(120),
    jobTitle: z.string().min(1).max(120),
    description: z.string().max(300).optional(),
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

const educationHistoryItemSchema = z
  .object({
    institution: z.string().min(1).max(160),
    degree: z.string().min(1).max(160),
    fieldOfStudy: z.string().min(1).max(160).optional(),
    startYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format"),
    endYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional(),
    description: z.string().max(300).optional()
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
    description: z.string().max(300).optional(),
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
    description: z.string().max(300).optional(),
    startYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional(),
    endYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional()
  })
  .refine(
    (item) =>
      item.company !== undefined ||
      item.jobTitle !== undefined ||
      item.description !== undefined ||
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

const addEducationOperationSchema = z
  .object({
    action: z.literal("ADD"),
    institution: z.string().min(1).max(160),
    degree: z.string().min(1).max(160),
    fieldOfStudy: z.string().min(1).max(160).optional(),
    startYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format"),
    endYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional(),
    description: z.string().max(300).optional()
  })
  .refine(
    (item) => !item.endYearMonth || item.endYearMonth >= item.startYearMonth,
    {
      message: "endYearMonth must be greater than or equal to startYearMonth",
      path: ["endYearMonth"]
    }
  );

const editEducationOperationSchema = z
  .object({
    action: z.literal("EDIT"),
    id: z.string().min(1),
    institution: z.string().min(1).max(160).optional(),
    degree: z.string().min(1).max(160).optional(),
    fieldOfStudy: z.string().min(1).max(160).optional(),
    startYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional(),
    endYearMonth: z.string().regex(yearMonthRegex, "Use YYYY-MM format").optional(),
    description: z.string().max(300).optional()
  })
  .refine(
    (item) =>
      item.institution !== undefined ||
      item.degree !== undefined ||
      item.fieldOfStudy !== undefined ||
      item.startYearMonth !== undefined ||
      item.endYearMonth !== undefined ||
      item.description !== undefined,
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

const removeEducationOperationSchema = z.object({
  action: z.literal("REMOVE"),
  id: z.string().min(1)
});

const educationOperationSchema = z.discriminatedUnion("action", [
  addEducationOperationSchema,
  editEducationOperationSchema,
  removeEducationOperationSchema
]);

export const updateMyProfileSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(1).max(80),
      middleName: z.string().min(1).max(80).optional(),
      lastName: z.string().min(1).max(80),
      dateOfBirth: z
        .string()
        .regex(iso8601DateRegex, "Use ISO-8601 format")
        .transform((value) => new Date(value))
        .optional(),
      nationality: z.string().min(2).max(80).optional(),
      currentJobTitle: z.string().min(1).max(120).optional(),
      currentCompany: z.string().min(1).max(120).optional(),
      about: z.string().max(800).optional(),
      locationCountry: z.string().min(1).max(80).optional(),
      locationCity: z.string().min(1).max(80).optional(),
      locationPostalCode: z.string().min(1).max(30).optional(),
      interests: z.array(interestSchema).max(50).optional(),
      profileImageUrl: imageUrlOrDataUrlSchema.optional(),
      profileBannerImageUrl: imageUrlOrDataUrlSchema.optional(),
      employmentHistory: z.array(employmentHistoryItemSchema).optional(),
      educationHistory: z.array(educationHistoryItemSchema).optional()
    })
    .partial()
});

export const updateMyWorkExperiencesSchema = z.object({
  body: z.object({
    operations: z.array(workExperienceOperationSchema).min(1)
  })
});

export const updateMyEducationHistorySchema = z.object({
  body: z.object({
    operations: z.array(educationOperationSchema).min(1)
  })
});

export const getMyPreferencesSchema = z.object({});

export const updateMyPreferencesSchema = z.object({
  body: z.object({
    themePreference: z.enum(["light", "dark"]).optional()
  })
});

export const searchUsersSchema = z.object({
  query: z.object({
    text: z
      .string()
      .min(1)
      .max(160)
      .refine((value) => value.trim().length > 0, {
        message: "text cannot be empty"
      })
  })
});

export const getProfileByUserIdSchema = z.object({
  params: z.object({
    userId: z.string().min(1)
  })
});

export const searchInterestSuggestionsSchema = z.object({
  query: z.object({
    text: z
      .string()
      .min(3)
      .max(80)
      .refine((value) => value.trim().length >= 3, {
        message: "text must have at least 3 non-space characters"
      })
  })
});

export type UpdateMyProfileBody = z.infer<typeof updateMyProfileSchema>["body"];
export type UpdateMyWorkExperiencesBody = z.infer<typeof updateMyWorkExperiencesSchema>["body"];
export type UpdateMyEducationHistoryBody = z.infer<typeof updateMyEducationHistorySchema>["body"];
export type UpdateMyPreferencesBody = z.infer<typeof updateMyPreferencesSchema>["body"];
export type SearchUsersQuery = z.infer<typeof searchUsersSchema>["query"];
export type GetProfileByUserIdParams = z.infer<typeof getProfileByUserIdSchema>["params"];
export type SearchInterestSuggestionsQuery = z.infer<typeof searchInterestSuggestionsSchema>["query"];
