import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { postContactMessage } from "./support.controller";
import { createContactMessageSchema } from "./support.schemas";

const supportRouter = Router();

supportRouter.post(
	"/contact",
	requireAuth(),
	validateRequest(createContactMessageSchema),
	asyncHandler(postContactMessage)
);

export { supportRouter };
