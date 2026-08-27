import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { blockUser, listMyBlockedUsers, unblockUser } from "./block.controller";
import { blockByUserIdSchema, unblockByUserIdSchema } from "./block.schemas";

const blockRouter = Router();

blockRouter.get("/me", requireAuth(), asyncHandler(listMyBlockedUsers));
blockRouter.post("/:targetUserId", requireAuth(), validateRequest(blockByUserIdSchema), asyncHandler(blockUser));
blockRouter.delete("/:targetUserId", requireAuth(), validateRequest(unblockByUserIdSchema), asyncHandler(unblockUser));

export { blockRouter };
