import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { chatRouter } from "../modules/chat/chat.routes";
import { connectionRouter } from "../modules/connection/connection.routes";
import { enterpriseRouter } from "../modules/enterprise/enterprise.routes";
import { feedRouter } from "../modules/feed/feed.routes";
import { healthRouter } from "../modules/health/health.routes";
import { profileRouter } from "../modules/profile/profile.routes";
import { supportRouter } from "../modules/support/support.routes";
import { whitelistAdminRouter } from "../modules/whitelist/whitelist.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/enterprises", enterpriseRouter);
apiRouter.use("/connections", connectionRouter);
apiRouter.use("/feed", feedRouter);
apiRouter.use("/chats", chatRouter);
apiRouter.use("/support", supportRouter);
apiRouter.use("/admin/whitelist", whitelistAdminRouter);

export { apiRouter };
