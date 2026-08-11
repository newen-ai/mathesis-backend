import { z } from "zod";

export const createContactMessageSchema = z.object({
	body: z.object({
		category: z.enum([
			"GENERAL_INQUIRY",
			"TECHNICAL_ISSUE",
			"SUGGESTION",
			"BUG_REPORT",
			"OTHER"
		]),
		details: z.string().min(1, "Details are required").max(500, "Details cannot exceed 500 characters")
	})
});

export type CreateContactMessageRequest = z.infer<typeof createContactMessageSchema>;
