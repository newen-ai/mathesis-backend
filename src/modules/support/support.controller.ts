import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type { CreateBugReportBody } from "./support.schemas";
import { supportService } from "./support.service";

type UploadedBugReportFile = {
	originalname: string;
	mimetype: string;
	size: number;
	buffer: Buffer;
};

function getUploadedBugReportFiles(
	files: UploadedBugReportFile[] | undefined
): UploadedBugReportFile[] {
	return files ?? [];
}

export const postContactMessage: RequestHandler = async (req, res) => {
	const userId = req.user?.sub;

	if (!userId) {
		res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
		return;
	}

	const { category, details } = req.body;

	const message = await supportService.createContactMessage(userId as string, category, details);

	res.status(StatusCodes.CREATED).json({
		success: true,
		message: "CONTACT_MESSAGE_CREATED",
		data: {
			id: message.id,
			userId: message.userId,
			category: message.category,
			details: message.details,
			createdAt: message.createdAt
		}
	});
};

export const postBugReport: RequestHandler = async (req, res) => {
	const userId = req.user?.sub;

	if (!userId) {
		res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
		return;
	}

	const body = req.body as CreateBugReportBody;
	const files = getUploadedBugReportFiles(req.files as UploadedBugReportFile[] | undefined);
	const message = await supportService.createBugReport(userId as string, body, files);

	res.status(StatusCodes.CREATED).json({
		success: true,
		message: "BUG_REPORT_CREATED",
		data: {
			id: message.id,
			userId: message.userId,
			title: message.title,
			description: message.details,
			pageUrl: message.pageUrl,
			attachments: message.attachments,
			createdAt: message.createdAt
		}
	});
};
