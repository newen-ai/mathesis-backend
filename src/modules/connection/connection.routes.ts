import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { connectToUser, disconnectFromUser, myConnections } from "./connection.controller";
import { connectionByUserIdSchema } from "./connection.schemas";

const connectionRouter = Router();

connectionRouter.get("/me", requireAuth(), asyncHandler(myConnections));
connectionRouter.post("/:userId", requireAuth(), validateRequest(connectionByUserIdSchema), asyncHandler(connectToUser));
connectionRouter.delete(
  "/:userId",
  requireAuth(),
  validateRequest(connectionByUserIdSchema),
  asyncHandler(disconnectFromUser)
);

export { connectionRouter };
