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

export const createBugReportSchema = z.object({
	body: z.object({
		title: z.string().trim().min(1, "Title is required").max(120, "Title cannot exceed 120 characters"),
		description: z
			.string()
			.trim()
			.min(1, "Description is required")
			.max(2000, "Description cannot exceed 2000 characters"),
		pageUrl: z
			.string()
			.trim()
			.url("Page URL must be a valid URL")
			.max(2048, "Page URL cannot exceed 2048 characters")
	})
});

export type CreateContactMessageRequest = z.infer<typeof createContactMessageSchema>;
export type CreateBugReportBody = z.infer<typeof createBugReportSchema>["body"];
