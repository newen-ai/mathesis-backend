import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
	myProfile,
	profileByUserId,
	searchUsers,
	updateMyEducationHistory,
	updateMyWorkExperiences,
	upsertMyProfile
} from "./profile.controller";
import {
	getProfileByUserIdSchema,
	searchUsersSchema,
	updateMyEducationHistorySchema,
	updateMyProfileSchema,
	updateMyWorkExperiencesSchema
} from "./profile.schemas";

const profileRouter = Router();

profileRouter.get("/search", requireAuth(), validateRequest(searchUsersSchema), asyncHandler(searchUsers));
profileRouter.get("/me", requireAuth(), asyncHandler(myProfile));
profileRouter.get("/:userId", requireAuth(), validateRequest(getProfileByUserIdSchema), asyncHandler(profileByUserId));
profileRouter.post("/me", requireAuth(), validateRequest(updateMyProfileSchema), asyncHandler(upsertMyProfile));
profileRouter.patch(
	"/work-experiences",
	requireAuth(),
	validateRequest(updateMyWorkExperiencesSchema),
	asyncHandler(updateMyWorkExperiences)
);
profileRouter.patch(
	"/education-history",
	requireAuth(),
	validateRequest(updateMyEducationHistorySchema),
	asyncHandler(updateMyEducationHistory)
);

export { profileRouter };
