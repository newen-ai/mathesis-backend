import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { myProfile, updateMyWorkExperiences, upsertMyProfile } from "./profile.controller";
import { updateMyProfileSchema, updateMyWorkExperiencesSchema } from "./profile.schemas";

const profileRouter = Router();

profileRouter.get("/me", requireAuth(), asyncHandler(myProfile));
profileRouter.post("/me", requireAuth(), validateRequest(updateMyProfileSchema), asyncHandler(upsertMyProfile));
profileRouter.patch(
	"/work-experiences",
	requireAuth(),
	validateRequest(updateMyWorkExperiencesSchema),
	asyncHandler(updateMyWorkExperiences)
);

export { profileRouter };
