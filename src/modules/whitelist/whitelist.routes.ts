import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
  approveWhitelistRequest,
  listUsersByWhitelistState,
  listWhitelistRequests,
  listWhitelistedEmails,
  promoteUserToWhitelist
} from "./whitelist.controller";
import {
  approveWhitelistRequestSchema,
  listUsersByWhitelistStateSchema,
  listWhitelistRequestsSchema,
  listWhitelistedEmailsSchema,
  promoteUserToWhitelistSchema
} from "./whitelist.schemas";

const whitelistAdminRouter = Router();

whitelistAdminRouter.get(
  "/emails",
  requireAuth("admin"),
  validateRequest(listWhitelistedEmailsSchema),
  asyncHandler(listWhitelistedEmails)
);
whitelistAdminRouter.get(
  "/users",
  requireAuth("admin"),
  validateRequest(listUsersByWhitelistStateSchema),
  asyncHandler(listUsersByWhitelistState)
);
whitelistAdminRouter.post(
  "/users/:userId/promote",
  requireAuth("admin"),
  validateRequest(promoteUserToWhitelistSchema),
  asyncHandler(promoteUserToWhitelist)
);
whitelistAdminRouter.post(
  "/requests/:requestId/approve",
  requireAuth("admin"),
  validateRequest(approveWhitelistRequestSchema),
  asyncHandler(approveWhitelistRequest)
);
whitelistAdminRouter.get(
  "/requests",
  requireAuth("admin"),
  validateRequest(listWhitelistRequestsSchema),
  asyncHandler(listWhitelistRequests)
);

export { whitelistAdminRouter };
