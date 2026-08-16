import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

const enterpriseIdentitySchema = z.object({
  enterpriseId: z.string().min(1, "enterpriseId is required")
});

const enterpriseFieldsSchema = z.object({
  companyName: z.string().min(1).max(160),
  role: z.string().min(1).max(120),
  website: optionalTrimmedString.refine(
    (value) => value === undefined || value.length <= 255,
    "website cannot exceed 255 characters"
  ),
  description: optionalTrimmedString.refine(
    (value) => value === undefined || value.length <= 500,
    "description cannot exceed 500 characters"
  )
});

export const listMyEnterprisesSchema = z.object({});

export const createEnterpriseSchema = z.object({
  body: enterpriseFieldsSchema
});

export const updateEnterpriseSchema = z.object({
  params: enterpriseIdentitySchema,
  body: enterpriseFieldsSchema
});

export const deleteEnterpriseSchema = z.object({
  params: enterpriseIdentitySchema
});

export type CreateEnterpriseBody = z.infer<typeof createEnterpriseSchema>["body"];
export type UpdateEnterpriseBody = z.infer<typeof updateEnterpriseSchema>["body"];
export type UpdateEnterpriseParams = z.infer<typeof updateEnterpriseSchema>["params"];
export type DeleteEnterpriseParams = z.infer<typeof deleteEnterpriseSchema>["params"];
