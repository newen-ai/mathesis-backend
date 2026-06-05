import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { healthRouter } from "../modules/health/health.routes";
import { profileRouter } from "../modules/profile/profile.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/profile", profileRouter);

export { apiRouter };
