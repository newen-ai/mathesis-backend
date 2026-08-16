import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { AppError } from "../../common/errors/app-error";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../common/prisma";
import type { RequestHandler } from "express";
import {
  approveBadgeRequest,
  cancelMyBadgeRequest,
  createMyBadgeRequest,
  getMembershipState,
  listBadgeRequests,
  listAdmins,
  listMembers,
  rejectBadgeRequest,
  removeAdmin,
  removeMember,
  searchEligibleAdmins,
  setAdmin
} from "./companies.controller";
import {
  approveBadgeRequestSchema,
  cancelMyBadgeRequestSchema,
  createMyBadgeRequestSchema,
  getMembershipStateSchema,
  listAdminsSchema,
  listBadgeRequestsSchema,
  listMembersSchema,
  rejectBadgeRequestSchema,
  removeAdminSchema,
  removeMemberSchema,
  searchEligibleAdminsSchema,
  setAdminSchema
} from "./companies.schemas";

// Middleware: companies dashboard access is ME-admin only
const requireCompaniesAccess: RequestHandler = asyncHandler(async (req, _res, next) => {
  const userId = req.user?.sub;

  if (!userId) {
    next(new AppError("Missing authentication token", StatusCodes.UNAUTHORIZED));
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mensaEmpresariosAdminAt: true, deletedAt: true }
  });

  if (!user || user.deletedAt || user.mensaEmpresariosAdminAt === null) {
    next(new AppError("Insufficient permissions", StatusCodes.FORBIDDEN));
    return;
  }

  next();
});

const companiesRouter = Router();

// ── Self membership actions (authenticated users) ───────────────────────────
companiesRouter.get(
  "/membership-state",
  requireAuth(),
  validateRequest(getMembershipStateSchema),
  asyncHandler(getMembershipState)
);

companiesRouter.post(
  "/my-request",
  requireAuth(),
  validateRequest(createMyBadgeRequestSchema),
  asyncHandler(createMyBadgeRequest)
);

companiesRouter.delete(
  "/my-request",
  requireAuth(),
  validateRequest(cancelMyBadgeRequestSchema),
  asyncHandler(cancelMyBadgeRequest)
);

// ── Badge requests (ME admin only) ────────────────────────────────────────────
// Lightweight access probe — returns 200 for authorized users, 403 otherwise
companiesRouter.get(
  "/access-check",
  requireAuth(),
  requireCompaniesAccess,
  (_req, res) => {
    res.status(StatusCodes.OK).json({ success: true, message: "ACCESS_GRANTED" });
  }
);

// ── Badge requests (ME admin only) ────────────────────────────────────────────
companiesRouter.get(
  "/badge-requests",
  requireAuth(),
  requireCompaniesAccess,
  validateRequest(listBadgeRequestsSchema),
  asyncHandler(listBadgeRequests)
);

companiesRouter.post(
  "/badge-requests/:requestId/approve",
  requireAuth(),
  requireCompaniesAccess,
  validateRequest(approveBadgeRequestSchema),
  asyncHandler(approveBadgeRequest)
);

companiesRouter.post(
  "/badge-requests/:requestId/reject",
  requireAuth(),
  requireCompaniesAccess,
  validateRequest(rejectBadgeRequestSchema),
  asyncHandler(rejectBadgeRequest)
);

// ── Members (ME admin only) ───────────────────────────────────────────────────
companiesRouter.get(
  "/members",
  requireAuth(),
  requireCompaniesAccess,
  validateRequest(listMembersSchema),
  asyncHandler(listMembers)
);

companiesRouter.delete(
  "/members/:userId",
  requireAuth(),
  requireCompaniesAccess,
  validateRequest(removeMemberSchema),
  asyncHandler(removeMember)
);

// ── Admins (Mathesis admin only) ──────────────────────────────────────────────
companiesRouter.get(
  "/admins",
  requireAuth("admin"),
  validateRequest(listAdminsSchema),
  asyncHandler(listAdmins)
);

companiesRouter.get(
  "/admins/search",
  requireAuth("admin"),
  validateRequest(searchEligibleAdminsSchema),
  asyncHandler(searchEligibleAdmins)
);

companiesRouter.post(
  "/admins/:userId",
  requireAuth("admin"),
  validateRequest(setAdminSchema),
  asyncHandler(setAdmin)
);

companiesRouter.delete(
  "/admins/:userId",
  requireAuth("admin"),
  validateRequest(removeAdminSchema),
  asyncHandler(removeAdmin)
);

export { companiesRouter };
