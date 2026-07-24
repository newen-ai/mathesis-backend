import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { validateRequest } from "../../common/middlewares/validate-request";
import { confirmEmail, login, logout, register } from "./auth.controller";
import { confirmEmailSchema, loginSchema, registerSchema } from "./auth.schemas";

const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), asyncHandler(register));
authRouter.post("/confirm", validateRequest(confirmEmailSchema), asyncHandler(confirmEmail));
authRouter.post("/login", validateRequest(loginSchema), asyncHandler(login));
authRouter.post("/logout", asyncHandler(logout));

export { authRouter };
