import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
	getMyPreferences,
	myProfile,
	profileByUserId,
	searchInterestSuggestions,
	searchUsers,
	updateMyEducationHistory,
	updateMyPreferences,
	updateMyWorkExperiences,
	upsertMyProfile
} from "./profile.controller";
import {
	getMyPreferencesSchema,
	getProfileByUserIdSchema,
	searchInterestSuggestionsSchema,
	searchUsersSchema,
	updateMyEducationHistorySchema,
	updateMyPreferencesSchema,
	updateMyProfileSchema,
	updateMyWorkExperiencesSchema
} from "./profile.schemas";

const profileRouter = Router();

profileRouter.get("/search", requireAuth(), validateRequest(searchUsersSchema), asyncHandler(searchUsers));
profileRouter.get(
	"/interests/suggestions",
	requireAuth(),
	validateRequest(searchInterestSuggestionsSchema),
	asyncHandler(searchInterestSuggestions)
);
profileRouter.get("/me", requireAuth(), asyncHandler(myProfile));
profileRouter.get("/me/preferences", requireAuth(), validateRequest(getMyPreferencesSchema), asyncHandler(getMyPreferences));
profileRouter.get("/:userId", requireAuth(), validateRequest(getProfileByUserIdSchema), asyncHandler(profileByUserId));
profileRouter.post("/me", requireAuth(), validateRequest(updateMyProfileSchema), asyncHandler(upsertMyProfile));
profileRouter.patch(
	"/me/preferences",
	requireAuth(),
	validateRequest(updateMyPreferencesSchema),
	asyncHandler(updateMyPreferences)
);
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
