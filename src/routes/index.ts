import { Router } from "express";
import { ateneoRouter } from "../modules/ateneo/ateneo.routes";
import { blockRouter } from "../modules/block/block.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { chatRouter } from "../modules/chat/chat.routes";
import { companiesRouter } from "../modules/companies/companies.routes";
import { connectionRouter } from "../modules/connection/connection.routes";
import { enterpriseRouter } from "../modules/enterprise/enterprise.routes";
import { feedRouter } from "../modules/feed/feed.routes";
import { healthRouter } from "../modules/health/health.routes";
import { notificationRouter } from "../modules/notification/notification.routes";
import { profileRouter } from "../modules/profile/profile.routes";
import { supportRouter } from "../modules/support/support.routes";
import { whitelistAdminRouter } from "../modules/whitelist/whitelist.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/blocks", blockRouter);
apiRouter.use("/ateneo", ateneoRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/enterprises", enterpriseRouter);
apiRouter.use("/connections", connectionRouter);
apiRouter.use("/feed", feedRouter);
apiRouter.use("/chats", chatRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/support", supportRouter);
apiRouter.use("/admin/whitelist", whitelistAdminRouter);
apiRouter.use("/admin/companies", companiesRouter);

export { apiRouter };
