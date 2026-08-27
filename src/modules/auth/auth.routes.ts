import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { createWhitelistRequestSchema } from "../whitelist/whitelist.schemas";
import {
	changePassword,
	confirmEmail,
	completeWelcomeOnboarding,
	confirmPasswordReset,
	login,
	logout,
	register,
	requestPasswordReset,
	requestWhitelistAccess,
	session
} from "./auth.controller";
import {
	changePasswordSchema,
	confirmPasswordResetSchema,
	loginSchema,
	registerSchema,
	requestPasswordResetSchema
} from "./auth.schemas";

const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), asyncHandler(register));
authRouter.get("/confirm", asyncHandler(confirmEmail));
authRouter.post("/request-reset", validateRequest(requestPasswordResetSchema), asyncHandler(requestPasswordReset));
authRouter.post("/confirm-reset", validateRequest(confirmPasswordResetSchema), asyncHandler(confirmPasswordReset));
authRouter.post("/change-password", requireAuth({ skipWhitelist: true }), validateRequest(changePasswordSchema), asyncHandler(changePassword));
authRouter.post("/login", validateRequest(loginSchema), asyncHandler(login));
authRouter.get("/session", requireAuth({ skipWhitelist: true }), asyncHandler(session));
authRouter.post("/onboarding/complete", requireAuth({ skipWhitelist: true }), asyncHandler(completeWelcomeOnboarding));
authRouter.post(
	"/whitelist-request",
	requireAuth({ skipWhitelist: true }),
	validateRequest(createWhitelistRequestSchema),
	asyncHandler(requestWhitelistAccess)
);
authRouter.post("/logout", asyncHandler(logout));

export { authRouter };
