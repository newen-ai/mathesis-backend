import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { myProfile, upsertMyProfile } from "./profile.controller";
import { updateMyProfileSchema } from "./profile.schemas";

const profileRouter = Router();

profileRouter.get("/me", requireAuth(), asyncHandler(myProfile));
profileRouter.post("/me", requireAuth(), validateRequest(updateMyProfileSchema), asyncHandler(upsertMyProfile));

export { profileRouter };
