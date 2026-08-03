import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { chatRouter } from "../modules/chat/chat.routes";
import { connectionRouter } from "../modules/connection/connection.routes";
import { feedRouter } from "../modules/feed/feed.routes";
import { healthRouter } from "../modules/health/health.routes";
import { profileRouter } from "../modules/profile/profile.routes";
import { whitelistAdminRouter } from "../modules/whitelist/whitelist.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/connections", connectionRouter);
apiRouter.use("/feed", feedRouter);
apiRouter.use("/chats", chatRouter);
apiRouter.use("/admin/whitelist", whitelistAdminRouter);

export { apiRouter };
