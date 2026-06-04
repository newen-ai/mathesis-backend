import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { login, logout, me, myProfile, register, upsertMyProfile } from "./auth.controller";
import { loginSchema, registerSchema, updateMyProfileSchema } from "./auth.schemas";

const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), asyncHandler(register));
authRouter.post("/login", validateRequest(loginSchema), asyncHandler(login));
authRouter.post("/logout", asyncHandler(logout));
authRouter.get("/me", requireAuth(), asyncHandler(me));
authRouter.get("/profile", requireAuth(), asyncHandler(myProfile));
authRouter.post(
	"/profile",
	requireAuth(),
	validateRequest(updateMyProfileSchema),
	asyncHandler(upsertMyProfile)
);

export { authRouter };
