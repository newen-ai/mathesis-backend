import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { validateRequest } from "../../common/middlewares/validate-request";
import { login, logout, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), asyncHandler(register));
authRouter.post("/login", validateRequest(loginSchema), asyncHandler(login));
authRouter.post("/logout", asyncHandler(logout));

export { authRouter };
