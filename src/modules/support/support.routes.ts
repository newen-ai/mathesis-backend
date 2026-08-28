import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { postBugReport, postContactMessage } from "./support.controller";
import { createBugReportSchema, createContactMessageSchema } from "./support.schemas";

const supportRouter = Router();
const bugReportUpload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 3
	}
});

supportRouter.post(
	"/contact",
	requireAuth(),
	validateRequest(createContactMessageSchema),
	asyncHandler(postContactMessage)
);

supportRouter.post(
	"/bug-reports",
	requireAuth(),
	bugReportUpload.array("screenshots", 3),
	validateRequest(createBugReportSchema),
	asyncHandler(postBugReport)
);

export { supportRouter };
