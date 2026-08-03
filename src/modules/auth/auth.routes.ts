import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { createWhitelistRequestSchema } from "../whitelist/whitelist.schemas";
import { login, logout, register, requestWhitelistAccess, session } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), asyncHandler(register));
authRouter.post("/login", validateRequest(loginSchema), asyncHandler(login));
authRouter.get("/session", requireAuth({ skipWhitelist: true }), asyncHandler(session));
authRouter.post(
	"/whitelist-request",
	requireAuth({ skipWhitelist: true }),
	validateRequest(createWhitelistRequestSchema),
	asyncHandler(requestWhitelistAccess)
);
authRouter.post("/logout", asyncHandler(logout));

export { authRouter };
