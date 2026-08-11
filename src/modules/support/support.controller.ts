import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { supportService } from "./support.service";

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
